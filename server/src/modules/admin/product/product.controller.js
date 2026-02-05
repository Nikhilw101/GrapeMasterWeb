import productService from './product.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../../utils/apiResponse.js';

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Public (but can filter for admin)
export const getAllProducts = asyncHandler(async (req, res) => {
    const { includeInactive } = req.query;
    const result = await productService.getProducts(includeInactive === 'true');

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Products fetched successfully');
});

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await productService.getProductById(id);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Product fetched successfully');
});

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
    const productData = req.body;
    const result = await productService.createProduct(productData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Product created successfully', 201);
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const result = await productService.updateProduct(id, updateData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Product updated successfully');
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await productService.deleteProduct(id);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Product deleted successfully');
});

// @desc    Toggle product active status
// @route   PATCH /api/admin/products/:id/toggle
// @access  Private/Admin
export const toggleProductStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await productService.toggleProductStatus(id);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Product status updated successfully');
});
// @desc    Bulk delete products
// @route   POST /api/admin/products/bulk-delete
// @access  Private/Admin
export const bulkDeleteProducts = asyncHandler(async (req, res) => {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return errorResponse(res, 'Please provide an array of product IDs', 400);
    }

    const result = await productService.bulkDeleteProducts(productIds);

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Products deleted successfully');
});

// @desc    Bulk update products
// @route   POST /api/admin/products/bulk-update
// @access  Private/Admin
export const bulkUpdateProducts = asyncHandler(async (req, res) => {
    const { productIds, action } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return errorResponse(res, 'Please provide an array of product IDs', 400);
    }

    let updateData = {};
    if (action === 'activate') {
        updateData = { isActive: true };
    } else if (action === 'deactivate') {
        updateData = { isActive: false };
    } else {
        return errorResponse(res, 'Invalid action', 400);
    }

    const result = await productService.bulkUpdateProducts(productIds, updateData);

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Products updated successfully');
});
