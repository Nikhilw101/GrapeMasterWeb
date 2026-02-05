import Product from './product.model.js';
import logger from '../../../utils/logger.js';

// Get all products
const getProducts = async (includeInactive = false) => {
    try {
        const filter = includeInactive ? {} : { isActive: true };
        const products = await Product.find(filter).sort({ createdAt: -1 });

        return {
            success: true,
            data: products
        };
    } catch (error) {
        logger.error(`Get products error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Get product by ID
const getProductById = async (productId) => {
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        return {
            success: true,
            data: product
        };
    } catch (error) {
        logger.error(`Get product by ID error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Create product
const createProduct = async (productData) => {
    try {
        const product = await Product.create(productData);

        return {
            success: true,
            data: product
        };
    } catch (error) {
        logger.error(`Create product error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Update product
const updateProduct = async (productId, updateData) => {
    try {
        const product = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        return {
            success: true,
            data: product
        };
    } catch (error) {
        logger.error(`Update product error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Delete product
const deleteProduct = async (productId) => {
    try {
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        return {
            success: true,
            data: { message: 'Product deleted successfully' }
        };
    } catch (error) {
        logger.error(`Delete product error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Toggle product active status
const toggleProductStatus = async (productId) => {
    try {
        const product = await Product.findById(productId);

        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        product.isActive = !product.isActive;
        await product.save();

        return {
            success: true,
            data: product
        };
    } catch (error) {
        logger.error(`Toggle product status error: ${error.message}`);
        return { success: false, message: error.message };
    }
};
// Bulk delete products
const bulkDeleteProducts = async (productIds) => {
    try {
        const result = await Product.deleteMany({ _id: { $in: productIds } });

        return {
            success: true,
            data: {
                message: 'Products deleted successfully',
                count: result.deletedCount
            }
        };
    } catch (error) {
        logger.error(`Bulk delete products error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Bulk update products status
const bulkUpdateProducts = async (productIds, updateData) => {
    try {
        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            { $set: updateData }
        );

        return {
            success: true,
            data: {
                message: 'Products updated successfully',
                count: result.modifiedCount
            }
        };
    } catch (error) {
        logger.error(`Bulk update products error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    bulkDeleteProducts,
    bulkUpdateProducts
};
