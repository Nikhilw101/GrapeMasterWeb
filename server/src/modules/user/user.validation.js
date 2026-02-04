import Joi from 'joi';

// Register validation schema
export const registerSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(100),
    mobile: Joi.string().required().pattern(/^[6-9]\d{9}$/),
    email: Joi.string().email().optional().allow(''),
    password: Joi.string().required().min(6).max(50)
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.max': 'Password must not exceed 50 characters'
        })
});

// Login validation schema
export const loginSchema = Joi.object({
    mobile: Joi.string().required().pattern(/^[6-9]\d{9}$/),
    password: Joi.string().required()
});

// Update profile validation schema
export const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    email: Joi.string().email().optional().allow('')
});

// Address validation schema
export const addressSchema = Joi.object({
    addressLine: Joi.string().required().trim(),
    city: Joi.string().required().trim(),
    state: Joi.string().required().trim(),
    pincode: Joi.string().required().pattern(/^\d{6}$/),
    isDefault: Joi.boolean().optional()
});

// Forgot password validation schema
export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

// Reset password validation schema
export const resetPasswordSchema = Joi.object({
    token: Joi.string().required()
        .messages({
            'any.required': 'Reset token is required'
        }),
    password: Joi.string().required().min(6).max(50)
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.max': 'Password must not exceed 50 characters',
            'any.required': 'Password is required'
        })
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
        .messages({
            'any.required': 'Refresh token is required'
        })
});
