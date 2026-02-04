import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../utils/constants.js';

/**
 * Rate limiter for login endpoint
 * Prevents brute force attacks
 */
export const loginRateLimiter = rateLimit({
    windowMs: RATE_LIMITS.LOGIN.WINDOW_MS,
    max: RATE_LIMITS.LOGIN.MAX_REQUESTS,
    message: {
        success: false,
        message: RATE_LIMITS.LOGIN.MESSAGE
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip successful requests (only count failed logins)
    skipSuccessfulRequests: false,
    // Custom key generator (use IP + mobile if available)
    // keyGenerator: (req) => {
    //     return req.body.mobile || req.ip;
    // },
    // validate: { trustProxy: false }
});

/**
 * Rate limiter for password reset requests
 * Prevents abuse of password reset functionality
 */
export const passwordResetRateLimiter = rateLimit({
    windowMs: RATE_LIMITS.PASSWORD_RESET.WINDOW_MS,
    max: RATE_LIMITS.PASSWORD_RESET.MAX_REQUESTS,
    message: {
        success: false,
        message: RATE_LIMITS.PASSWORD_RESET.MESSAGE
    },
    standardHeaders: true,
    legacyHeaders: false,
    // keyGenerator: (req) => {
    //     return req.body.email || req.ip;
    // },
    // validate: { trustProxy: false }
});

/**
 * Rate limiter for registration endpoint
 * Prevents spam registrations
 */
export const registrationRateLimiter = rateLimit({
    windowMs: RATE_LIMITS.REGISTRATION.WINDOW_MS,
    max: RATE_LIMITS.REGISTRATION.MAX_REQUESTS,
    message: {
        success: false,
        message: RATE_LIMITS.REGISTRATION.MESSAGE
    },
    standardHeaders: true,
    legacyHeaders: false,
    // keyGenerator: (req) => {
    //     return req.ip;
    // },
    // validate: { trustProxy: false }
});

/**
 * General API rate limiter
 * Applied to all API requests
 */
export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false }
});

export default {
    loginRateLimiter,
    passwordResetRateLimiter,
    registrationRateLimiter,
    apiRateLimiter
};
