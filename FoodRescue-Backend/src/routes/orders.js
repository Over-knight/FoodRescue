const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Food = require('../models/Food');
const { protect } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate('foodId', 'name image')
      .populate('restaurantId', 'name location')
      .sort('-createdAt');
    
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    
    // Get food details
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food not found' });
    }
    
    // Check if enough quantity available
    if (food.quantity < quantity) {
      return res.status(400).json({ success: false, error: 'Not enough quantity available' });
    }
    
    // Generate pickup code
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Create order
    const order = await Order.create({
      foodId,
      buyerId: req.user.id,
      restaurantId: food.restaurantId,
      quantity,
      totalPrice: food.discountedPrice * quantity,
      pickupCode,
    });
    
    // Update food quantity
    food.quantity -= quantity;
    if (food.quantity === 0) {
      food.status = 'sold-out';
    }
    await food.save();
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
