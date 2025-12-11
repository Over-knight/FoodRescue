import express from 'express';
import { initializePayment, verifyPayment } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/payments/initialize/:orderId - Initialize payment (authenticated)
router.post('/initialize/:orderId', authenticateToken, initializePayment);

// GET /api/payments/verify/:reference - Verify payment (public - callback from Paystack)
router.get('/verify/:reference', verifyPayment);

export default router;
