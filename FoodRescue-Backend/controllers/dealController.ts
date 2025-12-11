import { Request, Response } from 'express';
import { Deal } from '../models/deal';
import { Product } from '../models/product';

// GET /api/deals?status=active&isFeatured=true&page=1&limit=20
// List active deals
export const getAllDeals = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      status = 'active',
      isFeatured,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    // Get deals with product details
    const deals = await Deal.find(filter)
      .populate({
        path: 'product',
        select: 'name slug images category pricing inventory seller',
        populate: {
          path: 'seller',
          select: 'email profile.businessName'
        }
      })
      .sort({ isFeatured: -1, startAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Deal.countDocuments(filter);

    return res.json({
      success: true,
      message: 'Deals fetched successfully',
      data: {
        deals,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get all deals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching deals'
    });
  }
};

// GET /api/deals/:id
// Get deal details by ID
export const getDealById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const deal = await Deal.findById(id)
      .populate({
        path: 'product',
        select: 'name slug images category pricing inventory seller description',
        populate: [
          {
            path: 'seller',
            select: 'email profile.businessName profile.address'
          },
          {
            path: 'category',
            select: 'name slug'
          }
        ]
      })
      .populate({
        path: 'createdBy',
        select: 'email firstName lastName'
      });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Calculate remaining units
    const remainingUnits = deal.maxUnits - deal.soldUnits - deal.reservedUnits;

    return res.json({
      success: true,
      message: 'Deal fetched successfully',
      data: {
        ...deal.toObject(),
        remainingUnits
      }
    });
  } catch (error) {
    console.error('Get deal by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching deal'
    });
  }
};

// POST /api/deals
// Create time-limited offer (seller only)
export const createDeal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    // Check if user is seller or admin
    if (!userRole || (userRole !== 'seller' && userRole !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can create deals'
      });
    }

    const {
      title,
      product: productId,
      dealPrice,
      discountPercentage,
      maxUnits,
      perUserLimit,
      startAt,
      endAt,
      description,
      heroImage,
      isFeatured
    } = req.body;

    // Validate required fields
    if (!title || !productId || !maxUnits) {
      return res.status(400).json({
        success: false,
        message: 'Title, product, and maxUnits are required'
      });
    }

    // Check if product exists and belongs to seller
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify product ownership (sellers only, admins can create for any product)
    if (userRole === 'seller' && (product as any).seller.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create deals for your own products'
      });
    }

    // Validate deal price or discount percentage
    if (!dealPrice && !discountPercentage) {
      return res.status(400).json({
        success: false,
        message: 'Either dealPrice or discountPercentage is required'
      });
    }

    // Calculate deal price if only discount percentage provided
    let finalDealPrice = dealPrice;
    if (!dealPrice && discountPercentage && product.pricing?.retail?.price) {
      finalDealPrice = Math.round(product.pricing.retail.price * (1 - discountPercentage / 100));
    }

    // Validate dates
    const now = new Date();
    const dealStartAt = startAt ? new Date(startAt) : now;
    const dealEndAt = endAt ? new Date(endAt) : undefined;

    if (dealEndAt && dealEndAt <= dealStartAt) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Determine initial status
    const status = Deal.determineStatus({
      startAt: dealStartAt,
      endAt: dealEndAt,
      soldUnits: 0,
      maxUnits
    });

    // Create deal
    const deal = new Deal({
      title,
      product: productId,
      dealPrice: finalDealPrice,
      discountPercentage,
      maxUnits,
      perUserLimit: perUserLimit || 1,
      startAt: dealStartAt,
      endAt: dealEndAt,
      status,
      soldUnits: 0,
      reservedUnits: 0,
      description,
      heroImage,
      isFeatured: isFeatured || false,
      createdBy: userId
    });

    await deal.save();

    // Populate product details
    await deal.populate({
      path: 'product',
      select: 'name slug images category pricing'
    });

    return res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: deal
    });
  } catch (error) {
    console.error('Create deal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating deal'
    });
  }
};

