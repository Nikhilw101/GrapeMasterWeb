import Admin from './admin.model.js';
import User from '../user/user.model.js';
import Order from '../user/order/order.model.js';
import Dealer from '../user/dealer/dealer.model.js';
import { generateTokenPair } from '../../utils/jwt.util.js';
import logger from '../../utils/logger.js';

// Admin login
const loginAdmin = async (email, password) => {
    try {
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            throw new Error('Invalid credentials');
        }

        if (!admin.isActive) {
            throw new Error('Admin account is deactivated');
        }

        const isPasswordMatch = await admin.comparePassword(password);
        if (!isPasswordMatch) {
            throw new Error('Invalid credentials');
        }

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = generateTokenPair({
            id: admin._id,
            role: admin.role
        });

        return {
            success: true,
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                },
                accessToken,
                refreshToken
            }
        };
    } catch (error) {
        logger.error(`Admin login error: ${error.message}`);
        throw error;
    }
};

// Get dashboard statistics
const getDashboardStats = async () => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalDealerEnquiries = await Dealer.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'placed' });

        // Calculate Total Revenue (Only successful payments)
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'success' } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Calculate Sales Trend (Last 7 Days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        last7Days.setHours(0, 0, 0, 0);

        const salesTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days },
                    paymentStatus: 'success'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: '$pricing.total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Calculate Top Selling Products
        const topProducts = await Order.aggregate([
            { $match: { paymentStatus: 'success' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.productName' },
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.subtotal' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        const recentOrders = await Order.find()
            .populate('user', 'name mobile')
            .sort({ createdAt: -1 })
            .limit(5);

        return {
            success: true,
            data: {
                stats: {
                    totalOrders,
                    totalUsers,
                    totalDealerEnquiries,
                    pendingOrders,
                    totalRevenue
                },
                analytics: {
                    salesTrend,
                    topProducts
                },
                recentOrders
            }
        };
    } catch (error) {
        logger.error(`Get dashboard stats error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Get all users with pagination and filtering
const getAllUsers = async (query) => {
    try {
        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const filter = {};
        if (query.status) {
            filter.status = query.status;
        }
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: 'i' } },
                { email: { $regex: query.search, $options: 'i' } },
                { mobile: { $regex: query.search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        return {
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        };
    } catch (error) {
        logger.error(`Get all users error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Get user by ID
const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        return {
            success: true,
            data: user
        };
    } catch (error) {
        logger.error(`Get user by ID error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Update user status (block/unblock)
const updateUserStatus = async (userId, status) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Validate status
        if (!['active', 'inactive', 'blocked'].includes(status)) {
            return { success: false, message: 'Invalid status' };
        }

        user.status = status;

        // If blocking/inactivating, force logout by clearing refresh token
        if (status !== 'active') {
            user.refreshToken = null;
        }

        await user.save();

        return {
            success: true,
            data: {
                id: user._id,
                status: user.status,
                message: `User status updated to ${status}`
            }
        };
    } catch (error) {
        logger.error(`Update user status error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Change admin password
const changePassword = async (adminId, oldPassword, newPassword) => {
    try {
        const admin = await Admin.findById(adminId).select('+password');

        if (!admin) {
            return { success: false, message: 'Admin not found' };
        }

        const isMatch = await admin.comparePassword(oldPassword);
        if (!isMatch) {
            return { success: false, message: 'Incorrect current password' };
        }

        admin.password = newPassword;
        await admin.save();

        return {
            success: true,
            message: 'Password updated successfully'
        };
    } catch (error) {
        logger.error(`Change admin password error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default {
    loginAdmin,
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserStatus,
    changePassword
};
