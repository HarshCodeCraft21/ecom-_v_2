import { Product } from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { deleteFromCloudinary } from '../middleware/upload.middleware.js';

/**
 * @desc    Create a new product (Admin Only)
 * @route   POST /api/v1/products
 * @access  Private/Admin
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, discountedPrice, category } = req.body;
  const imageUrl = req.file 
    ? (req.file.path.startsWith('http') 
        ? req.file.path 
        : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`)
    : undefined;

  if (!title || !description || !price || !category) {
    // If validation fails before creation, clean up uploaded file from Cloudinary
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    throw new ApiError(400, "Title, description, original price, and category are required");
  }

  try {
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : 0,
      category,
      ...(imageUrl && { image: imageUrl })
    });

    const populatedProduct = await Product.findById(product._id).populate("category", "name slug");

    return res
      .status(201)
      .json(new ApiResponse(201, populatedProduct, "Product created successfully"));
  } catch (error) {
    // Clean up newly uploaded image if database creation failed (e.g. invalid category ID or discountedPrice >= price)
    if (imageUrl) await deleteFromCloudinary(imageUrl);
    throw error;
  }
});

/**
 * @desc    Get all products (Public) - with Search, Filter, Pagination, and Sort
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', category = '', sort = 'latest' } = req.query;

  // Build filter query object
  const query = {};

  // Case-insensitive partial text search on title
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // Exact match category filter (category ID)
  if (category) {
    query.category = category;
  }

  // Set sort options
  let sortOption = {};
  if (sort === 'latest') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'priceAsc') {
    sortOption = { price: 1 };
  } else if (sort === 'priceDesc') {
    sortOption = { price: -1 };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  // Retrieve total count for pagination calculations
  const totalProducts = await Product.countDocuments(query);
  
  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          totalProducts,
          totalPages: Math.ceil(totalProducts / limitNum),
          currentPage: pageNum,
          limit: limitNum
        }
      },
      "Products retrieved successfully"
    )
  );
});

/**
 * @desc    Get a single product details (Public)
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id).populate("category", "name slug");
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product details retrieved successfully"));
});

/**
 * @desc    Update an existing product (Admin Only)
 * @route   PUT /api/v1/products/:id
 * @access  Private/Admin
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, price, discountedPrice, category } = req.body;
  const newImageUrl = req.file 
    ? (req.file.path.startsWith('http') 
        ? req.file.path 
        : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`)
    : undefined;

  const product = await Product.findById(id);
  if (!product) {
    if (newImageUrl) await deleteFromCloudinary(newImageUrl);
    throw new ApiError(404, "Product not found");
  }

  const oldImageUrl = product.image;

  try {
    // Apply updates
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (discountedPrice !== undefined) product.discountedPrice = Number(discountedPrice);
    if (category) product.category = category;
    if (newImageUrl) product.image = newImageUrl;

    // Save triggers schema validations
    await product.save();

    // If new image was successfully uploaded, delete old image from Cloudinary
    if (newImageUrl && oldImageUrl) {
      await deleteFromCloudinary(oldImageUrl);
    }

    const updatedProduct = await Product.findById(product._id).populate("category", "name slug");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
  } catch (error) {
    // If database update fails, clean up the newly uploaded image from Cloudinary
    if (newImageUrl) await deleteFromCloudinary(newImageUrl);
    throw error;
  }
});

/**
 * @desc    Delete product (Admin Only)
 * @route   DELETE /api/v1/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const imageUrl = product.image;

  // Delete product from database
  await Product.findByIdAndDelete(id);

  // Clean up associated product image from Cloudinary
  if (imageUrl) {
    await deleteFromCloudinary(imageUrl);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product and its image deleted successfully"));
});
