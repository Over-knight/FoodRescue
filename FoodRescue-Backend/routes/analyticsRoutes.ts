import { Router } from 'express';
import {
  getRestaurantOverview,
  getRestaurantSales,
  getTopProducts,
  getRevenueByCategory,
  getWasteReduction,
  getPlatformOverview,
  getRestaurantPerformance,
  getPlatformImpact
} from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

// Restaurant Analytics (Seller only)
// GET /api/analytics/restaurant/overview - Dashboard stats
router.get('/restaurant/overview', getRestaurantOverview);

// GET /api/analytics/restaurant/sales?period=daily|weekly|monthly - Sales over time
router.get('/restaurant/sales', getRestaurantSales);

// GET /api/analytics/restaurant/products?limit=10 - Top selling products
router.get('/restaurant/products', getTopProducts);

// GET /api/analytics/restaurant/revenue - Revenue by category
router.get('/restaurant/revenue', getRevenueByCategory);

// GET /api/analytics/restaurant/waste - Waste reduction metrics
router.get('/restaurant/waste', getWasteReduction);

// Platform Analytics (Admin only)
// GET /api/analytics/platform/overview - Platform-wide stats
router.get('/platform/overview', getPlatformOverview);

// GET /api/analytics/platform/restaurants?limit=10&sort=revenue|orders - Restaurant performance
router.get('/platform/restaurants', getRestaurantPerformance);

// GET /api/analytics/platform/impact - Environmental impact
router.get('/platform/impact', getPlatformImpact);

export default router;
