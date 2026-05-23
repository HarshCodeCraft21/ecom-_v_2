import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import pkg from 'multer-storage-cloudinary';
const { CloudinaryStorage } = pkg;

// Setup Cloudinary storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// File validation filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only image files are allowed (jpeg, png, webp).'), false);
  }
};

// Reusable Multer Upload Middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Helper utility to delete an old image from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  // Don't attempt to delete standard placeholders
  if (imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder') || imageUrl.includes('mock')) {
    return;
  }

  try {
    // Extract the public_id from the Cloudinary URL
    // Format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<filename>.<ext>
    const parts = imageUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return;

    // Slice from the element after the version code to the end
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    
    // Remove the file extension (e.g. .jpg, .png)
    const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete old image from Cloudinary: ", error.message);
  }
};
