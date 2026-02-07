import Order from '../../user/order/order.model.js';
import User from '../../user/user.model.js';
import logger from '../../../utils/logger.js';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../../../utils/constants.js';
import { effectiveOrderFilter, revenueMatch, pendingOrdersFilter } from '../../../utils/orderStats.util.js';
import {
    sendOrderApprovedEmail,
    sendOrderRejectedEmail,
    sendOrderStatusEmail
} from '../../../utils/orderEmail.util.js';

/**
 * Get all orders with filtering
 */
const getAllOrders = async (query) => {
    try {
        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        const filter = {};

        // Filter by order status (support both 'status' and 'orderStatus' for backward compatibility)
        if (query.orderStatus || query.status) {
            filter.orderStatus = query.orderStatus || query.status;
        }

        // Filter by payment status
        if (query.paymentStatus) {
            filter.paymentStatus = query.paymentStatus;
        }

        // Filter by approval status
        if (query.approvalStatus) {
            filter['adminReview.approvalStatus'] = query.approvalStatus;
        }

        // Filter by date range
        if (query.startDate || query.endDate) {
            filter.createdAt = {};
            if (query.startDate) {
                filter.createdAt.$gte = new Date(query.startDate);
            }
            if (query.endDate) {
                filter.createdAt.$lte = new Date(query.endDate);
            }
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('user', 'name mobile email')
            .populate('items.product', 'name price')
            .populate('adminReview.reviewedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        return {
            success: true,
            data: {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        };
    } catch (error) {
        logger.error(`Get all orders error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Get order by ID (admin view)
 */
const getOrderById = async (orderId) => {
    try {
        const order = await Order.findOne({ orderId })
            .populate('user', 'name mobile email')
            .populate('items.product')
            .populate('adminReview.reviewedBy', 'name email');

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        return {
            success: true,
            data: order
        };
    } catch (error) {
        logger.error(`Get order by ID error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Approve order
 */
const approveOrder = async (orderId, adminId, note) => {
    try {
        const order = await Order.findOne({ orderId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.adminReview.approvalStatus === 'approved') {
            return { success: false, message: 'Order is already approved' };
        }

        // Update admin review
        order.adminReview = {
            reviewedBy: adminId,
            reviewedAt: new Date(),
            reviewNote: note || 'Order approved',
            approvalStatus: 'approved'
        };

        order.orderStatus = ORDER_STATUS.APPROVED;
        order.statusHistory.push({
            status: ORDER_STATUS.APPROVED,
            note: note || 'Approved by admin'
        });

        await order.save();

        // Send approval email asynchronously (fire-and-forget)
        User.findById(order.user)
            .then(user => {
                if (user && user.email) {
                    return sendOrderApprovedEmail(user, order);
                }
            })
            .catch(emailError => {
                logger.error(`Approval email error: ${emailError.message}`);
            });

        return {
            success: true,
            data: order,
            message: 'Order approved successfully'
        };
    } catch (error) {
        logger.error(`Approve order error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Reject order
 */
const rejectOrder = async (orderId, adminId, reason) => {
    try {
        const order = await Order.findOne({ orderId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.adminReview.approvalStatus === 'rejected') {
            return { success: false, message: 'Order is already rejected' };
        }

        // Update admin review
        order.adminReview = {
            reviewedBy: adminId,
            reviewedAt: new Date(),
            reviewNote: reason || 'Order rejected',
            approvalStatus: 'rejected'
        };

        order.orderStatus = ORDER_STATUS.REJECTED;
        order.statusHistory.push({
            status: ORDER_STATUS.REJECTED,
            note: reason || 'Rejected by admin'
        });

        await order.save();

        // Send rejection email asynchronously (fire-and-forget)
        User.findById(order.user)
            .then(user => {
                if (user && user.email) {
                    return sendOrderRejectedEmail(user, order, reason);
                }
            })
            .catch(emailError => {
                logger.error(`Rejection email error: ${emailError.message}`);
            });

        return {
            success: true,
            data: order,
            message: 'Order rejected successfully'
        };
    } catch (error) {
        logger.error(`Reject order error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Update order status (dispatched, delivered, etc.)
 */
const updateOrderStatus = async (orderId, status, note) => {
    try {
        const order = await Order.findOne({ orderId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        // Validate status transition
        const validStatuses = Object.values(ORDER_STATUS);
        if (!validStatuses.includes(status)) {
            return { success: false, message: 'Invalid order status' };
        }

        order.orderStatus = status;
        order.statusHistory.push({
            status,
            note: note || `Status updated to ${status}`
        });

        if (status === ORDER_STATUS.DELIVERED) {
            order.deliveryDate = new Date();
            if (order.paymentMethod === 'cod') {
                order.paymentStatus = PAYMENT_STATUS.SUCCESS;
            }
        }
        if (status === ORDER_STATUS.COMPLETED && order.paymentMethod === 'cod') {
            order.paymentStatus = PAYMENT_STATUS.SUCCESS;
        }

        await order.save();

        // Send status update email asynchronously (fire-and-forget)
        // Don't await - let it run in background to avoid blocking the response
        User.findById(order.user)
            .then(user => {
                if (user && user.email) {
                    return sendOrderStatusEmail(user, order, status);
                }
            })
            .catch(emailError => {
                logger.error(`Status email error: ${emailError.message}`);
            });

        return {
            success: true,
            data: order,
            message: 'Order status updated successfully'
        };
    } catch (error) {
        logger.error(`Update order status error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Delete order (admin) – sets order to cancelled so it is excluded from revenue and counts
 */
const deleteOrder = async (orderId, adminId) => {
    try {
        const order = await Order.findOne({ orderId });
        if (!order) {
            return { success: false, message: 'Order not found' };
        }
        order.orderStatus = ORDER_STATUS.CANCELLED;
        order.statusHistory.push({
            status: ORDER_STATUS.CANCELLED,
            note: 'Deleted by admin'
        });
        if (order.adminReview) {
            order.adminReview.reviewedBy = adminId;
            order.adminReview.reviewedAt = new Date();
            order.adminReview.reviewNote = (order.adminReview.reviewNote || '') + ' [Order deleted by admin]';
        } else {
            order.adminReview = {
                reviewedBy: adminId,
                reviewedAt: new Date(),
                reviewNote: 'Order deleted by admin',
                approvalStatus: 'rejected'
            };
        }
        await order.save();
        return { success: true, data: order, message: 'Order deleted. It is now excluded from dashboard counts and revenue.' };
    } catch (error) {
        logger.error(`Delete order error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Get order statistics (single source of truth via orderStats.util; aligned with dashboard)
 */
const getOrderStats = async () => {
    try {
        const totalOrders = await Order.countDocuments(effectiveOrderFilter);
        const pendingOrders = await Order.countDocuments(pendingOrdersFilter);
        const approvedOrders = await Order.countDocuments({
            ...effectiveOrderFilter,
            'adminReview.approvalStatus': 'approved'
        });
        const completedOrders = await Order.countDocuments({ orderStatus: ORDER_STATUS.COMPLETED });

        const totalRevenueResult = await Order.aggregate([
            { $match: revenueMatch },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]);

        return {
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                approvedOrders,
                completedOrders,
                totalRevenue: totalRevenueResult[0]?.total || 0
            }
        };
    } catch (error) {
        logger.error(`Get order stats error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default {
    getAllOrders,
    getOrderById,
    approveOrder,
    rejectOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
};
