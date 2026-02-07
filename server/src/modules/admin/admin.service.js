import crypto from 'crypto';
import Admin from './admin.model.js';
import User from '../user/user.model.js';
import Order from '../user/order/order.model.js';
import DealerRequest from '../dealer/dealer.model.js';
import { generateTokenPair } from '../../utils/jwt.util.js';
import { sendAdminPasswordResetEmail, sendAdminPasswordResetSuccessEmail } from '../../utils/email.util.js';
import { ADMIN_RESET_PASSWORD_URL, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_NAME, INITIAL_ADMIN_MOBILE } from '../../config/env.js';
import { ORDER_STATUS, USER_ROLES, PAYMENT_STATUS, PAYMENT_METHODS } from '../../utils/constants.js';
import {
    effectiveOrderFilter,
    revenueMatch,
    revenueEligibleCond,
    pendingOrdersFilter,
    EFFECTIVE_ORDER_STATUSES
} from '../../utils/orderStats.util.js';
import logger from '../../utils/logger.js';

// Seed initial admin (one-time: only when no admins exist; uses env INITIAL_ADMIN_*)
const seedInitialAdmin = async () => {
    try {
        const count = await Admin.countDocuments();
        if (count > 0) {
            return { success: false, message: 'Admin already exists. Login with your DB credentials.' };
        }
        if (!INITIAL_ADMIN_EMAIL || !INITIAL_ADMIN_PASSWORD) {
            return { success: false, message: 'Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in .env for first-time setup.' };
        }
        await Admin.create({
            name: INITIAL_ADMIN_NAME,
            email: INITIAL_ADMIN_EMAIL.toLowerCase().trim(),
            mobile: (INITIAL_ADMIN_MOBILE || '0000000000').replace(/\D/g, '').slice(0, 10) || '0000000000',
            password: INITIAL_ADMIN_PASSWORD
        });
        logger.info('Initial admin created. Change password after first login if needed.');
        return { success: true, message: 'Initial admin created. You can now log in with that email and password. Change them in Settings after first login.' };
    } catch (error) {
        logger.error(`Seed initial admin error: ${error.message}`);
        throw error;
    }
};

// Admin login (always from DB – email + password; no hardcoded env after seed)
const loginAdmin = async (email, password) => {
    const admin = await Admin.findOne({ email: email?.toLowerCase?.()?.trim() }).select('+password');

    if (!admin) {
        logger.warn('Admin login failed: no admin found for email');
        return { success: false, message: 'Invalid email or password.' };
    }

    if (!admin.isActive) {
        logger.warn('Admin login failed: account deactivated');
        return { success: false, message: 'Your admin account is deactivated. Contact support.' };
    }

    const isPasswordMatch = await admin.comparePassword(password);
    if (!isPasswordMatch) {
        logger.warn('Admin login failed: wrong password');
        return { success: false, message: 'Invalid email or password.' };
    }

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
};