// PUT /api/deals/:id
// Update deal (seller only)
export const updateDeal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    // Check if user is seller or admin
    if (!userRole || (userRole !== 'seller' && userRole !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can update deals'
      });
    }

    // Find deal with product
    const deal = await Deal.findById(id).populate('product');
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Verify ownership (sellers only, admins can update any deal)
    if (userRole === 'seller') {
      const product = deal.product as any;
      if (product.seller.toString() !== userId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own deals'
        });
      }
    }

    // Cannot update cancelled or ended deals
    if (deal.status === 'cancelled' || deal.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${deal.status} deals`
      });
    }

    const {
      title,
      dealPrice,
      discountPercentage,
      maxUnits,
      perUserLimit,
      startAt,
      endAt,
      description,
      heroImage,
      isFeatured,
      status
    } = req.body;

    // Update fields
    if (title) deal.title = title;
    if (dealPrice !== undefined) deal.dealPrice = dealPrice;
    if (discountPercentage !== undefined) deal.discountPercentage = discountPercentage;
    if (maxUnits !== undefined) deal.maxUnits = maxUnits;
    if (perUserLimit !== undefined) deal.perUserLimit = perUserLimit;
    if (startAt) deal.startAt = new Date(startAt);
    if (endAt) deal.endAt = new Date(endAt);
    if (description !== undefined) deal.description = description;
    if (heroImage !== undefined) deal.heroImage = heroImage;
    if (isFeatured !== undefined) deal.isFeatured = isFeatured;

    // Update status if provided, otherwise recalculate
    if (status) {
      deal.status = status;
    } else {
      deal.status = Deal.determineStatus({
        startAt: deal.startAt,
        endAt: deal.endAt,
        soldUnits: deal.soldUnits,
        maxUnits: deal.maxUnits,
        status: deal.status
      });
    }

    await deal.save();

    // Populate product details
    await deal.populate({
      path: 'product',
      select: 'name slug images category pricing'
    });

    return res.json({
      success: true,
      message: 'Deal updated successfully',
      data: deal
    });
  } catch (error) {
    console.error('Update deal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating deal'
    });
  }
};

// DELETE /api/deals/:id
// Delete/cancel deal (seller only)
export const deleteDeal = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    // Check if user is seller or admin
    if (!userRole || (userRole !== 'seller' && userRole !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Only sellers can delete deals'
      });
    }

    // Find deal with product
    const deal = await Deal.findById(id).populate('product');
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Verify ownership (sellers only, admins can delete any deal)
    if (userRole === 'seller') {
      const product = deal.product as any;
      if (product.seller.toString() !== userId?.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own deals'
        });
      }
    }

    // If deal is active or scheduled, cancel it instead of deleting
    if (deal.status === 'active' || deal.status === 'scheduled') {
      deal.status = 'cancelled';
      deal.cancelledAt = new Date();
      await deal.save();

      return res.json({
        success: true,
        message: 'Deal cancelled successfully',
        data: deal
      });
    }

    // Otherwise, permanently delete
    await Deal.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Deal deleted successfully',
      data: {
        dealId: id,
        title: deal.title
      }
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting deal'
    });
  }
};

// GET /api/deals/restaurant/:restaurantId
// Get restaurant's deals
export const getRestaurantDeals = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { restaurantId } = req.params;
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get all products from this restaurant
    const products = await Product.find({ seller: restaurantId }).select('_id');
    const productIds = products.map((p: any) => p._id);

    if (productIds.length === 0) {
      return res.json({
        success: true,
        message: 'No deals found',
        data: {
          deals: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Build filter
    const filter: any = {
      product: { $in: productIds }
    };

    if (status) {
      filter.status = status;
    }

    // Get deals
    const deals = await Deal.find(filter)
      .populate({
        path: 'product',
        select: 'name slug images category pricing'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Deal.countDocuments(filter);

    return res.json({
      success: true,
      message: 'Restaurant deals fetched successfully',
      data: {
        deals,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get restaurant deals error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching restaurant deals'
    });
  }
};
