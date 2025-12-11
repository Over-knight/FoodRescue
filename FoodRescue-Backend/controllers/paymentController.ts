import { Request, Response } from 'express';
import { Order } from '../models/order';
import paystack from '../config/paystack';
import mongoose from 'mongoose';

interface PopulatedCustomer {
  _id: mongoose.Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
}

// POST /api/payments/initialize/:orderId - Initialize payment
export const initializePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
      return;
    }

    // Find the order
    const order = await Order.findById(orderId).populate<{ customer: PopulatedCustomer }>('customer', 'email firstName lastName');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Verify ownership
    if (order.customer._id.toString() !== userId.toString()) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to pay for this order'
      });
      return;
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Order has already been paid'
      });
      return;
    }

    // Check if order is cancelled
    if (order.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Cannot pay for a cancelled order'
      });
      return;
    }

    // Initialize payment with Paystack
    const response = await paystack.initializeTransaction(
      order.customer.email,
      order.totalAmount,
      order.orderNumber,
      {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerId: order.customer._id.toString(),
        customerName: `${order.customer.firstName} ${order.customer.lastName}`
      }
    );

    if (response.status && response.data) {
      // Update order with payment reference
      order.paymentReference = response.data.reference;
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          authorizationUrl: response.data.authorization_url,
          accessCode: response.data.access_code,
          reference: response.data.reference
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to initialize payment'
      });
    }

  } catch (error: any) {
    console.error('Initialize payment error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
};

// GET /api/payments/verify/:reference - Verify payment
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
      return;
    }

    // Verify payment with Paystack
    const response = await paystack.verifyTransaction(reference);

    if (!response.status || !response.data) {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
      return;
    }

    const paymentData = response.data;

    // Find order by reference (orderNumber)
    const order = await Order.findOne({ orderNumber: reference });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check payment status from Paystack
    if (paymentData.status === 'success') {
      // Update order payment status
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.paymentReference = paymentData.reference;
      
      // Confirm the order if it's still pending
      if (order.status === 'pending') {
        order.status = 'confirmed';
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus,
          paidAmount: paymentData.amount / 100, // Convert back from kobo to naira
          paidAt: order.paidAt,
          reference: paymentData.reference
        }
      });
    } else if (paymentData.status === 'failed') {
      // Update order payment status to failed
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: order.paymentStatus
        }
      });
    } else {
      res.status(200).json({
        success: false,
        message: `Payment status: ${paymentData.status}`,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentStatus: paymentData.status
        }
      });
    }

  } catch (error: any) {
    console.error('Verify payment error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};
