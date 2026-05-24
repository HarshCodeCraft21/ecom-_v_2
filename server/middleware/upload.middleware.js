import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import pkg from 'multer-storage-cloudinary';
import fs from 'fs';
import path from 'path';

const { CloudinaryStorage } = pkg;

// Ensure public/uploads directory exists locally for fallback
const localUploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// 1. Cloudinary Storage Engine
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// 2. Local Disk Storage Engine
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, localUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 3. Custom Fallback Storage Engine
class FallbackStorage {
  constructor(opts) {
    this.cloudinaryStorage = opts.cloudinaryStorage;
    this.diskStorage = opts.diskStorage;
  }

  _handleFile(req, file, cb) {
    // If local storage is explicitly forced, skip Cloudinary
    if (process.env.USE_LOCAL_STORAGE === 'true') {
      return this.diskStorage._handleFile(req, file, cb);
    }

    // Otherwise, attempt Cloudinary upload
    this.cloudinaryStorage._handleFile(req, file, (err, info) => {
      if (err) {
        console.warn('⚠️ Cloudinary upload failed, falling back to local disk storage. Error:', err.message || err);
        // Gracefully fall back to local disk storage
        return this.diskStorage._handleFile(req, file, (diskErr, diskInfo) => {
          if (diskErr) {
            return cb(diskErr);
          }
          // Mark file metadata so we know it was uploaded locally
          diskInfo.isLocal = true;
          cb(null, diskInfo);
        });
      }
      cb(null, info);
    });
  }

  _removeFile(req, file, cb) {
    if (file.isLocal) {
      this.diskStorage._removeFile(req, file, cb);
    } else {
      this.cloudinaryStorage._removeFile(req, file, cb);
    }
  }
}

// File validation filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only image files are allowed (jpeg, png, webp).'), false);
  }
};

// Reusable Multer Upload Middleware using our Fallback Storage
export const upload = multer({
  storage: new FallbackStorage({
    cloudinaryStorage: cloudinaryStorage,
    diskStorage: diskStorage
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Helper utility to delete an old image (supports both Cloudinary and local files)
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  // Don't attempt to delete standard placeholders
  if (imageUrl.includes('placeholder') || imageUrl.includes('via.placeholder') || imageUrl.includes('mock')) {
    return;
  }

  // 1. Handle Local File deletion
  if (imageUrl.includes('/uploads/')) {
    try {
      const filename = imageUrl.split('/uploads/')[1];
      const filePath = path.join(localUploadsDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Successfully deleted local image file:', filename);
      }
    } catch (error) {
      console.error('Failed to delete local image file:', error.message);
    }
    return;
  }

  // 2. Handle Cloudinary Image deletion
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
    console.log('🗑️ Successfully deleted Cloudinary image:', publicId);
  } catch (error) {
    console.error("Failed to delete old image from Cloudinary: ", error.message);
  }
};

