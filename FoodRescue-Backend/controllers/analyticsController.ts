import { Request, Response } from 'express';
import { Order } from '../models/order';
import { Product } from '../models/product';
import User, { IUser } from '../models/user';
import { Category } from '../models/Category';

// GET /api/analytics/restaurant/overview
// Restaurant dashboard stats - total orders, revenue, meals saved, avg rating
export const getRestaurantOverview = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user?._id;
    
    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get all products from this restaurant
    const restaurantProducts = await Product.find({ 
      seller: restaurantId,
      isActive: true 
    }).select('_id');
    
    const productIds = restaurantProducts.map(p => p._id);

    // Get all completed orders for this restaurant
    const completedOrders = await Order.find({
      'items.product': { $in: productIds },
      status: { $in: ['completed', 'ready_for_pickup'] }
    });

    // Calculate metrics
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const totalMealsSaved = completedOrders.reduce((sum, order) => {
      return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    // Get pending orders count
    const pendingOrders = await Order.countDocuments({
      'items.product': { $in: productIds },
      status: 'pending'
    });

    // Get total products
    const totalProducts = await Product.countDocuments({
      seller: restaurantId,
      isActive: true
    });

    // Calculate average rating (mock for now - implement reviews later)
    const avgRating = 4.5; // TODO: Calculate from reviews when implemented

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = await Order.countDocuments({
      'items.product': { $in: productIds },
      status: { $in: ['completed', 'ready_for_pickup'] },
      createdAt: { $gte: today }
    });

    const todayRevenue = completedOrders
      .filter((order: any) => order.createdAt >= today)
      .reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    return res.json({
      success: true,
      message: 'Restaurant overview fetched successfully',
      data: {
        totalOrders,
        totalRevenue: totalRevenue / 100, // Convert from kobo to naira
        totalMealsSaved,
        totalProducts,
        pendingOrders,
        avgRating,
        today: {
          orders: todayOrders,
          revenue: todayRevenue / 100
        }
      }
    });
  } catch (error) {
    console.error('Get restaurant overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching restaurant overview'
    });
  }
};

// GET /api/analytics/restaurant/sales?period=daily|weekly|monthly
// Sales over time
export const getRestaurantSales = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user?._id;
    const { period = 'daily' } = req.query;
    
    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get restaurant products
    const restaurantProducts = await Product.find({ 
      seller: restaurantId 
    }).select('_id');
    
    const productIds = restaurantProducts.map(p => p._id);

    // Determine date range based on period
    let daysBack = 30;
    let groupFormat: any = { $dayOfMonth: '$createdAt' };
    
    if (period === 'weekly') {
      daysBack = 12 * 7; // 12 weeks
      groupFormat = { $week: '$createdAt' };
    } else if (period === 'monthly') {
      daysBack = 365; // 12 months
      groupFormat = { $month: '$createdAt' };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Aggregate sales data
    const salesData = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIds },
          status: { $in: ['completed', 'ready_for_pickup'] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupFormat,
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
          mealsSaved: { 
            $sum: {
              $reduce: {
                input: '$items',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.quantity'] }
              }
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format the response
    const formattedData = salesData.map((item: any) => ({
      period: item._id,
      revenue: item.totalRevenue / 100,
      orders: item.orderCount,
      mealsSaved: item.mealsSaved
    }));

    return res.json({
      success: true,
      message: 'Sales data fetched successfully',
      data: {
        period,
        sales: formattedData
      }
    });
  } catch (error) {
    console.error('Get restaurant sales error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching sales data'
    });
  }
};

// GET /api/analytics/restaurant/products?limit=10
// Top selling products
export const getTopProducts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user?._id;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get restaurant products
    const restaurantProducts = await Product.find({ 
      seller: restaurantId 
    }).select('_id');
    
    const productIds = restaurantProducts.map(p => p._id);

    // Aggregate product sales
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'ready_for_pickup'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.product': { $in: productIds }
        }
      },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $project: {
          productId: '$_id',
          name: '$productDetails.name',
          slug: '$productDetails.slug',
          image: '$productDetails.images.main',
          totalQuantity: 1,
          totalRevenue: { $divide: ['$totalRevenue', 100] },
          orderCount: 1
        }
      }
    ]);

    return res.json({
      success: true,
      message: 'Top products fetched successfully',
      data: {
        products: topProducts
      }
    });
  } catch (error) {
    console.error('Get top products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching top products'
    });
  }
};

