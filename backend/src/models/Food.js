const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a food name'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please add original price'],
  },
  discountedPrice: {
    type: Number,
    required: [true, 'Please add discounted price'],
  },
  discountPercent: {
    type: Number,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
  },
  quantityType: {
    type: String,
    default: 'portions',
  },
  expiryTime: {
    type: Date,
    required: [true, 'Please add expiry time'],
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400',
  },
  category: {
    type: String,
    default: 'General',
  },
  foodType: {
    type: String,
    enum: ['cooked', 'produce', 'packaged', 'bakery', 'dairy', 'other'],
    default: 'cooked',
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'sold-out', 'expired'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Food', FoodSchema);
