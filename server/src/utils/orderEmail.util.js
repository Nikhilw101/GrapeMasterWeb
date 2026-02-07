import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import {
    RESEND_API_KEY,
    EMAIL_FROM,
    NODEMAILER_HOST,
    NODEMAILER_PORT,
    NODEMAILER_USER,
    NODEMAILER_PASS,
    ADMIN_EMAIL,
    FRONTEND_URL
} from '../config/env.js';
import settingsService from '../modules/admin/settings/settings.service.js';
import logger from './logger.js';

/** Build footer from company settings (Admin Settings or env fallback) */
const getEmailFooter = (company) => `
    <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p><strong>${company.companyName}</strong></p>
        <p>${company.companyAddress}</p>
        ${company.companyPhone ? `<p>Phone: ${company.companyPhone}</p>` : ''}
        ${company.companyEmail ? `<p>Email: ${company.companyEmail}</p>` : ''}
        <p style="margin-top: 12px;">This is an automated message. Please do not reply directly to this email.</p>
    </div>`;

const defaultCompany = () => ({
    companyName: 'Grape Master',
    companyAddress: '123 Grape Street, Vineyard City, CA 94000',
    companyPhone: '',
    companyEmail: 'hello@grapemaster.com'
});

// Initialize Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Create Nodemailer transporter (fallback)
let nodemailerTransporter = null;
if (NODEMAILER_USER && NODEMAILER_PASS) {
    nodemailerTransporter = nodemailer.createTransport({
        host: NODEMAILER_HOST,
        port: NODEMAILER_PORT,
        secure: NODEMAILER_PORT == 465,
        auth: {
            user: NODEMAILER_USER,
            pass: NODEMAILER_PASS
        }
    });
}

/**
 * Send email with automatic fallback
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        // Try Resend first
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: EMAIL_FROM,
                to,
                subject,
                html
            });

            if (error) {
                logger.warn(`Resend failed: ${error.message}. Falling back to Nodemailer.`);
                throw new Error(error.message);
            }

            logger.info(`Email sent via Resend to ${to}`);
            return { success: true, provider: 'resend', data };
        }

        // Fallback to Nodemailer
        if (nodemailerTransporter) {
            const info = await nodemailerTransporter.sendMail({
                from: EMAIL_FROM,
                to,
                subject,
                html
            });

            logger.info(`Email sent via Nodemailer to ${to}`);
            return { success: true, provider: 'nodemailer', data: info };
        }

        logger.error('No email provider configured');
        return { success: false, message: 'No email provider configured' };
    } catch (error) {
        // If Resend failed, try Nodemailer
        if (nodemailerTransporter && !error.message.includes('Nodemailer')) {
            try {
                const info = await nodemailerTransporter.sendMail({
                    from: EMAIL_FROM,
                    to,
                    subject,
                    html
                });

                logger.info(`Email sent via Nodemailer (fallback) to ${to}`);
                return { success: true, provider: 'nodemailer', data: info };
            } catch (fallbackError) {
                logger.error(`All email providers failed: ${fallbackError.message}`);
                return { success: false, message: fallbackError.message };
            }
        }

        logger.error(`Email send error: ${error.message}`);
        return { success: false, message: error.message };
    }
};

/**
 * Send Order Placed Email (to Customer)
 */
