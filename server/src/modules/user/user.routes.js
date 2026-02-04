import express from 'express';
import * as userController from './user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { loginRateLimiter, passwordResetRateLimiter, registrationRateLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    addressSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema
} from './user.validation.js';

const router = express.Router();

// Public routes with rate limiting
router.post('/register', registrationRateLimiter, validate(registerSchema), userController.register);
router.post('/login', loginRateLimiter, validate(loginSchema), userController.login);
router.post('/refresh-token', validate(refreshTokenSchema), userController.refreshToken);
router.post('/forgot-password', passwordResetRateLimiter, validate(forgotPasswordSchema), userController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), userController.resetPassword);

// Protected routes
router.use(protect); // All routes below this require authentication

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.post('/logout', userController.logout);

// Address management
router.post('/address', validate(addressSchema), userController.addAddress);
router.put('/address/:addressId', validate(addressSchema), userController.updateAddress);
router.delete('/address/:addressId', userController.deleteAddress);

export default router;
