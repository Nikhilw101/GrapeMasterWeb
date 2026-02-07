import Joi from 'joi';

// Admin login validation (email + password)
export const adminLoginSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
});

// Admin forgot password (mail-based reset)
export const adminForgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().trim().lowercase()
});

// Admin reset password (token from email link + new password)
export const adminResetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().required().min(6).max(50)
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password must not exceed 50 characters'
        })
});

// Change admin password (when logged in)
export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(50)
});

// Update user status validation
export const updateUserStatusSchema = Joi.object({
    status: Joi.string().valid('active', 'inactive', 'blocked').required()
});
