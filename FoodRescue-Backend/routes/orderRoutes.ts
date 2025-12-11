import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getRestaurantOrders,
  confirmOrder,
  markOrderReady,
  completePickup,
  cancelOrder,
  markPaymentSuccess
} from "../controllers/orderController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All order routes require authentication
router.use(authenticateToken);

// Customer routes
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

// Restaurant/seller routes
router.get("/restaurant/orders", getRestaurantOrders);
router.patch("/:id/confirm", confirmOrder);
router.patch("/:id/ready", markOrderReady);
router.patch("/:id/complete", completePickup);

// Payment webhook route
router.post("/:id/payment-success", markPaymentSuccess);

export default router;
