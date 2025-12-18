import express from 'express';
import { 
  matchFoods, 
  getRecommendations, 
  getPricingSuggestion,
  chatWithAI,
  getGeminiRecommendations,
  searchProducts,
  aggregateProducts,
  getWelcomeRecommendations
} from '../controllers/aiController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

// POST /api/ai/match-foods - Smart food matching algorithm (public)
router.post('/match-foods', matchFoods);

// GET /api/ai/recommendations/:userId - Personalized recommendations (protected)
router.get('/recommendations/:userId', authenticateToken, getRecommendations);

// POST /api/ai/pricing-suggestion - AI pricing recommendations (protected)
router.post('/pricing-suggestion', authenticateToken, getPricingSuggestion);

// ========== GEMINI AI ROUTES ==========

// POST /api/ai/chat - Chat with Gemini AI assistant (supports optional auth)
router.post('/chat', optionalAuth, chatWithAI);

// GET /api/ai/gemini-recommendations - Get Gemini-powered recommendations (protected)
router.get('/gemini-recommendations', authenticateToken, getGeminiRecommendations);

// POST /api/ai/search - Smart product search with AI (public)
router.post('/search', searchProducts);

// POST /api/ai/aggregate - Aggregate products for bulk queries (public)
router.post('/aggregate', aggregateProducts);

// GET /api/ai/welcome - Get welcome recommendations (supports optional auth)
router.get('/welcome', optionalAuth, getWelcomeRecommendations);

export default router;