// GET /api/analytics/restaurant/revenue
// Revenue by category
export const getRevenueByCategory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user?._id;
    
    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get restaurant products with category
    const restaurantProducts = await Product.find({ 
      seller: restaurantId 
    }).select('_id category').populate('category', 'name');
    
    const productIds = restaurantProducts.map(p => p._id);

    // Aggregate revenue by category
    const revenueByCategory = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'ready_for_pickup'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.product': { $in: productIds }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $unwind: '$productDetails'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productDetails.category',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      {
        $unwind: '$categoryDetails'
      },
      {
        $group: {
          _id: '$categoryDetails._id',
          categoryName: { $first: '$categoryDetails.name' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 },
          itemsSold: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $project: {
          categoryId: '$_id',
          categoryName: 1,
          totalRevenue: { $divide: ['$totalRevenue', 100] },
          orderCount: 1,
          itemsSold: 1
        }
      }
    ]);

    return res.json({
      success: true,
      message: 'Revenue by category fetched successfully',
      data: {
        categories: revenueByCategory
      }
    });
  } catch (error) {
    console.error('Get revenue by category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching revenue by category'
    });
  }
};

// GET /api/analytics/restaurant/waste
// Waste reduction metrics
export const getWasteReduction = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user?._id;
    
    if (!restaurantId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get restaurant products
    const restaurantProducts = await Product.find({ 
      seller: restaurantId 
    }).select('_id');
    
    const productIds = restaurantProducts.map(p => p._id);

    // Calculate total meals saved (completed orders)
    const completedOrders = await Order.find({
      'items.product': { $in: productIds },
      status: { $in: ['completed', 'ready_for_pickup'] }
    });

    const totalMealsSaved = completedOrders.reduce((sum: number, order: any) => {
      return sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
    }, 0);

    // Average weight per meal (kg) - industry standard
    const avgMealWeight = 0.4; // 400g per meal
    const totalWeightSaved = totalMealsSaved * avgMealWeight;

    // CO2 emissions saved (kg) - 2.5 kg CO2 per kg of food waste
    const co2Saved = totalWeightSaved * 2.5;

    // Water saved (liters) - 1000L per kg of food
    const waterSaved = totalWeightSaved * 1000;

    // Money saved for customers (assuming 60% discount on average)
    const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const estimatedOriginalPrice = totalRevenue / 0.4; // If they paid 40% of original
    const moneySavedByCustomers = estimatedOriginalPrice - totalRevenue;

    // Get monthly breakdown for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIds },
          status: { $in: ['completed', 'ready_for_pickup'] },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          mealsSaved: {
            $sum: {
              $reduce: {
                input: '$items',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.quantity'] }
              }
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedMonthlyData = monthlyData.map((item: any) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      mealsSaved: item.mealsSaved,
      weightSaved: item.mealsSaved * avgMealWeight,
      co2Saved: item.mealsSaved * avgMealWeight * 2.5
    }));

    return res.json({
      success: true,
      message: 'Waste reduction metrics fetched successfully',
      data: {
        overview: {
          totalMealsSaved,
          weightSaved: Math.round(totalWeightSaved * 10) / 10,
          co2Saved: Math.round(co2Saved * 10) / 10,
          waterSaved: Math.round(waterSaved),
          moneySavedByCustomers: Math.round(moneySavedByCustomers / 100)
        },
        monthly: formattedMonthlyData
      }
    });
  } catch (error) {
    console.error('Get waste reduction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching waste reduction metrics'
    });
  }
};

// GET /api/analytics/platform/overview
// Admin platform stats
export const getPlatformOverview = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Total users by role
    const totalCustomers = await User.countDocuments({ 
      role: 'customer',
      isActive: true 
    });
    
    const totalSellers = await User.countDocuments({ 
      role: 'seller',
      isActive: true,
      'profile.isVerified': true
    });
    
    const totalNGOs = await User.countDocuments({ 
      role: 'ngo',
      isActive: true 
    });

    const pendingVerification = await User.countDocuments({
      role: 'seller',
      'profile.isVerified': false
    });

    // Total products
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      'inventory.retail.quantity': { $lt: 10 }
    });

    // Total orders
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ 
      status: { $in: ['completed', 'ready_for_pickup'] }
    });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    // Total revenue
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'ready_for_pickup'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'ready_for_pickup'] },
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const todayRevenueAmount = todayRevenue.length > 0 ? todayRevenue[0].revenue : 0;

    return res.json({
      success: true,
      message: 'Platform overview fetched successfully',
      data: {
        users: {
          totalCustomers,
          totalSellers,
          totalNGOs,
          pendingVerification
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders
        },
        revenue: {
          total: totalRevenue / 100,
          today: todayRevenueAmount / 100
        },
        today: {
          orders: todayOrders,
          revenue: todayRevenueAmount / 100
        }
      }
    });
  } catch (error) {
    console.error('Get platform overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching platform overview'
    });
  }
};

