import userService from './user.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const userData = req.body;
    const result = await userService.registerUser(userData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'User registered successfully', 201);
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { mobile, password } = req.body;
    const result = await userService.loginUser(mobile, password);

    if (!result.success) {
        return errorResponse(res, result.message, 401);
    }

    successResponse(res, result.data, 'Login successful');
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await userService.getUserProfile(userId);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Profile fetched successfully');
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updateData = req.body;
    const result = await userService.updateUserProfile(userId, updateData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Profile updated successfully');
});

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressData = req.body;
    const result = await userService.addUserAddress(userId, addressData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Address added successfully', 201);
});

// @desc    Update address
// @route   PUT /api/users/address/:addressId
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.params;
    const addressData = req.body;
    const result = await userService.updateUserAddress(userId, addressId, addressData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Address updated successfully');
});

// @desc    Delete address
// @route   DELETE /api/users/address/:addressId
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { addressId } = req.params;
    const result = await userService.deleteUserAddress(userId, addressId);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Address deleted successfully');
});

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const result = await userService.refreshAccessToken(refreshToken);

    successResponse(res, result.data, 'Token refreshed successfully');
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await userService.logoutUser(userId);

    successResponse(res, result, 'Logged out successfully');
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await userService.forgotPassword(email);

    successResponse(res, {}, result.message);
});

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const result = await userService.resetPassword(token, password);

    successResponse(res, {}, result.message);
});
