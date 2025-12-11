import { Request, Response } from 'express';
import { Favorite } from '../models/favorite';
import { Product } from '../models/product';
import mongoose from 'mongoose';

// POST /api/favorites/:productId - Toggle favorite (add/remove)
export const toggleFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID'
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

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      user: userId,
      product: productId
    });

    if (existingFavorite) {
      // Remove from favorites
      await existingFavorite.deleteOne();
      
      res.status(200).json({
        success: true,
        message: 'Product removed from favorites',
        data: {
          isFavorite: false
        }
      });
    } else {
      // Add to favorites
      const favorite = new Favorite({
        user: userId,
        product: productId
      });
      
      await favorite.save();
      
      res.status(201).json({
        success: true,
        message: 'Product added to favorites',
        data: {
          isFavorite: true
        }
      });
    }

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite'
    });
  }
};

// GET /api/favorites - Get user's favorite products
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get favorites with product details
    const [favorites, total] = await Promise.all([
      Favorite.find({ user: userId })
        .populate({
          path: 'product',
          select: 'name description images pricing inventory status expiryDate slug restaurant category',
          populate: [
            { path: 'restaurant', select: 'firstName lastName businessName' },
            { path: 'category', select: 'name slug' }
          ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      
      Favorite.countDocuments({ user: userId })
    ]);

    // Filter out favorites with deleted products
    const validFavorites = favorites.filter(f => f.product);

    // Format response
    const products = validFavorites.map(f => ({
      ...f.product,
      favoritedAt: f.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'Favorites retrieved successfully',
      data: {
        favorites: products,
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
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve favorites'
    });
  }
};
