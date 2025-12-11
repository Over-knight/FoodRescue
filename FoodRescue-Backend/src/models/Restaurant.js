const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a restaurant name'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    lat: Number,
    lng: Number,
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400',
  },
  rating: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  documents: {
    cac: String,
    nafdac: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
