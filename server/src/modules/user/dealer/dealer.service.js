import Dealer from './dealer.model.js';
import logger from '../../../utils/logger.js';
import { sendDealerEnquiryToAdmin } from '../../../config/whatsapp.js';
import { ADMIN_EMAIL } from '../../../config/env.js';

// Create dealer enquiry
const createDealerEnquiry = async (dealerData) => {
    try {
        // Check if already submitted with same mobile
        const existing = await Dealer.findOne({ mobile: dealerData.mobile });
        if (existing) {
            return { success: false, message: 'An enquiry with this mobile number already exists' };
        }

        // Create dealer enquiry
        const dealer = await Dealer.create(dealerData);

        // Send WhatsApp notification to admin
        try {
            await sendDealerEnquiryToAdmin(dealerData);
            logger.info(`Dealer enquiry WhatsApp sent for: ${dealerData.fullName}`);
        } catch (error) {
            logger.error(`WhatsApp dealer notification error: ${error.message}`);
            // Don't fail the submission if WhatsApp fails
        }

        // TODO: Send email to admin
        logger.info(`Dealer enquiry email should be sent to: ${ADMIN_EMAIL}`);

        return {
            success: true,
            data: {
                id: dealer._id,
                fullName: dealer.fullName,
                status: dealer.status,
                submittedAt: dealer.submittedAt
            }
        };
    } catch (error) {
        logger.error(`Create dealer enquiry error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

// Get dealer enquiry by mobile
const getDealerEnquiryByMobile = async (mobile) => {
    try {
        const dealer = await Dealer.findOne({ mobile });

        if (!dealer) {
            return { success: false, message: 'No enquiry found with this mobile number' };
        }

        return {
            success: true,
            data: {
                fullName: dealer.fullName,
                businessName: dealer.businessName,
                type: dealer.type,
                status: dealer.status,
                submittedAt: dealer.submittedAt
            }
        };
    } catch (error) {
        logger.error(`Get dealer enquiry error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

export default {
    createDealerEnquiry,
    getDealerEnquiryByMobile
};
