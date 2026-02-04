import express from 'express';
import * as paymentController from './payment.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Initiate payment for order (protected)
router.post('/initiate/:orderId', protect, paymentController.initiatePayment);

// Stripe webhook (public - webhook signature verified in controller)
router.post('/webhook', paymentController.paymentWebhook);

// Get payment status (protected)
router.get('/status/:orderId', protect, paymentController.getPaymentStatus);

// Retry failed payment (protected)
router.post('/retry/:orderId', protect, paymentController.retryPayment);

export default router;
