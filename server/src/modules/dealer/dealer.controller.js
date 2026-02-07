import dealerService from './dealer.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const submitDealerRequest = asyncHandler(async (req, res) => {
    const result = await dealerService.createRequest(req.body);
    if (!result.success) return errorResponse(res, result.message, 400);
    successResponse(res, result.data, 'Dealer request submitted successfully', 201);
});

export const listDealerRequests = asyncHandler(async (req, res) => {
    const result = await dealerService.getAll(req.query);
    if (!result.success) return errorResponse(res, result.message, 500);
    successResponse(res, result.data, 'Dealer requests fetched successfully');
});

export const getDealerRequest = asyncHandler(async (req, res) => {
    const result = await dealerService.getById(req.params.id);
    if (!result.success) return errorResponse(res, result.message, 404);
    successResponse(res, result.data, 'Dealer request fetched successfully');
});

export const updateDealerRequestStatus = asyncHandler(async (req, res) => {
    const { status, statusNote } = req.body;
    const result = await dealerService.updateStatus(req.params.id, status, statusNote);
    if (!result.success) return errorResponse(res, result.message, 400);
    successResponse(res, result.data, 'Status updated successfully');
});
