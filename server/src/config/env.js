import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grapemaster';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
export const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
export const JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || '15m';
export const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

// Email Configuration (Resend)
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// Frontend URLs – where the React app runs (e.g. port 3000). Do NOT use the API port (PORT, e.g. 5001).
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
export const RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL || `${FRONTEND_URL}/reset-password`;
export const ADMIN_RESET_PASSWORD_URL = process.env.ADMIN_RESET_PASSWORD_URL || `${FRONTEND_URL}/admin/reset-password`;

// Admin – used only as fallback when DB settings are not set (e.g. adminEmail for notifications)
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || null;
export const ADMIN_PHONE = process.env.ADMIN_PHONE || null;

// Initial admin seed – only for first-time setup; after first login everything is in DB (email, password, etc.)
export const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || null;
export const INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || null;
export const INITIAL_ADMIN_NAME = process.env.INITIAL_ADMIN_NAME || 'Admin';
export const INITIAL_ADMIN_MOBILE = process.env.INITIAL_ADMIN_MOBILE || '0000000000';

// Company – fallback when Admin Settings (companyName, companyAddress, etc.) are not set in DB
export const COMPANY_NAME = process.env.COMPANY_NAME || 'Grape Master';
export const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || '123 Grape Street, Vineyard City, CA 94000';
export const COMPANY_PHONE = process.env.COMPANY_PHONE || process.env.ADMIN_PHONE || '';
export const COMPANY_EMAIL = process.env.COMPANY_EMAIL || process.env.ADMIN_EMAIL || 'hello@grapemaster.com';

// Stripe Payment
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const PAYMENT_SUCCESS_URL = process.env.PAYMENT_SUCCESS_URL || 'http://localhost:3000/payment/success';
export const PAYMENT_CANCEL_URL = process.env.PAYMENT_CANCEL_URL || 'http://localhost:3000/payment/cancel';

// Nodemailer (Fallback)
export const NODEMAILER_HOST = process.env.NODEMAILER_HOST;
export const NODEMAILER_PORT = process.env.NODEMAILER_PORT || 587;
export const NODEMAILER_USER = process.env.NODEMAILER_USER;
export const NODEMAILER_PASS = process.env.NODEMAILER_PASS;

// WhatsApp
export const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
export const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Delivery
export const DEFAULT_DELIVERY_CHARGE = process.env.DEFAULT_DELIVERY_CHARGE || 50;
