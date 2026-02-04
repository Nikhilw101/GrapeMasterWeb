import settingsService from './settings.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../../utils/apiResponse.js';

// @desc    Get all settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getAllSettings = asyncHandler(async (req, res) => {
    const result = await settingsService.getAllSettings();

    if (!result.success) {
        return errorResponse(res, result.message, 500);
    }

    successResponse(res, result.data, 'Settings fetched successfully');
});

// @desc    Get setting by key
// @route   GET /api/admin/settings/:key
// @access  Public
export const getSettingByKey = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const result = await settingsService.getSettingByKey(key);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Setting fetched successfully');
});

// @desc    Update setting
// @route   PUT /api/admin/settings/:key
// @access  Private/Admin
export const updateSetting = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    const result = await settingsService.updateSetting(key, value);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Setting updated successfully');
});

// @desc    Create setting
// @route   POST /api/admin/settings
// @access  Private/Admin
export const createSetting = asyncHandler(async (req, res) => {
    const settingData = req.body;
    const result = await settingsService.createSetting(settingData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Setting created successfully', 201);
});
