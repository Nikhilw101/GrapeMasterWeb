import axios from 'axios';
import {
    WHATSAPP_API_URL,
    WHATSAPP_API_KEY,
    WHATSAPP_PHONE_NUMBER_ID,
    ADMIN_PHONE
} from './env.js';
import logger from '../utils/logger.js';

// Send WhatsApp message to customer
export const sendCustomerOrderConfirmation = async (customerData, orderData) => {
    try {
        // TODO: Implement WhatsApp API integration
        logger.info(`WhatsApp order confirmation to be sent to: ${customerData.mobile}`);

        const message = `
Hello ${customerData.name}! 🍇

Your order has been confirmed!

Order ID: ${orderData.orderId}
Products: ${orderData.products}
Total Amount: ₹${orderData.totalAmount}
Payment Method: ${orderData.paymentMethod}

Thank you for choosing Grape Master!
    `.trim();

        // Placeholder for actual API call
        // return await axios.post(WHATSAPP_API_URL, { ... });

        logger.info('Customer WhatsApp message prepared (not sent - API integration pending)');
        return { success: true, message };
    } catch (error) {
        logger.error(`WhatsApp customer message error: ${error.message}`);
        throw error;
    }
};

// Send WhatsApp notification to admin
export const sendAdminOrderNotification = async (customerData, orderData) => {
    try {
        // TODO: Implement WhatsApp API integration
        logger.info(`WhatsApp admin notification to: ${ADMIN_PHONE}`);

        const message = `
🔔 NEW ORDER RECEIVED!

Customer: ${customerData.name}
Mobile: ${customerData.mobile}
Order ID: ${orderData.orderId}
Products: ${orderData.products}
Quantity: ${orderData.quantity}
Total Amount: ₹${orderData.totalAmount}
Payment Status: ${orderData.paymentStatus}
    `.trim();

        // Placeholder for actual API call
        // return await axios.post(WHATSAPP_API_URL, { ... });

        logger.info('Admin WhatsApp message prepared (not sent - API integration pending)');
        return { success: true, message };
    } catch (error) {
        logger.error(`WhatsApp admin message error: ${error.message}`);
        throw error;
    }
};

// Send dealer/distributor enquiry to admin
export const sendDealerEnquiryToAdmin = async (dealerData) => {
    try {
        logger.info(`Dealer enquiry WhatsApp to: ${ADMIN_PHONE}`);

        const message = `
🤝 NEW DEALER/DISTRIBUTOR ENQUIRY

Name: ${dealerData.fullName}
Mobile: ${dealerData.mobile}
Email: ${dealerData.email}
City: ${dealerData.city}, ${dealerData.state}
Business: ${dealerData.businessName}
Type: ${dealerData.type}
Capacity: ${dealerData.distributionCapacity}
    `.trim();

        // Placeholder for actual API call
        logger.info('Dealer enquiry WhatsApp message prepared (not sent - API integration pending)');
        return { success: true, message };
    } catch (error) {
        logger.error(`WhatsApp dealer enquiry error: ${error.message}`);
        throw error;
    }
};
