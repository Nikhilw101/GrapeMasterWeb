import express from 'express';
import * as orderController from './order.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Protected routes
router.post('/', protect, orderController.placeOrder);
router.get('/', protect, orderController.getUserOrders);
router.get('/:orderId', protect, orderController.getOrderById);
router.put('/:orderId/cancel', protect, orderController.cancelOrder);

// Public route for payment callback
// router.post('/payment/callback', orderController.paymentCallback);

export default router;
