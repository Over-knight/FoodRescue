const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   PATCH /api/users/profile
// @desc    Update user profile (budget, preferences, etc.)
// @access  Private
router.patch('/profile', protect, async (req, res) => {
  try {
    const { budget, preferences } = req.body;

    // Find user and update
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update fields if provided
    if (budget !== undefined) {
      user.budget = budget;
    }
    if (preferences !== undefined) {
      user.preferences = preferences;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        budget: user.budget,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        budget: user.budget,
        preferences: user.preferences,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
