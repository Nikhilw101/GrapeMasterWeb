// User Roles
export const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin'
};

// Order Status
export const ORDER_STATUS = {
    CREATED: 'created',
    AWAITING_PAYMENT: 'awaiting_payment',
    PAYMENT_COMPLETED: 'payment_completed',
    SUBMITTED: 'submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CONFIRMED: 'confirmed',
    DISPATCHED: 'dispatched',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

// Payment Status
export const PAYMENT_STATUS = {
    INITIATED: 'initiated',
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// Payment Methods
export const PAYMENT_METHODS = {
    UPI: 'upi',
    STRIPE: 'stripe',
    COD: 'cod'
};

// Authentication
export const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password'
};

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
export const RESET_TOKEN_EXPIRE = 10 * 60 * 1000; // 10 minutes

// Rate Limiting (requests per window)
export const RATE_LIMITS = {
    LOGIN: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 5,
        MESSAGE: 'Too many login attempts, please try again after 15 minutes'
    },
    PASSWORD_RESET: {
        WINDOW_MS: 60 * 60 * 1000, // 1 hour
        MAX_REQUESTS: 3,
        MESSAGE: 'Too many password reset requests, please try again after 1 hour'
    },
    REGISTRATION: {
        WINDOW_MS: 60 * 60 * 1000, // 1 hour
        MAX_REQUESTS: 10,
        MESSAGE: 'Too many registration attempts, please try again after 1 hour'
    }
};
