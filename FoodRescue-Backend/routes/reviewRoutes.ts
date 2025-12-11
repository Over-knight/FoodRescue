import express from 'express';
import {
  createReview,
  getProductReviews,
  getRestaurantReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes - Get reviews
router.get('/product/:productId', getProductReviews);
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Protected routes - Require authentication
router.post('/', authenticateToken, createReview);
router.put('/:id', authenticateToken, updateReview);
router.delete('/:id', authenticateToken, deleteReview);

export default router;
