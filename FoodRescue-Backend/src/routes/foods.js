const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   GET /api/foods
// @desc    Get all active foods
// @access  Public
router.get('/', async (req, res) => {
  try {
    const foods = await Food.find({ status: 'active' })
      .populate('restaurantId', 'name location image')
      .sort('-createdAt');
    
    res.json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/foods/:id
// @desc    Get single food
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('restaurantId');
    
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food not found' });
    }
    
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/foods
// @desc    Create new food listing
// @access  Private (Restaurant only)
router.post('/', protect, authorize('restaurant'), upload.single('image'), async (req, res) => {
  try {
    // Add image URL from Cloudinary if uploaded
    if (req.file) {
      req.body.image = req.file.path; // Cloudinary URL
    }
    
    // Add restaurantId from authenticated user
    req.body.restaurantId = req.user.restaurantId; // Assuming user has restaurantId
    
    const food = await Food.create(req.body);
    
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/foods/:id
// @desc    Update food
// @access  Private (Restaurant only)
router.put('/:id', protect, authorize('restaurant'), async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food not found' });
    }
    
    food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/foods/:id
// @desc    Delete food
// @access  Private (Restaurant only)
router.delete('/:id', protect, authorize('restaurant'), async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food not found' });
    }
    
    await food.deleteOne();
    
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
