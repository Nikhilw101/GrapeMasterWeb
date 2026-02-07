import orderService from './order.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../../utils/apiResponse.js';

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Orders fetched successfully');
});

// @desc    Get order by ID
// @route   GET /api/admin/orders/:orderId
// @access  Private/Admin
export const getOrder = asyncHandler(async (req, res) => {
    const result = await orderService.getOrderById(req.params.orderId);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Order fetched successfully');
});

// @desc    Approve order
// @route   PUT /api/admin/orders/:orderId/approve
// @access  Private/Admin
export const approveOrder = asyncHandler(async (req, res) => {
    const { note } = req.body;
    const adminId = req.user.id;
    const result = await orderService.approveOrder(req.params.orderId, adminId, note);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, result.message);
});

// @desc    Reject order
// @route   PUT /api/admin/orders/:orderId/reject
// @access  Private/Admin
export const rejectOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const adminId = req.user.id;
    const result = await orderService.rejectOrder(req.params.orderId, adminId, reason);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, result.message);
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:orderId/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const result = await orderService.updateOrderStatus(req.params.orderId, status, note);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, result.message);
});

// @desc    Delete order (sets to cancelled – excluded from dashboard revenue and counts)
// @route   DELETE /api/admin/orders/:orderId
// @access  Private/Admin
export const deleteOrder = asyncHandler(async (req, res) => {
    const adminId = req.user.id;
    const result = await orderService.deleteOrder(req.params.orderId, adminId);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, result.message);
});

// @desc    Get order statistics
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
    const result = await orderService.getOrderStats();

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Order statistics fetched successfully');
});
