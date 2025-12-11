import { Request, Response } from 'express';
import User from '../models/user';
import { Product } from '../models/product';
import { Order } from '../models/order';

// GET /api/admin/users?role=customer|seller|admin&status=active|inactive&page=1&limit=20&search=
// List all users with filters
export const getAllUsers = async (
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

    const {
      role,
      status,
      page = '1',
      limit = '20',
      search = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Search by email, firstName, or lastName
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -emailVerificationCode -emailVerificationExpires -passwordResetCode -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    // Get stats for each user (order count, etc.)
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();

        if (user.role === 'seller') {
          // Get seller's products and orders
          const products = await Product.find({ seller: user._id });
          const productIds = products.map((p: any) => p._id);

          const orders = await Order.find({
            'items.product': { $in: productIds },
            status: { $in: ['completed', 'ready_for_pickup'] }
          });

          const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
          const totalOrders = orders.length;

          return {
            ...userObj,
            stats: {
              totalProducts: products.length,
              totalOrders,
              totalRevenue: totalRevenue / 100
            }
          };
        } else if (user.role === 'customer') {
          // Get customer's orders
          const orders = await Order.find({ customer: user._id });
          const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'ready_for_pickup');

          return {
            ...userObj,
            stats: {
              totalOrders: orders.length,
              completedOrders: completedOrders.length
            }
          };
        }

        return userObj;
      })
    );

    return res.json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: usersWithStats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// PATCH /api/admin/users/:id/role
// Change user role (customer, seller, admin)
export const changeUserRole = async (
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

    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!role || !['customer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be customer, seller, or admin'
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user?._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    // Update role
    const oldRole = user.role;
    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: `User role changed from ${oldRole} to ${role}`,
      data: {
        userId: user._id,
        email: user.email,
        oldRole,
        newRole: role
      }
    });
  } catch (error) {
    console.error('Change user role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error changing user role'
    });
  }
};

// PATCH /api/admin/users/:id/status
// Activate or deactivate user account
export const changeUserStatus = async (
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

    const { id } = req.params;
    const { isActive } = req.body;

    // Validate status
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. isActive must be true or false'
      });
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user?._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own account status'
      });
    }

    // Update status
    const oldStatus = user.isActive;
    user.isActive = isActive;
    await user.save();

    // If deactivating a seller, deactivate their products
    if (!isActive && user.role === 'seller') {
      await Product.updateMany(
        { seller: user._id },
        { isActive: false }
      );
    }

    return res.json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        email: user.email,
        oldStatus,
        newStatus: isActive
      }
    });
  } catch (error) {
    console.error('Change user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error changing user status'
    });
  }
};

// DELETE /api/admin/users/:id
// Delete user account permanently
export const deleteUser = async (
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

    const { id } = req.params;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user?._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // If seller, delete their products
    if (user.role === 'seller') {
      await Product.deleteMany({ seller: user._id });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'User account deleted successfully',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// GET /api/admin/restaurants/pending
// List unverified restaurants (sellers)
export const getPendingRestaurants = async (
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

    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Find unverified sellers
    const pendingRestaurants = await User.find({
      role: 'seller',
      'profile.isVerified': false
    })
      .select('-password -emailVerificationCode -emailVerificationExpires -passwordResetCode -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments({
      role: 'seller',
      'profile.isVerified': false
    });

    // Get stats for each restaurant
    const restaurantsWithStats = await Promise.all(
      pendingRestaurants.map(async (restaurant) => {
        const restaurantObj = restaurant.toObject();

        // Get products count
        const productsCount = await Product.countDocuments({
          seller: restaurant._id
        });

        return {
          ...restaurantObj,
          stats: {
            totalProducts: productsCount
          }
        };
      })
    );

    return res.json({
      success: true,
      message: 'Pending restaurants fetched successfully',
      data: {
        restaurants: restaurantsWithStats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get pending restaurants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pending restaurants'
    });
  }
};

// PATCH /api/admin/restaurants/:id/verify
// Approve or reject restaurant verification
export const verifyRestaurant = async (
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

    const { id } = req.params;
    const { isVerified, rejectionReason } = req.body;

    // Validate
    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVerified must be true or false'
      });
    }

    // Find restaurant
    const restaurant = await User.findOne({
      _id: id,
      role: 'seller'
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Update verification status
    restaurant.profile.isVerified = isVerified;

    // If rejected, store reason
    if (!isVerified && rejectionReason) {
      (restaurant as any).rejectionReason = rejectionReason;
    }

    await restaurant.save();

    // TODO: Send email notification to restaurant owner

    return res.json({
      success: true,
      message: `Restaurant ${isVerified ? 'verified' : 'rejected'} successfully`,
      data: {
        restaurantId: restaurant._id,
        email: restaurant.email,
        businessName: (restaurant.profile as any).businessName,
        isVerified,
        ...(rejectionReason && { rejectionReason })
      }
    });
  } catch (error) {
    console.error('Verify restaurant error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying restaurant'
    });
  }
};
