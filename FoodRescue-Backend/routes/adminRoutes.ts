import { Router } from 'express';
import {
  getAllUsers,
  changeUserRole,
  changeUserStatus,
  deleteUser,
  getPendingRestaurants,
  verifyRestaurant
} from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// User Management
// GET /api/admin/users?role=customer|seller|admin&status=active|inactive&page=1&limit=20&search=
router.get('/users', getAllUsers);

// PATCH /api/admin/users/:id/role - Change user role
router.patch('/users/:id/role', changeUserRole);

// PATCH /api/admin/users/:id/status - Activate/deactivate user
router.patch('/users/:id/status', changeUserStatus);

// DELETE /api/admin/users/:id - Delete user account
router.delete('/users/:id', deleteUser);

// Restaurant Verification
// GET /api/admin/restaurants/pending - List unverified restaurants
router.get('/restaurants/pending', getPendingRestaurants);

// PATCH /api/admin/restaurants/:id/verify - Approve/reject restaurant
router.patch('/restaurants/:id/verify', verifyRestaurant);

export default router;
