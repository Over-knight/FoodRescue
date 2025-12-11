import { Request, Response } from 'express';
import { Product } from '../models/product';
import { Category } from '../models/Category';

// GET /api/search/suggestions - Autocomplete suggestions
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
      return;
    }

    const searchQuery = q.trim();
    const limitNum = Math.max(1, Math.min(20, Number(limit)));

    // Search in products and categories
    const [products, categories] = await Promise.all([
      Product.find({
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { tags: { $regex: searchQuery, $options: 'i' } }
        ],
        status: 'active'
      })
        .select('name slug')
        .limit(limitNum)
        .lean(),

      Category.find({
        name: { $regex: searchQuery, $options: 'i' }
      })
        .select('name slug')
        .limit(5)
        .lean()
    ]);

    // Format suggestions
    const suggestions = {
      products: products.map(p => ({
        type: 'product',
        id: p._id,
        name: p.name,
        slug: p.slug
      })),
      categories: categories.map(c => ({
        type: 'category',
        id: c._id,
        name: c.name,
        slug: c.slug
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Search suggestions retrieved successfully',
      data: suggestions
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve search suggestions'
    });
  }
};

// GET /api/search/filters - Get available filter options
export const getSearchFilters = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all categories
    const categories = await Category.find({ isActive: true })
      .select('name slug')
      .sort({ name: 1 })
      .lean();

    // Get price ranges from products
    const priceStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricing.retail.price' },
          maxPrice: { $max: '$pricing.retail.price' }
        }
      }
    ]);

    const minPrice = priceStats[0]?.minPrice || 0;
    const maxPrice = priceStats[0]?.maxPrice || 10000;

    // Define price ranges
    const priceRanges = [
      { label: 'Under ₦1,000', min: 0, max: 1000 },
      { label: '₦1,000 - ₦2,500', min: 1000, max: 2500 },
      { label: '₦2,500 - ₦5,000', min: 2500, max: 5000 },
      { label: '₦5,000 - ₦10,000', min: 5000, max: 10000 },
      { label: 'Above ₦10,000', min: 10000, max: maxPrice }
    ];

    // Get available tags
    const tagResults = await Product.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    const tags = tagResults.map(t => ({
      name: t._id,
      count: t.count
    }));

    // Order type options
    const orderTypes = [
      { value: 'retail', label: 'Retail (Small quantities)' },
      { value: 'bulk', label: 'Bulk (Wholesale)' }
    ];

    // Visibility options
    const visibilityOptions = [
      { value: 'consumer', label: 'Consumer' },
      { value: 'ngo', label: 'NGO' },
      { value: 'both', label: 'Both' }
    ];

    // Sort options
    const sortOptions = [
      { value: 'relevance', label: 'Most Relevant' },
      { value: 'price_asc', label: 'Price: Low to High' },
      { value: 'price_desc', label: 'Price: High to Low' },
      { value: 'newest', label: 'Newest First' },
      { value: 'expiring_soon', label: 'Expiring Soon' },
      { value: 'popular', label: 'Most Popular' }
    ];

    res.status(200).json({
      success: true,
      message: 'Search filters retrieved successfully',
      data: {
        categories,
        priceRanges,
        priceStats: {
          min: minPrice,
          max: maxPrice
        },
        tags,
        orderTypes,
        visibilityOptions,
        sortOptions
      }
    });

  } catch (error) {
    console.error('Get search filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve search filters'
    });
  }
};
