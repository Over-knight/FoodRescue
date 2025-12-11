import express from 'express';
import { matchFoods, getRecommendations, getPricingSuggestion } from '../controllers/aiController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

// POST /api/ai/match-foods - Smart food matching algorithm (public)
router.post('/match-foods', matchFoods);

// GET /api/ai/recommendations/:userId - Personalized recommendations (protected)
router.get('/recommendations/:userId', authenticateToken, getRecommendations);

// POST /api/ai/pricing-suggestion - AI pricing recommendations (protected)
router.post('/pricing-suggestion', authenticateToken, getPricingSuggestion);

export default router;
