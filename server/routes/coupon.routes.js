import { Router } from 'express';
import { 
  createCoupon, 
  getAllCoupons, 
  updateCoupon, 
  deleteCoupon, 
  applyCoupon 
} from '../controllers/coupon.controller.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Apply Coupon (available to logged-in users)
router.post('/apply', verifyJWT, applyCoupon);

// Administrative CRUD operations (Admin Only)
router.post('/', verifyJWT, authorizeRoles('admin'), createCoupon);
router.get('/', verifyJWT, authorizeRoles('admin'), getAllCoupons);
router.put('/:id', verifyJWT, authorizeRoles('admin'), updateCoupon);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), deleteCoupon);

export default router;