// GET /api/analytics/platform/restaurants?limit=10&sort=revenue|orders
// Restaurant performance
export const getRestaurantPerformance = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sort as string || 'revenue';

    // Get all sellers
    const sellers = await User.find({ 
      role: 'seller',
      isActive: true 
    }).select('_id email profile.businessName');

    // Get performance data for each seller
    const performanceData = await Promise.all(
      sellers.map(async (seller: any) => {
        const products = await Product.find({ seller: seller._id }).select('_id');
        const productIds = products.map((p: any) => p._id);

        const orders = await Order.find({
          'items.product': { $in: productIds },
          status: { $in: ['completed', 'ready_for_pickup'] }
        });

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
        const totalMealsSaved = orders.reduce((sum: number, order: any) => {
          return sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
        }, 0);

        const totalProducts = products.length;

        return {
          restaurantId: seller._id,
          restaurantName: (seller.profile as any).businessName || seller.email,
          email: seller.email,
          totalOrders,
          totalRevenue: totalRevenue / 100,
          totalMealsSaved,
          totalProducts
        };
      })
    );

    // Sort based on query
    performanceData.sort((a: any, b: any) => {
      if (sortBy === 'orders') {
        return b.totalOrders - a.totalOrders;
      }
      return b.totalRevenue - a.totalRevenue;
    });

    // Limit results
    const topRestaurants = performanceData.slice(0, limit);

    return res.json({
      success: true,
      message: 'Restaurant performance fetched successfully',
      data: {
        restaurants: topRestaurants,
        sortedBy: sortBy
      }
    });
  } catch (error) {
    console.error('Get restaurant performance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching restaurant performance'
    });
  }
};

// GET /api/analytics/platform/impact
// Environmental impact (CO2, meals saved)
export const getPlatformImpact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get all completed orders
    const completedOrders = await Order.find({
      status: { $in: ['completed', 'ready_for_pickup'] }
    });

    // Calculate total meals saved
    const totalMealsSaved = completedOrders.reduce((sum: number, order: any) => {
      return sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
    }, 0);

    // Environmental calculations
    const avgMealWeight = 0.4; // 400g per meal
    const totalWeightSaved = totalMealsSaved * avgMealWeight;
    const co2Saved = totalWeightSaved * 2.5; // 2.5 kg CO2 per kg
    const waterSaved = totalWeightSaved * 1000; // 1000L per kg
    
    // Money saved by customers
    const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const estimatedOriginalPrice = totalRevenue / 0.4;
    const moneySaved = estimatedOriginalPrice - totalRevenue;

    // Get monthly data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyImpact = await Order.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'ready_for_pickup'] },
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          mealsSaved: {
            $sum: {
              $reduce: {
                input: '$items',
                initialValue: 0,
                in: { $add: ['$$value', '$$this.quantity'] }
              }
            }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' }
                ]
              }
            ]
          },
          mealsSaved: 1,
          weightSaved: { $multiply: ['$mealsSaved', avgMealWeight] },
          co2Saved: { $multiply: ['$mealsSaved', avgMealWeight, 2.5] },
          revenue: { $divide: ['$revenue', 100] }
        }
      }
    ]);

    // Get total restaurants and users contributing
    const activeRestaurants = await User.countDocuments({
      role: 'seller',
      isActive: true,
      'profile.isVerified': true
    });

    const activeCustomers = await User.countDocuments({
      role: 'customer',
      isActive: true
    });

    return res.json({
      success: true,
      message: 'Platform impact fetched successfully',
      data: {
        overview: {
          totalMealsSaved,
          weightSaved: Math.round(totalWeightSaved * 10) / 10,
          co2Saved: Math.round(co2Saved * 10) / 10,
          waterSaved: Math.round(waterSaved),
          moneySaved: Math.round(moneySaved / 100),
          activeRestaurants,
          activeCustomers
        },
        monthly: monthlyImpact,
        equivalents: {
          treesPlanted: Math.round(co2Saved / 21), // 1 tree absorbs ~21kg CO2/year
          carMilesNotDriven: Math.round(co2Saved / 0.404), // 0.404 kg CO2 per mile
          plasticBottlesSaved: Math.round(totalMealsSaved * 2) // Assuming 2 plastic items per meal
        }
      }
    });
  } catch (error) {
    console.error('Get platform impact error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching platform impact'
    });
  }
};
