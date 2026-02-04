import adminService from './admin.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await adminService.loginAdmin(email, password);

    if (!result.success) {
        return errorResponse(res, result.message, 401);
    }

    successResponse(res, result.data, 'Admin login successful');
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboard = asyncHandler(async (req, res) => {
    const result = await adminService.getDashboardStats();

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Dashboard stats fetched successfully');
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
    const result = await adminService.getAllUsers(req.query);

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Users fetched successfully');
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = asyncHandler(async (req, res) => {
    const result = await adminService.getUserById(req.params.id);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'User fetched successfully');
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const result = await adminService.updateUserStatus(req.params.id, status);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'User status updated successfully');
});

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private/Admin
export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.user.id;
    const result = await adminService.changePassword(adminId, oldPassword, newPassword);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result, result.message);
});
