import { Router } from 'express';
import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getRestaurantDeals
} from '../controllers/dealController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
// GET /api/deals?status=active&isFeatured=true&page=1&limit=20 - List active deals
router.get('/', getAllDeals);

// GET /api/deals/:id - Get deal details
router.get('/:id', getDealById);

// GET /api/deals/restaurant/:restaurantId - Get restaurant's deals
router.get('/restaurant/:restaurantId', getRestaurantDeals);

// Protected routes (seller/admin only)
// POST /api/deals - Create time-limited offer
router.post('/', authenticateToken, createDeal);

// PUT /api/deals/:id - Update deal
router.put('/:id', authenticateToken, updateDeal);

// DELETE /api/deals/:id - Delete/cancel deal
router.delete('/:id', authenticateToken, deleteDeal);

export default router;
