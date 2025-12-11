import { Request, Response } from 'express';
import { Review } from '../models/review';
import { Order } from '../models/order';
import { Product } from '../models/product';
import mongoose from 'mongoose';

// POST /api/reviews - Create product review
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { productId, orderId, rating, comment, images } = req.body;

    // Validate required fields
    if (!productId || !orderId || !rating) {
      res.status(400).json({
        success: false,
        message: 'Product ID, Order ID, and rating are required'
      });
      return;
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Verify order exists, belongs to user, is completed, and contains the product
    const order = await Order.findOne({
      _id: orderId,
      customer: userId,
      status: 'completed'
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found or not eligible for review (must be completed)'
      });
      return;
    }

    // Check if product is in the order
    const productInOrder = order.items.some(
      (item: any) => item.product.toString() === productId
    );

    if (!productInOrder) {
      res.status(400).json({
        success: false,
        message: 'Product not found in this order'
      });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      customer: userId
    });

    if (existingReview) {
      res.status(409).json({
        success: false,
        message: 'You have already reviewed this product'
      });
      return;
    }

    // Create review
    const review = new Review({
      product: productId,
      restaurant: product.restaurant,
      customer: userId,
      order: orderId,
      rating,
      comment,
      images: images || []
    });

    await review.save();

    // Populate customer details
    await review.populate('customer', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
};

// GET /api/reviews/product/:productId - Get product reviews
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
      return;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { product: productId, reported: false };
    
    if (rating) {
      filter.rating = Number(rating);
    }

    // Get reviews with statistics
    const [reviews, total, stats] = await Promise.all([
      Review.find(filter)
        .populate('customer', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      
      Review.countDocuments(filter),
      
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId), reported: false } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ])
    ]);

    const statistics = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0
    };

    res.status(200).json({
      success: true,
      message: 'Product reviews retrieved successfully',
      data: {
        reviews,
        statistics: {
          averageRating: Math.round(statistics.averageRating * 10) / 10,
          totalReviews: statistics.totalReviews,
          breakdown: {
            5: statistics.rating5,
            4: statistics.rating4,
            3: statistics.rating3,
            2: statistics.rating2,
            1: statistics.rating1
          }
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product reviews'
    });
  }
};

// GET /api/reviews/restaurant/:restaurantId - Get restaurant reviews
export const getRestaurantReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID'
      });
      return;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { restaurant: restaurantId, reported: false };
    
    if (rating) {
      filter.rating = Number(rating);
    }

    // Get reviews with statistics
    const [reviews, total, stats] = await Promise.all([
      Review.find(filter)
        .populate('customer', 'firstName lastName')
        .populate('product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      
      Review.countDocuments(filter),
      
      Review.aggregate([
        { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId), reported: false } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ])
    ]);

    const statistics = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0
    };

    res.status(200).json({
      success: true,
      message: 'Restaurant reviews retrieved successfully',
      data: {
        reviews,
        statistics: {
          averageRating: Math.round(statistics.averageRating * 10) / 10,
          totalReviews: statistics.totalReviews,
          breakdown: {
            5: statistics.rating5,
            4: statistics.rating4,
            3: statistics.rating3,
            2: statistics.rating2,
            1: statistics.rating1
          }
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get restaurant reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant reviews'
    });
  }
};

// PUT /api/reviews/:id - Update own review
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;
    const { rating, comment, images } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
      return;
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
      return;
    }

    // Find review and verify ownership
    const review = await Review.findOne({
      _id: id,
      customer: userId
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to edit it'
      });
      return;
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images) review.images = images;

    await review.save();

    await review.populate('customer', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
};

// DELETE /api/reviews/:id - Delete own review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid review ID'
      });
      return;
    }

    // Find and delete review (with ownership check)
    const review = await Review.findOneAndDelete({
      _id: id,
      customer: userId
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};
