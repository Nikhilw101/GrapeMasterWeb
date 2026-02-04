import express from 'express';
import * as cartController from './cart.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// All cart routes are protected
router.get('/', protect, cartController.getCart);
router.post('/', protect, cartController.addToCart);
router.put('/:productId', protect, cartController.updateCartItem);
router.delete('/:productId', protect, cartController.removeFromCart);
router.delete('/', protect, cartController.clearCart);

export default router;
