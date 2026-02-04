import cartService from './cart.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../../utils/apiResponse.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await cartService.getUserCart(userId);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Cart fetched successfully');
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const result = await cartService.addItemToCart(userId, productId, quantity);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Item added to cart', 201);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const result = await cartService.updateCartItemQuantity(userId, productId, quantity);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Cart updated successfully');
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await cartService.removeItemFromCart(userId, productId);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Item removed from cart');
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await cartService.clearUserCart(userId);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Cart cleared successfully');
});
