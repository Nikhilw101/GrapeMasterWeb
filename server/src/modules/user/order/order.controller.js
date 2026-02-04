import orderService from './order.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../../utils/apiResponse.js';

// @desc    Place new order from cart
// @route   POST /api/orders
// @access  Private
export const placeOrder = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const orderData = req.body;

    const result = await orderService.createOrderFromCart(userId, orderData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, result.message, 201);
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await orderService.getOrdersByUser(userId);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Orders fetched successfully');
});

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const result = await orderService.getOrderDetails(orderId, userId);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Order details fetched successfully');
});

// @desc    Cancel order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    const result = await orderService.cancelUserOrder(orderId, userId);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Order cancelled successfully');
});
