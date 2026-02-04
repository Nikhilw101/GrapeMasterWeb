import orderService from '../order/order.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../../utils/apiResponse.js';
import { handleWebhook } from '../../../utils/stripe.util.js';

// @desc    Initiate payment for order
// @route   POST /api/payments/initiate/:orderId
// @access  Private
export const initiatePayment = asyncHandler(async (req, res) => {
    const result = await orderService.initiateOrderPayment(req.params.orderId, req.user.id);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, result.message);
});

// @desc    Handle Stripe payment webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
export const paymentWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers['stripe-signature'];

    const webhookResult = await handleWebhook(req.body, signature);

    if (!webhookResult.success) {
        return errorResponse(res, webhookResult.message, 400);
    }

    // Update order with payment result
    if (webhookResult.data.eventType === 'payment_success') {
        const result = await orderService.handlePaymentCallback({
            sessionId: webhookResult.data.sessionId,
            status: 'SUCCESS',
            orderId: webhookResult.data.orderId
        });

        if (!result.success) {
            return errorResponse(res, result.message, 400);
        }
    }

    successResponse(res, { received: true }, 'Webhook processed successfully');
});

// @desc    Get payment status
// @route   GET /api/payments/status/:orderId
// @access  Private
export const getPaymentStatus = asyncHandler(async (req, res) => {
    const result = await orderService.getOrderPaymentStatus(req.params.orderId, req.user.id);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Payment status fetched successfully');
});

// @desc    Retry failed payment
// @route   POST /api/payments/retry/:orderId
// @access  Private
export const retryPayment = asyncHandler(async (req, res) => {
    const result = await orderService.retryPayment(req.params.orderId, req.user.id);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Payment retry initiated successfully');
});
