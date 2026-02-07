import express from 'express';
import * as orderController from './order.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { isAdmin } from '../../../middlewares/admin.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, isAdmin);

// Get order statistics
router.get('/stats', orderController.getOrderStats);

// Get all orders with filters
router.get('/', orderController.getAllOrders);

// Get single order
router.get('/:orderId', orderController.getOrder);

// Approve order
router.put('/:orderId/approve', orderController.approveOrder);

// Reject order
router.put('/:orderId/reject', orderController.rejectOrder);

// Update order status
router.put('/:orderId/status', orderController.updateOrderStatus);

// Delete order (cancels order so it is excluded from stats)
router.delete('/:orderId', orderController.deleteOrder);

export default router;
