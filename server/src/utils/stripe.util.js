import Stripe from 'stripe';
import {
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    PAYMENT_SUCCESS_URL,
    PAYMENT_CANCEL_URL
} from '../config/env.js';
import logger from './logger.js';

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

if (!stripe) {
    logger.warn('Stripe not initialized - STRIPE_SECRET_KEY is missing');
}

/**
 * Create Stripe Checkout Session for payment
 */
export const createCheckoutSession = async (orderId, amount, userDetails, orderItems) => {
    try {
        if (!stripe) {
            return {
                success: false,
                message: 'Stripe is not configured'
            };
        }

        // Convert amount to cents (Stripe uses smallest currency unit)
        const amountInCents = Math.round(amount * 100);

        // Create line items for Stripe
        const lineItems = orderItems.map(item => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.productName || 'Product',
                    description: `Quantity: ${item.quantity}`
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }));

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${PAYMENT_CANCEL_URL}?order_id=${orderId}`,
            customer_email: userDetails.email,
            client_reference_id: orderId,
            metadata: {
                orderId,
                userId: userDetails.userId
            }
        });

        return {
            success: true,
            data: {
                sessionId: session.id,
                paymentUrl: session.url,
                sessionObject: session
            }
        };
    } catch (error) {
        logger.error(`Stripe checkout session error: ${error.message}`);
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Retrieve Stripe Checkout Session
 */
export const retrieveSession = async (sessionId) => {
    try {
        if (!stripe) {
            return {
                success: false,
                message: 'Stripe is not configured'
            };
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return {
            success: true,
            data: {
                status: session.payment_status, // paid, unpaid, no_payment_required
                orderId: session.client_reference_id,
                amountTotal: session.amount_total / 100, // Convert back to rupees
                customerEmail: session.customer_email,
                paymentIntent: session.payment_intent
            }
        };
    } catch (error) {
        logger.error(`Stripe retrieve session error: ${error.message}`);
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Check payment status by session ID
 */
export const checkPaymentStatus = async (sessionId) => {
    try {
        const sessionResult = await retrieveSession(sessionId);

        if (!sessionResult.success) {
            return sessionResult;
        }

        const session = sessionResult.data;

        return {
            success: true,
            data: {
                status: session.status === 'paid' ? 'SUCCESS' : session.status === 'unpaid' ? 'PENDING' : 'FAILED',
                orderId: session.orderId,
                amount: session.amountTotal,
                paymentMethod: 'stripe'
            }
        };
    } catch (error) {
        logger.error(`Stripe check status error: ${error.message}`);
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Handle Stripe webhook events
 */
export const handleWebhook = async (rawBody, signature) => {
    try {
        if (!stripe || !STRIPE_WEBHOOK_SECRET) {
            return {
                success: false,
                message: 'Stripe webhook not configured'
            };
        }

        // Verify webhook signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            logger.error(`Webhook signature verification failed: ${err.message}`);
            return {
                success: false,
                message: 'Invalid signature'
            };
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                return {
                    success: true,
                    data: {
                        eventType: 'payment_success',
                        orderId: session.client_reference_id,
                        sessionId: session.id,
                        status: 'SUCCESS',
                        amount: session.amount_total / 100,
                        paymentIntent: session.payment_intent
                    }
                };

            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                return {
                    success: true,
                    data: {
                        eventType: 'payment_expired',
                        orderId: expiredSession.client_reference_id,
                        sessionId: expiredSession.id,
                        status: 'FAILED'
                    }
                };

            case 'payment_intent.payment_failed':
                const paymentIntent = event.data.object;
                return {
                    success: true,
                    data: {
                        eventType: 'payment_failed',
                        paymentIntent: paymentIntent.id,
                        status: 'FAILED'
                    }
                };

            default:
                logger.info(`Unhandled webhook event type: ${event.type}`);
                return {
                    success: true,
                    data: {
                        eventType: 'unhandled',
                        type: event.type
                    }
                };
        }
    } catch (error) {
        logger.error(`Stripe webhook handling error: ${error.message}`);
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Create payment intent (alternative to checkout session)
 */
export const createPaymentIntent = async (amount, orderId, userDetails) => {
    try {
        if (!stripe) {
            return {
                success: false,
                message: 'Stripe is not configured'
            };
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'inr',
            metadata: {
                orderId,
                userId: userDetails.userId
            },
            description: `Payment for Order #${orderId}`
        });

        return {
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            }
        };
    } catch (error) {
        logger.error(`Stripe payment intent error: ${error.message}`);
        return {
            success: false,
            message: error.message
        };
    }
};

export default {
    createCheckoutSession,
    retrieveSession,
    checkPaymentStatus,
    handleWebhook,
    createPaymentIntent
};
