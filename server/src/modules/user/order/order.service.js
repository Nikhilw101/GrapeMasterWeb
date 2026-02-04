import Order from './order.model.js';
import User from '../user.model.js';
import Cart from '../cart/cart.model.js';
import cartService from '../cart/cart.service.js';
import Product from '../../admin/product/product.model.js';
import logger from '../../../utils/logger.js';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../../../utils/constants.js';
import { DEFAULT_DELIVERY_CHARGE } from '../../../config/env.js';
import {
    sendOrderPlacedEmail,
    sendOrderSubmittedEmail,
    sendPaymentSuccessEmail,
    sendPaymentFailedEmail
} from '../../../utils/orderEmail.util.js';
import { createCheckoutSession, checkPaymentStatus, retrieveSession } from '../../../utils/stripe.util.js';

/**
 * Create order from cart
 */
const createOrderFromCart = async (userId, orderData) => {
    try {
        const { deliveryAddress, paymentMethod, notes } = orderData;

        // Validate cart
        const cartValidation = await cartService.validateCartItems(userId);
        if (!cartValidation.success) {
            return cartValidation;
        }

        const cart = cartValidation.data;
        if (cart.items.length === 0) {
            return { success: false, message: 'Cart is empty' };
        }

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Prepare order items with locked pricing
        const orderItems = [];
        let itemsTotal = 0;

        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product);
            if (!product || !product.isActive) {
                return { success: false, message: `Product ${product?.name || 'unknown'} is not available` };
            }

            const subtotal = product.price * cartItem.quantity;
            itemsTotal += subtotal;

            orderItems.push({
                product: product._id,
                productName: product.name,
                quantity: cartItem.quantity,
                price: product.price,
                subtotal
            });
        }

        const deliveryCharges = parseFloat(DEFAULT_DELIVERY_CHARGE);
        const total = itemsTotal + deliveryCharges;

        // Create order
        const order = await Order.create({
            user: userId,
            userDetails: {
                name: user.name,
                mobile: user.mobile,
                email: user.email
            },
            deliveryAddress,
            items: orderItems,
            pricing: {
                itemsTotal,
                deliveryCharges,
                total
            },
            paymentMethod,
            paymentStatus: PAYMENT_STATUS.PENDING,
            orderStatus: ORDER_STATUS.CREATED,
            notes
        });

        // Populate product details
        await order.populate('items.product');

        // Clear cart after order creation
        await cartService.clearUserCart(userId);

        // Send order confirmation email
        try {
            await sendOrderPlacedEmail(user, order);
        } catch (emailError) {
            logger.error(`Order email error: ${emailError.message}`);
            // Don't fail order creation if email fails
        }

        return {
            success: true,
            data: order,
            message: 'Order created successfully'
        };
    } catch (error) {
        logger.error(`Create order from cart error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Initiate payment for order
 */
const initiateOrderPayment = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ orderId, user: userId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.paymentMethod === PAYMENT_METHODS.COD) {
            // For COD, mark as awaiting payment and submit for review
            order.orderStatus = ORDER_STATUS.SUBMITTED;
            order.paymentStatus = PAYMENT_STATUS.PENDING;
            await order.save();

            // Notify admin
            try {
                await sendOrderSubmittedEmail(order);
            } catch (error) {
                logger.error(error);
            }

            return {
                success: true,
                data: { paymentMethod: 'COD', status: 'submitted' },
                message: 'Order submitted successfully'
            };
        }

        // For online payment (Stripe)
        const user = await User.findById(userId);
        await order.populate('items.product');

        const paymentResult = await createCheckoutSession(
            orderId,
            order.pricing.total,
            {
                userId: user._id.toString(),
                email: user.email || `${user.mobile}@grapemaster.com`
            },
            order.items
        );

        if (!paymentResult.success) {
            return paymentResult;
        }

        // Update order status
        order.orderStatus = ORDER_STATUS.AWAITING_PAYMENT;
        order.paymentStatus = PAYMENT_STATUS.INITIATED;
        order.paymentDetails = {
            transactionId: paymentResult.data.sessionId,
            paymentGateway: 'Stripe'
        };
        await order.save();

        return {
            success: true,
            data: {
                sessionId: paymentResult.data.sessionId,
                paymentUrl: paymentResult.data.paymentUrl
            },
            message: 'Payment session created successfully'
        };
    } catch (error) {
        logger.error(`Initiate payment error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Submit order for admin review
 */
const submitOrderForReview = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ orderId, user: userId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.isLocked) {
            return { success: false, message: 'Order is already submitted' };
        }

        // Lock the order
        order.isLocked = true;
        order.orderStatus = ORDER_STATUS.SUBMITTED;
        order.statusHistory.push({
            status: ORDER_STATUS.SUBMITTED,
            note: 'Order submitted for admin review'
        });

        await order.save();

        // Notify admin
        try {
            await sendOrderSubmittedEmail(order);
        } catch (error) {
            logger.error(`Admin notification error: ${error.message}`);
        }

        return {
            success: true,
            data: order,
            message: 'Order submitted for review successfully'
        };
    } catch (error) {
        logger.error(`Submit order error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Handle payment callback (Stripe)
 */
const handlePaymentCallback = async (paymentData) => {
    try {
        const { sessionId, status, orderId } = paymentData;

        // Find order by session ID stored in paymentDetails or by orderId
        let order;
        if (sessionId) {
            order = await Order.findOne({ 'paymentDetails.transactionId': sessionId });
        }
        if (!order && orderId) {
            order = await Order.findOne({ orderId });
        }

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        const user = await User.findById(order.user);

        if (status === 'SUCCESS' || status === 'paid') {
            order.paymentStatus = PAYMENT_STATUS.SUCCESS;
            order.paymentDetails = {
                transactionId: sessionId,
                paymentGateway: 'Stripe',
                paidAt: new Date()
            };
            order.orderStatus = ORDER_STATUS.PAYMENT_COMPLETED;
            order.statusHistory.push({
                status: ORDER_STATUS.PAYMENT_COMPLETED,
                note: 'Payment successful via Stripe'
            });

            await order.save();

            // Send success email
            try {
                await sendPaymentSuccessEmail(user, order);
                // Auto-submit for review after successful payment
                await submitOrderForReview(order.orderId, user._id);
            } catch (error) {
                logger.error(`Email error: ${error.message}`);
            }

            return {
                success: true,
                data: order,
                message: 'Payment successful'
            };
        } else {
            order.paymentStatus = PAYMENT_STATUS.FAILED;
            await order.save();

            // Send failure email
            try {
                await sendPaymentFailedEmail(user, order);
            } catch (error) {
                logger.error(`Email error: ${error.message}`);
            }

            return {
                success: false,
                message: 'Payment failed',
                data: order
            };
        }
    } catch (error) {
        logger.error(`Payment callback error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Retry failed payment
 */
const retryPayment = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ orderId, user: userId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.paymentStatus === PAYMENT_STATUS.SUCCESS) {
            return { success: false, message: 'Payment already completed' };
        }

        if (order.paymentMethod === PAYMENT_METHODS.COD) {
            return { success: false, message: 'Cannot retry COD payment' };
        }

        // Initiate new payment
        return await initiateOrderPayment(orderId, userId);
    } catch (error) {
        logger.error(`Retry payment error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Get payment status
 */
const getOrderPaymentStatus = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ orderId, user: userId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (!order.paymentDetails?.transactionId) {
            return {
                success: true,
                data: {
                    status: order.paymentStatus,
                    method: order.paymentMethod
                }
            };
        }

        // Check with Stripe
        const statusCheck = await checkPaymentStatus(order.paymentDetails.transactionId);

        if (statusCheck.success) {
            // Update order if status changed
            if (statusCheck.data.status === 'SUCCESS' && order.paymentStatus !== PAYMENT_STATUS.SUCCESS) {
                await handlePaymentCallback({
                    sessionId: order.paymentDetails.transactionId,
                    status: 'SUCCESS',
                    orderId: order.orderId
                });
            }
        }

        return {
            success: true,
            data: {
                status: order.paymentStatus,
                method: order.paymentMethod,
                details: statusCheck.data
            }
        };
    } catch (error) {
        logger.error(`Get payment status error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Get orders by user
const getOrdersByUser = async (userId) => {
    try {
        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });

        return {
            success: true,
            data: orders
        };
    } catch (error) {
        logger.error(`Get orders by user error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Get order details
const getOrderDetails = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ orderId, user: userId })
            .populate('items.product');

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        return {
            success: true,
            data: order
        };
    } catch (error) {
        logger.error(`Get order details error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Cancel order
const cancelUserOrder = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ orderId, user: userId });

        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        // Only allow cancellation if order is not dispatched or delivered
        if ([ORDER_STATUS.DISPATCHED, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED].includes(order.orderStatus)) {
            return { success: false, message: 'Cannot cancel order at this stage' };
        }

        order.orderStatus = ORDER_STATUS.CANCELLED;
        order.statusHistory.push({
            status: ORDER_STATUS.CANCELLED,
            note: 'Cancelled by customer'
        });

        await order.save();

        return {
            success: true,
            data: order
        };
    } catch (error) {
        logger.error(`Cancel order error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default {
    createOrderFromCart,
    initiateOrderPayment,
    submitOrderForReview,
    handlePaymentCallback,
    retryPayment,
    getOrderPaymentStatus,
    getOrdersByUser,
    getOrderDetails,
    cancelUserOrder
};
