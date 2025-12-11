import { Request, Response } from 'express';
import { Order, IOrder } from '../models/order';
import { Product } from '../models/product';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { sendPickupOrderConfirmation } from '../services/emailService';

// POST /api/orders - Create new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const customerId = req.user?._id;
    if (!customerId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { items, orderType, scheduledPickupTime, notes } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
      return;
    }

    // Validate all products exist and are available
    const productIds = items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      res.status(404).json({
        success: false,
        message: 'One or more products not found'
      });
      return;
    }

    // Check all products belong to same restaurant
    const restaurantIds = [...new Set(products.map(p => p.restaurant.toString()))];
    if (restaurantIds.length > 1) {
      res.status(400).json({
        success: false,
        message: 'All products must be from the same restaurant'
      });
      return;
    }

    const restaurantId = restaurantIds[0];

    // Build order items and calculate total
    const orderItems: any[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) continue;

      const quantity = item.quantity;

      // Check stock availability
      if (!product.canFulfillOrder(quantity, orderType)) {
        res.status(400).json({
          success: false,
          message: `Product "${product.name}" cannot fulfill order. Check stock and minimum quantity.`
        });
        return;
      }

      // Determine price based on order type
      let unitPrice: number;
      let unit: string;

      if (orderType === 'bulk' && product.pricing.bulkTiers && product.pricing.bulkTiers.length > 0) {
        // Find applicable bulk tier
        const applicableTier = product.pricing.bulkTiers
          .filter(tier => quantity >= tier.minQuantity)
          .sort((a, b) => b.minQuantity - a.minQuantity)[0];

        if (applicableTier) {
          unitPrice = applicableTier.price;
          unit = applicableTier.unit;
        } else {
          unitPrice = product.pricing.retail.price;
          unit = product.pricing.retail.unit;
        }
      } else {
        unitPrice = product.pricing.retail.price;
        unit = product.pricing.retail.unit;
      }

      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity,
        unitPrice,
        unit,
        subtotal
      });
    }

    // Get pickup location from restaurant
    const restaurantProduct = products[0];
    const pickupLocation = restaurantProduct.location || {
      address: 'Restaurant address',
      city: 'City'
    };

    // Create order
    const order = new Order({
      customer: customerId,
      restaurant: restaurantId,
      orderType,
      items: orderItems,
      totalAmount,
      pickupLocation,
      scheduledPickupTime: scheduledPickupTime ? new Date(scheduledPickupTime) : undefined,
      notes
    });

    await order.save();

    // Update product stocks
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.updateStock(item.quantity, 'decrease');
      }
    }

    // Populate order details
    await order.populate('customer', 'firstName lastName email phone');
    await order.populate('restaurant', 'firstName lastName email phone');

    // Send order confirmation email with pickup code
    try {
      await sendPickupOrderConfirmation(
        (order as any).customer.email,
        {
          orderNumber: order.orderNumber,
          pickupCode: order.pickupCode,
          items: order.items,
          totalAmount: order.totalAmount,
          pickupLocation: order.pickupLocation,
          scheduledPickupTime: order.scheduledPickupTime
        }
      );
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// GET /api/orders - Get user's orders
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter: any = { customer: userId };

    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate('restaurant', 'firstName lastName email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// GET /api/orders/:id - Get single order
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
      return;
    }

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email phone')
      .populate('restaurant', 'firstName lastName email phone')
      .populate('items.product', 'name images description');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Check authorization - only customer, restaurant, or admin can view
    const isCustomer = order.customer._id.toString() === userId?.toString();
    const isRestaurant = order.restaurant._id.toString() === userId?.toString();
    const isAdmin = userRole === 'admin';

    if (!isCustomer && !isRestaurant && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
      return;
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// GET /api/orders/restaurant/orders - Get restaurant's orders (seller view)
export const getRestaurantOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const restaurantId = req.user?._id;
    const { status, page = 1, limit = 20 } = req.query;

    if (req.user?.role !== 'seller' && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only sellers can access this endpoint'
      });
      return;
    }

    const filter: any = { restaurant: restaurantId };

    if (status) {
      filter.status = status;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limitNum);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOrders,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get restaurant orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// PATCH /api/orders/:id/confirm - Confirm order (seller only)
export const confirmOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Only restaurant or admin can confirm
    if (order.restaurant.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this order'
      });
      return;
    }

    if (order.status !== 'pending') {
      res.status(400).json({
        success: false,
        message: 'Only pending orders can be confirmed'
      });
      return;
    }

    await order.confirmOrder();

    res.json({
      success: true,
      message: 'Order confirmed successfully',
      data: order
    });

  } catch (error) {
    console.error('Confirm order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm order'
    });
  }
};

// PATCH /api/orders/:id/ready - Mark order ready for pickup (seller only)
export const markOrderReady = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Only restaurant or admin can mark ready
    if (order.restaurant.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
      return;
    }

    try {
      await order.markReadyForPickup();

      res.json({
        success: true,
        message: 'Order marked as ready for pickup',
        data: order
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to mark order ready'
      });
    }

  } catch (error) {
    console.error('Mark order ready error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
};

// PATCH /api/orders/:id/complete - Complete pickup (seller verifies pickup code)
export const completePickup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { pickupCode } = req.body;
    const userId = req.user?._id;

    if (!pickupCode) {
      res.status(400).json({
        success: false,
        message: 'Pickup code is required'
      });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Only restaurant or admin can complete pickup
    if (order.restaurant.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to complete this order'
      });
      return;
    }

    // Verify pickup code
    if (order.pickupCode !== pickupCode.toString()) {
      res.status(400).json({
        success: false,
        message: 'Invalid pickup code'
      });
      return;
    }

    if (order.status !== 'ready_for_pickup') {
      res.status(400).json({
        success: false,
        message: 'Order must be ready for pickup before completing'
      });
      return;
    }

    await order.completePickup();

    res.json({
      success: true,
      message: 'Order completed successfully',
      data: order
    });

  } catch (error) {
    console.error('Complete pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete order'
    });
  }
};

// PATCH /api/orders/:id/cancel - Cancel order
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?._id;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Customer, restaurant, or admin can cancel
    const isCustomer = order.customer.toString() === userId?.toString();
    const isRestaurant = order.restaurant.toString() === userId?.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!isCustomer && !isRestaurant && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
      return;
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: `Order is already ${order.status}`
      });
      return;
    }

    await order.cancelOrder(reason || 'No reason provided');

    // Restore product stocks
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.updateStock(item.quantity, 'increase');
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// POST /api/orders/:id/payment-success - Mark payment as successful (webhook/callback)
export const markPaymentSuccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentReference } = req.body;

    if (!paymentReference) {
      res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    if (order.paymentStatus === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
      return;
    }

    await order.markAsPaid(paymentReference);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: order
    });

  } catch (error) {
    console.error('Mark payment success error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
};
