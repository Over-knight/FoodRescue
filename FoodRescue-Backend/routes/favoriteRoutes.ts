import express from 'express';
import { toggleFavorite, getFavorites } from '../controllers/favoriteController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/favorites/:productId - Toggle favorite (add/remove)
router.post('/:productId', toggleFavorite);

// GET /api/favorites - Get user's favorites with pagination
router.get('/', getFavorites);

export default router;