// Get dashboard statistics (structured: effective orders, revenue includes COD delivered/completed, excluded cancelled/rejected)
const getDashboardStats = async () => {
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        last7Days.setHours(0, 0, 0, 0);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const totalOrders = await Order.countDocuments(effectiveOrderFilter);
        const totalOrdersRaw = await Order.countDocuments();

        // Total users = customers only (role from constants)
        const totalUsers = await User.countDocuments({ role: USER_ROLES.CUSTOMER });
        const pendingOrders = await Order.countDocuments(pendingOrdersFilter);

        // Total Revenue: effective orders that are paid (online success OR COD delivered/completed)
        const revenueResult = await Order.aggregate([
            { $match: revenueMatch },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        const salesTrendMatch = { createdAt: { $gte: last7Days }, ...revenueMatch };
        const salesTrend = await Order.aggregate([
            { $match: salesTrendMatch },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    sales: { $sum: '$pricing.total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const topProducts = await Order.aggregate([
            { $match: revenueMatch },
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

        const recentOrders = await Order.find(effectiveOrderFilter)
            .populate('user', 'name mobile')
            .sort({ createdAt: -1 })
            .limit(5);

        const cancelledOrders = await Order.countDocuments({ orderStatus: ORDER_STATUS.CANCELLED });
        const rejectedOrders = await Order.countDocuments({ orderStatus: ORDER_STATUS.REJECTED });
        const effectiveTotal = totalOrders;
        const cancellationRate = totalOrdersRaw > 0 ? Number((((cancelledOrders + rejectedOrders) / totalOrdersRaw) * 100).toFixed(1)) : 0;

        const dealerPending = await DealerRequest.countDocuments({ status: 'pending' });
        const dealerTotal = await DealerRequest.countDocuments();

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, role: USER_ROLES.CUSTOMER } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const ordersOverTime = await Order.aggregate([
            { $match: { createdAt: { $gte: last7Days }, ...effectiveOrderFilter } },
            { $addFields: { _revenueAmount: revenueEligibleCond } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$_revenueAmount' } } },
            { $sort: { _id: 1 } }
        ]);

        return {
            success: true,
            data: {
                stats: {
                    totalOrders: effectiveTotal,
                    totalOrdersRaw,
                    totalUsers,
                    pendingOrders,
                    totalRevenue,
                    cancelledOrders,
                    rejectedOrders,
                    cancellationRate,
                    dealerPending,
                    dealerTotal
                },
                analytics: {
                    salesTrend,
                    topProducts,
                    ordersOverTime,
                    userGrowth
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

        // Get users with order statistics using aggregation
        const usersWithStats = await User.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: startIndex },
            { $limit: limit },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    orderCount: {
                        $size: {
                            $filter: {
                                input: '$orders',
                                as: 'o',
                                cond: { $in: ['$$o.orderStatus', EFFECTIVE_ORDER_STATUSES] }
                            }
                        }
                    },
                    totalSpent: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$orders',
                                        as: 'order',
                                        cond: {
                                            $and: [
                                                { $in: ['$$order.orderStatus', EFFECTIVE_ORDER_STATUSES] },
                                                {
                                                    $or: [
                                                        { $eq: ['$$order.paymentStatus', PAYMENT_STATUS.SUCCESS] },
                                                        {
                                                            $and: [
                                                                { $eq: ['$$order.paymentMethod', PAYMENT_METHODS.COD] },
                                                                { $in: ['$$order.orderStatus', [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED]] }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                },
                                as: 'order',
                                in: '$$order.pricing.total'
                            }
                        }
                    },
                    lastOrderDate: {
                        $max: '$orders.createdAt'
                    }
                }
            },
            {
                $project: {
                    password: 0,
                    refreshToken: 0,
                    resetPasswordToken: 0,
                    resetPasswordExpire: 0,
                    orders: 0
                }
            }
        ]);

        return {
            success: true,
            data: {
                users: usersWithStats,
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

// Get user by ID with detailed information
const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId).select('-password -refreshToken');

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Get order statistics (effective orders only; totalSpent = revenue-eligible same as dashboard)
        const orderStats = await Order.aggregate([
            { $match: { user: user._id, ...effectiveOrderFilter } },
            { $addFields: { _revenueAmount: revenueEligibleCond } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$_revenueAmount' },
                    lastOrderDate: { $max: '$createdAt' }
                }
            }
        ]);

        // Get recent orders
        const recentOrders = await Order.find({ user: userId })
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('orderId orderStatus pricing createdAt paymentStatus');

        const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };

        return {
            success: true,
            data: {
                user,
                statistics: {
                    orderCount: stats.totalOrders,
                    totalSpent: stats.totalSpent,
                    lastOrderDate: stats.lastOrderDate,
                    averageOrderValue: stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0
                },
                recentOrders
            }
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

// Forgot password (mail-based): send reset link to admin email
const forgotPasswordAdmin = async (email) => {
    try {
        const admin = await Admin.findOne({ email: email?.toLowerCase?.() || email });

        if (!admin) {
            return {
                success: true,
                message: 'If an admin account exists with this email, a password reset link has been sent.'
            };
        }

        if (!admin.isActive) {
            return {
                success: true,
                message: 'If an admin account exists with this email, a password reset link has been sent.'
            };
        }

        const resetToken = admin.generateResetPasswordToken();
        await admin.save({ validateBeforeSave: false });

        const resetUrl = `${ADMIN_RESET_PASSWORD_URL}?token=${resetToken}`;
        const emailResult = await sendAdminPasswordResetEmail(admin.email, resetUrl, admin.name);

        if (!emailResult.success) {
            admin.resetPasswordToken = undefined;
            admin.resetPasswordExpire = undefined;
            await admin.save({ validateBeforeSave: false });
            throw new Error('Failed to send reset email. Please try again.');
        }

        return {
            success: true,
            message: 'Password reset link has been sent to your email.'
        };
    } catch (error) {
        logger.error(`Admin forgot password error: ${error.message}`);
        throw error;
    }
};

// Reset password (mail-based): validate token and set new password
const resetPasswordAdmin = async (token, newPassword) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const admin = await Admin.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password +resetPasswordToken +resetPasswordExpire');

        if (!admin) {
            throw new Error('Invalid or expired reset link. Please request a new password reset.');
        }

        admin.password = newPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpire = undefined;
        await admin.save();

        if (admin.email) {
            await sendAdminPasswordResetSuccessEmail(admin.email, admin.name).catch(err =>
                logger.error(`Admin reset success email error: ${err.message}`)
            );
        }

        return {
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.'
        };
    } catch (error) {
        logger.error(`Admin reset password error: ${error.message}`);
        throw error;
    }
};

// Change admin password (when logged in: old password + new password)
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
    seedInitialAdmin,
    loginAdmin,
    forgotPasswordAdmin,
    resetPasswordAdmin,
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserStatus,
    changePassword
};
