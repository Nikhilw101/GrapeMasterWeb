import Joi from 'joi';

// Admin login validation
export const adminLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Change admin password validation
export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(50)
});

// Update user status validation
export const updateUserStatusSchema = Joi.object({
    status: Joi.string().valid('active', 'inactive', 'blocked').required()
});