export const sendOrderPlacedEmail = async (user, order) => {
    const companyRes = await settingsService.getCompanySettings();
    const company = companyRes?.data || defaultCompany();
    const subject = `Order Confirmation - ${order.orderId} | ${company.companyName}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-id { background: #667eea; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; font-size: 18px; font-weight: bold; }
            .item-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .item-table th, .item-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .item-table th { background: #f0f0f0; font-weight: bold; }
            .total-row { font-weight: bold; font-size: 16px; background: #f0f0f0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍇 Order Confirmed!</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name || 'Customer'},</p>
                <p>Thank you for your order! We've received it and will process it soon.</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <span class="order-id">Order ID: ${order.orderId}</span>
                </div>

                <h3>Order Details:</h3>
                <table class="item-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.productName || 'Product'}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price}</td>
                                <td>₹${item.subtotal}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td colspan="3" style="text-align: right;"><strong>Items Total:</strong></td>
                            <td><strong>₹${order.pricing.itemsTotal}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="3" style="text-align: right;">Delivery Charges:</td>
                            <td>₹${order.pricing.deliveryCharges}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Total Amount:</td>
                            <td>₹${order.pricing.total}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="info-box">
                    <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br>
                    <strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}<br>
                    <strong>Order Status:</strong> ${order.orderStatus.toUpperCase()}
                </div>

                <h3>Delivery Address:</h3>
                <p>
                    ${order.deliveryAddress.addressLine}<br>
                    ${order.deliveryAddress.city}, ${order.deliveryAddress.state}<br>
                    PIN: ${order.deliveryAddress.pincode}
                </p>

                <div style="text-align: center;">
                    <a href="${FRONTEND_URL}/orders/${order.orderId}" class="button">Track Your Order</a>
                </div>

                <p>We'll notify you once your order is approved and ready for dispatch.</p>

<p>Best regards,<br>${company.companyName} Team</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;

    return await sendEmail({
        to: user.email || user.mobile,
        subject,
        html
    });
};

/**
 * Send Order Submitted Email (to Admin)
 * @param {Object} order - Order document
 * @param {string} [adminEmailOverride] - Admin email from DB settings; falls back to env ADMIN_EMAIL if not set
 */
export const sendOrderSubmittedEmail = async (order, adminEmailOverride) => {
    const companyRes = await settingsService.getCompanySettings();
    const company = companyRes?.data || defaultCompany();
    const subject = `New Order Received - ${order.orderId} | ${company.companyName} Admin`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 New Order Alert</h1>
            </div>
            <div class="content">
                <div class="alert">
                    <strong>Action Required:</strong> Review and approve order #${order.orderId}
                </div>

                <h3>Customer Details:</h3>
                <p>
                    <strong>Name:</strong> ${order.userDetails.name}<br>
                    <strong>Mobile:</strong> ${order.userDetails.mobile}<br>
                    <strong>Email:</strong> ${order.userDetails.email || 'N/A'}
                </p>

                <h3>Order Summary:</h3>
                <p><strong>Total Amount:</strong> ₹${order.pricing.total}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                <p><strong>Items:</strong> ${order.items.length} product(s)</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${FRONTEND_URL}/admin/orders/${order.orderId}" class="button">Review Order</a>
                </div>
<p style="margin-top: 20px;">Best regards,<br>${company.companyName}</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;

    const toEmail = adminEmailOverride || ADMIN_EMAIL;
    if (!toEmail) {
        logger.warn('Admin email not set (settings or env); skipping admin order notification');
        return { success: true };
    }
    return await sendEmail({
        to: toEmail,
        subject,
        html
    });
};

/**
 * Send Payment Success Email
 */
export const sendPaymentSuccessEmail = async (user, order) => {
    const companyRes = await settingsService.getCompanySettings();
    const company = companyRes?.data || defaultCompany();
    const subject = `Payment Successful - ${order.orderId} | ${company.companyName}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4caf50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Payment Successful!</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                
                <div class="success-box">
                    <h2 style="color: #4caf50; margin: 0;">₹${order.pricing.total}</h2>
                    <p style="margin: 10px 0;">Payment received for Order #${order.orderId}</p>
                    <p style="font-size: 12px; color: #666;">Transaction ID: ${order.paymentDetails?.transactionId || 'N/A'}</p>
                </div>

                <p>Your payment has been successfully processed. Your order is now being prepared for dispatch.</p>

<p>Best regards,<br>${company.companyName} Team</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;

    return await sendEmail({
        to: user.email || user.mobile,
        subject,
        html
    });
};

/**
 * Send Payment Failed Email
 */
export const sendPaymentFailedEmail = async (user, order) => {
    const companyRes = await settingsService.getCompanySettings();
    const company = companyRes?.data || defaultCompany();
    const subject = `Payment Failed - ${order.orderId} | ${company.companyName}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Payment Failed</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>Unfortunately, your payment for Order #${order.orderId} could not be processed.</p>
                
                <p><strong>Order Amount:</strong> ₹${order.pricing.total}</p>

                <p>Please try again or contact us if you continue to face issues.</p>

                <div style="text-align: center;">
                    <a href="${FRONTEND_URL}/checkout" class="button">Retry Payment</a>
                </div>

<p>Best regards,<br>${company.companyName} Team</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;

    return await sendEmail({
        to: user.email || user.mobile,
        subject,
        html
    });
};

/**
 * Send Order Approved Email
 */
export const sendOrderApprovedEmail = async (user, order) => {
    const companyRes = await settingsService.getCompanySettings();
    const company = companyRes?.data || defaultCompany();
    const subject = `Order Approved - ${order.orderId} | ${company.companyName}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4caf50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Order Approved!</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>Great news! Your order #${order.orderId} has been approved and will be dispatched soon.</p>
                
                ${order.adminReview?.reviewNote ? `<p><strong>Admin Note:</strong> ${order.adminReview.reviewNote}</p>` : ''}

                <p>We'll notify you once your order is dispatched.</p>

<p>Best regards,<br>${company.companyName} Team</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;

    return await sendEmail({
        to: user.email || user.mobile,
        subject,
        html
    });
};

