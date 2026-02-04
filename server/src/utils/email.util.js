import { Resend } from 'resend';
import {
  RESEND_API_KEY,
  EMAIL_FROM
} from '../config/env.js';
import logger from './logger.js';

// Initialize Resend
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

if (!resend) {
  logger.warn('⚠️  Resend API Key missing. Emails will not be sent.');
}

/**
 * Send Email using Resend
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.html - HTML content
 * @returns {Promise<Object>} Email send result
 */
export const sendEmail = async (options) => {
  if (!resend) {
    logger.warn('Email not sent - Resend not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    });

    // Resend returns { id: '...' } on success or throws error
    if (data.error) {
      throw new Error(data.error.message);
    }

    logger.info(`✅ Email sent to ${options.to}: ${data.data?.id}`);

    return {
      success: true,
      messageId: data.data?.id
    };
  } catch (error) {
    logger.error(`❌ Error sending email to ${options.to}: ${error.message}`);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Send Password Reset Email
 * @param {String} email - Recipient email
 * @param {String} resetUrl - Password reset URL
 * @param {String} name - User name
 * @returns {Promise<Object>} Email send result
 */
export const sendPasswordResetEmail = async (email, resetUrl, name) => {
  const subject = 'Password Reset Request - Grape Master';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍇 Grape Master</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This link will expire in <strong>10 minutes</strong> for security reasons.
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <p>Best regards,<br>The Grape Master Team</p>
        </div>
        <div class="footer">
          <p>© 2026 Grape Master. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send Password Reset Success Email
 * @param {String} email - Recipient email
 * @param {String} name - User name
 * @returns {Promise<Object>} Email send result
 */
export const sendPasswordResetSuccessEmail = async (email, name) => {
  const subject = 'Password Successfully Reset - Grape Master';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Reset Successful</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          
          <div class="success">
            <strong>Success!</strong> Your password has been successfully reset.
          </div>
          
          <p>You can now log in to your Grape Master account using your new password.</p>
          
          <p>If you did not make this change, please contact our support team immediately.</p>
          
          <p>Best regards,<br>The Grape Master Team</p>
        </div>
        <div class="footer">
          <p>© 2026 Grape Master. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

/**
 * Send Welcome Email
 * @param {String} email - Recipient email
 * @param {String} name - User name
 * @returns {Promise<Object>} Email send result
 */
export const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Grape Master! 🍇';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🍇 Welcome to Grape Master!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for joining Grape Master. We're excited to have you!</p>
          <p>You can now browse our premium quality grapes and place orders with ease.</p>
          <p>If you have any questions, feel free to contact us.</p>
          <p>Happy shopping!<br>The Grape Master Team</p>
        </div>
        <div class="footer">
          <p>© 2026 Grape Master. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: email, subject, html });
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendWelcomeEmail
};
