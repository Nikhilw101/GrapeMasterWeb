import Cart from './cart.model.js';
import Product from '../../admin/product/product.model.js';
import logger from '../../../utils/logger.js';
import { DEFAULT_DELIVERY_CHARGE } from '../../../config/env.js';

// Get user cart
const getUserCart = async (userId) => {
    try {
        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await Cart.create({ user: userId, items: [] });
        }

        return {
            success: true,
            data: cart
        };
    } catch (error) {
        logger.error(`Get user cart error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Add item to cart
const addItemToCart = async (userId, productId, quantity = 1) => {
    try {
        // Validate product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            return { success: false, message: 'Product not found' };
        }
        if (!product.isActive) {
            return { success: false, message: 'Product is not available' };
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        // Check if item already exists in cart
        const existingItem = cart.items.find(item => item.product.toString() === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price = product.price;
            existingItem.subtotal = existingItem.quantity * product.price;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                subtotal: quantity * product.price
            });
        }

        await cart.save();
        await cart.populate('items.product');

        return {
            success: true,
            data: cart
        };
    } catch (error) {
        logger.error(`Add item to cart error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Update cart item quantity
const updateCartItemQuantity = async (userId, productId, quantity) => {
    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return { success: false, message: 'Cart not found' };
        }

        const item = cart.items.find(item => item.product.toString() === productId);

        if (!item) {
            return { success: false, message: 'Item not found in cart' };
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
        } else {
            item.quantity = quantity;
            // Recalculate subtotal
            const product = await Product.findById(productId);
            if (product) {
                item.price = product.price;
                item.subtotal = quantity * product.price;
            }
        }

        await cart.save();
        await cart.populate('items.product');

        return {
            success: true,
            data: cart
        };
    } catch (error) {
        logger.error(`Update cart item error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Remove item from cart
const removeItemFromCart = async (userId, productId) => {
    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return { success: false, message: 'Cart not found' };
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        await cart.save();
        await cart.populate('items.product');

        return {
            success: true,
            data: cart
        };
    } catch (error) {
        logger.error(`Remove item from cart error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Clear cart
const clearUserCart = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return { success: false, message: 'Cart not found' };
        }

        cart.items = [];
        await cart.save();

        return {
            success: true,
            data: cart
        };
    } catch (error) {
        logger.error(`Clear cart error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Validate cart items
const validateCartItems = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return { success: false, message: 'Cart is empty' };
        }

        const validationErrors = [];
        const validItems = [];

        for (const item of cart.items) {
            if (!item.product) {
                validationErrors.push(`Product no longer exists`);
                continue;
            }

            if (!item.product.isActive) {
                validationErrors.push(`${item.product.name} is no longer available`);
                continue;
            }

            if (item.product.stock < item.quantity) {
                validationErrors.push(`${item.product.name} has insufficient stock (available: ${item.product.stock})`);
                continue;
            }

            // Update price to latest
            item.price = item.product.price;
            item.subtotal = item.quantity * item.price;
            validItems.push(item);
        }

        if (validationErrors.length > 0) {
            return {
                success: false,
                message: 'Cart validation failed',
                errors: validationErrors
            };
        }

        // Update cart with validated prices
        cart.items = validItems;
        await cart.save();

        return {
            success: true,
            data: cart,
            message: 'Cart validated successfully'
        };
    } catch (error) {
        logger.error(`Validate cart error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Calculate cart total with delivery
const calculateCartTotal = async (userId) => {
    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return { success: false, message: 'Cart is empty' };
        }

        let itemsTotal = 0;
        for (const item of cart.items) {
            if (item.product) {
                itemsTotal += item.quantity * item.product.price;
            }
        }

        const deliveryCharges = parseFloat(DEFAULT_DELIVERY_CHARGE);
        const total = itemsTotal + deliveryCharges;

        return {
            success: true,
            data: {
                itemsTotal,
                deliveryCharges,
                total,
                itemCount: cart.items.length
            }
        };
    } catch (error) {
        logger.error(`Calculate cart total error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default {
    getUserCart,
    addItemToCart,
    updateCartItemQuantity,
    removeItemFromCart,
    clearUserCart,
    validateCartItems,
    calculateCartTotal
};
