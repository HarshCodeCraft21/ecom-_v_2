import { Router } from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from '../controllers/product.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Public reading routes (support pagination, search, category filters, and sorting)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-only modifying routes
router.post(
  '/', 
  verifyJWT, 
  authorizeRoles('admin'), 
  upload.single('image'), 
  createProduct
);

router.put(
  '/:id', 
  verifyJWT, 
  authorizeRoles('admin'), 
  upload.single('image'), 
  updateProduct
);

router.delete(
  '/:id', 
  verifyJWT, 
  authorizeRoles('admin'), 
  deleteProduct
);

export default router;
