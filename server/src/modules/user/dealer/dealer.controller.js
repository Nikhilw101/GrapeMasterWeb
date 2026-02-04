import dealerService from './dealer.service.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../../../utils/apiResponse.js';

// @desc    Submit dealer/distributor form
// @route   POST /api/dealers
// @access  Public
export const submitDealerForm = asyncHandler(async (req, res) => {
    const dealerData = req.body;
    const result = await dealerService.createDealerEnquiry(dealerData);

    if (!result.success) {
        return errorResponse(res, result.message, 400);
    }

    successResponse(res, result.data, 'Your enquiry has been submitted successfully. We will contact you soon.', 201);
});

// @desc    Get dealer enquiry status
// @route   GET /api/dealers/:mobile
// @access  Public
export const getDealerStatus = asyncHandler(async (req, res) => {
    const { mobile } = req.params;
    const result = await dealerService.getDealerEnquiryByMobile(mobile);

    if (!result.success) {
        return errorResponse(res, result.message, 404);
    }

    successResponse(res, result.data, 'Enquiry status fetched successfully');
});
