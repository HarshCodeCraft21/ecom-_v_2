import { Coupon } from '../models/coupon.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * @desc    Create a new coupon (Admin Only)
 * @route   POST /api/v1/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minCartAmount, expiryDate, isActive } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    throw new ApiError(400, "Coupon code, discount type, and discount value are required");
  }

  // Check duplicate coupon code
  const uppercaseCode = code.trim().toUpperCase();
  const existingCoupon = await Coupon.findOne({ code: uppercaseCode });
  if (existingCoupon) {
    throw new ApiError(409, `Coupon with code '${uppercaseCode}' already exists.`);
  }

  const coupon = await Coupon.create({
    code: uppercaseCode,
    discountType,
    discountValue: Number(discountValue),
    minCartAmount: minCartAmount ? Number(minCartAmount) : 0,
    expiryDate: expiryDate || undefined,
    isActive: isActive !== undefined ? isActive : true
  });

  return res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

/**
 * @desc    Get all coupons (Admin Only)
 * @route   GET /api/v1/coupons
 * @access  Private/Admin
 */
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons retrieved successfully"));
});

/**
 * @desc    Update an existing coupon (Admin Only)
 * @route   PUT /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, discountType, discountValue, minCartAmount, expiryDate, isActive } = req.body;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (code) {
    const uppercaseCode = code.trim().toUpperCase();
    // Check if renaming to an existing code of ANOTHER coupon
    const duplicate = await Coupon.findOne({ code: uppercaseCode, _id: { $ne: id } });
    if (duplicate) {
      throw new ApiError(409, `Coupon with code '${uppercaseCode}' already exists.`);
    }
    coupon.code = uppercaseCode;
  }

  if (discountType) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
  if (minCartAmount !== undefined) coupon.minCartAmount = Number(minCartAmount);
  
  // Explicitly handle clearing or setting expiryDate
  if (expiryDate !== undefined) {
    coupon.expiryDate = expiryDate || undefined;
  }
  
  if (isActive !== undefined) coupon.isActive = isActive;

  await coupon.save();

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

/**
 * @desc    Delete coupon (Admin Only)
 * @route   DELETE /api/v1/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  await Coupon.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

/**
 * @desc    Apply coupon and calculate discounts (Private/User)
 * @route   POST /api/v1/coupons/apply
 * @access  Private
 */
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  if (!code || cartTotal === undefined) {
    throw new ApiError(400, "Coupon code and cart total are required");
  }

  const uppercaseCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: uppercaseCode });

  if (!coupon) {
    throw new ApiError(404, `Coupon code '${uppercaseCode}' is invalid.`);
  }

  if (!coupon.isActive) {
    throw new ApiError(400, `Coupon code '${uppercaseCode}' is inactive.`);
  }

  // Verify expiry date
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    throw new ApiError(400, `Coupon code '${uppercaseCode}' has expired.`);
  }

  // Verify minimum purchase limit
  const cartTotalNum = Number(cartTotal);
  if (cartTotalNum < coupon.minCartAmount) {
    throw new ApiError(
      400, 
      `Minimum purchase of ₹${coupon.minCartAmount.toFixed(2)} is required to apply this coupon. Your total is ₹${cartTotalNum.toFixed(2)}.`
    );
  }

  // Compute discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = cartTotalNum * (coupon.discountValue / 100);
  } else {
    // Flat discount
    discountAmount = coupon.discountValue;
  }

  // Cap the discount so it does not exceed the order total
  discountAmount = Math.min(discountAmount, cartTotalNum);

  const finalTotal = cartTotalNum - discountAmount;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalTotal
      },
      "Coupon applied successfully"
    )
  );
});
