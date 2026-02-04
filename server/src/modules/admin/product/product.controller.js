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
