import DealerRequest from './dealer.model.js';
import settingsService from '../admin/settings/settings.service.js';
import { sendDealerRequestNotification } from '../../utils/orderEmail.util.js';
import { ADMIN_EMAIL } from '../../config/env.js';
import logger from '../../utils/logger.js';

const createRequest = async (data) => {
    try {
        const request = await DealerRequest.create(data);
        try {
            const adminEmailRes = await settingsService.getSettingByKey('adminEmail');
            const toEmail = (adminEmailRes.success && adminEmailRes.data?.value) ? adminEmailRes.data.value : ADMIN_EMAIL;
            if (toEmail) await sendDealerRequestNotification(toEmail, request);
        } catch (emailErr) {
            logger.error(`Dealer request notification email error: ${emailErr.message}`);
        }
        return { success: true, data: request };
    } catch (error) {
        logger.error(`Dealer request create error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

const getAll = async (query = {}) => {
    try {
        const { status, page = 1, limit = 10 } = query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [requests, total] = await Promise.all([
            DealerRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            DealerRequest.countDocuments(filter)
        ]);

        return {
            success: true,
            data: {
                requests,
                pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
            }
        };
    } catch (error) {
        logger.error(`Dealer requests list error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

const getById = async (id) => {
    try {
        const request = await DealerRequest.findById(id);
        if (!request) return { success: false, message: 'Dealer request not found' };
        return { success: true, data: request };
    } catch (error) {
        logger.error(`Dealer request get error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

const updateStatus = async (id, status, statusNote) => {
    try {
        const request = await DealerRequest.findById(id);
        if (!request) return { success: false, message: 'Dealer request not found' };
        if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
            return { success: false, message: 'Invalid status' };
        }
        request.status = status;
        if (statusNote != null) request.statusNote = statusNote;
        request.reviewedAt = new Date();
        await request.save();
        return { success: true, data: request };
    } catch (error) {
        logger.error(`Dealer request update status error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default { createRequest, getAll, getById, updateStatus };