/**
 * Send Order Rejected Email
 */
export const sendOrderRejectedEmail = async (user, order, reason) => {
    const companyRes = await settingsService.getCompanySettings();
    const company = companyRes?.data || defaultCompany();
    const subject = `Order Update - ${order.orderId} | ${company.companyName}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reason-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Update</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>We regret to inform you that your order #${order.orderId} could not be processed.</p>
                
                ${reason ? `
                <div class="reason-box">
                    <strong>Reason:</strong> ${reason}
                </div>
                ` : ''}

                <p>If you have any questions, please contact our support team.</p>

<p>Best regards,<br>${company.companyName} Team</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;

    return await sendEmail({
        to: user.email || user.mobile,
        subject,
        html
    });
};

/**
 * Send Order Status Update Email
 */
export const sendOrderStatusEmail = async (user, order, status) => {
    const statusMessages = {
        dispatched: { title: '📦 Order Dispatched', message: 'Your order has been dispatched and is on its way!' },
        delivered: { title: '✅ Order Delivered', message: 'Your order has been delivered successfully!' },
        completed: { title: '🎉 Order Completed', message: 'Thank you for your purchase!' }
    };

    const statusInfo = statusMessages[status] || { title: 'Order Update', message: `Your order status has been updated to ${status}` };

    const subject = `${statusInfo.title} - ${order.orderId} | Grape Master`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${statusInfo.title}</h1>
            </div>
            <div class="content">
                <p>Hi ${user.name},</p>
                <p>${statusInfo.message}</p>
                
                <p><strong>Order ID:</strong> ${order.orderId}</p>

<p>Best regards,<br>${company.companyName} Team</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;

    return await sendEmail({
        to: user.email || user.mobile,
        subject,
        html
    });
};

/**
 * Send Dealer Request notification to Admin
 * @param {string} toEmail - Admin email address
 * @param {Object} request - Dealer request document
 */
export const sendDealerRequestNotification = async (toEmail, request) => {
    if (!toEmail) return { success: true };
    const companyRes = await settingsService.getCompanySettings();
    const company = companyRes?.data || defaultCompany();
    const subject = `New Dealer Request - ${request.storeName} | ${company.companyName}`;
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin: 12px 0; }
            .label { font-weight: bold; color: #555; }
            .button { display: inline-block; padding: 12px 24px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px; margin-top: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New Dealer Request</h1>
            </div>
            <div class="content">
                <p>A new "Be a Dealer" form has been submitted.</p>
                <div class="field"><span class="label">Store / Business:</span> ${request.storeName || '—'}</div>
                <div class="field"><span class="label">Owner Name:</span> ${request.ownerName || '—'}</div>
                <div class="field"><span class="label">Email:</span> ${request.email || '—'}</div>
                <div class="field"><span class="label">Phone:</span> ${request.phone || '—'}</div>
                <div class="field"><span class="label">Address:</span> ${request.address || '—'}</div>
                ${request.businessDetails ? `<div class="field"><span class="label">Business details:</span><br/>${request.businessDetails}</div>` : ''}
                ${request.notes ? `<div class="field"><span class="label">Notes:</span><br/>${request.notes}</div>` : ''}
                <p><a href="${FRONTEND_URL}/admin/dealer-requests" class="button">View in Admin Panel</a></p>
<p style="margin-top: 20px;">Best regards,<br>${company.companyName}</p>
        </div>
            ${getEmailFooter(company)}
        </div>
    </body>
    </html>
    `;
    return await sendEmail({ to: toEmail, subject, html });
};

// Re-export auth emails (password reset, welcome) from email.util
export { sendPasswordResetEmail, sendPasswordResetSuccessEmail, sendWelcomeEmail } from './email.util.js';

export default {
    sendEmail,
    sendOrderPlacedEmail,
    sendOrderSubmittedEmail,
    sendPaymentSuccessEmail,
    sendPaymentFailedEmail,
    sendOrderApprovedEmail,
    sendOrderRejectedEmail,
    sendOrderStatusEmail,
    sendDealerRequestNotification
};
