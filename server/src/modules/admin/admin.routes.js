import express from 'express';
import * as adminController from './admin.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/admin.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { adminLoginSchema, changePasswordSchema, updateUserStatusSchema } from './admin.validation.js';

const router = express.Router();

// Public routes
router.post('/login', validate(adminLoginSchema), adminController.login);

// Protected routes
router.use(protect, isAdmin);

router.get('/dashboard', adminController.getDashboard);
router.put('/change-password', validate(changePasswordSchema), adminController.changePassword);

// User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/status', validate(updateUserStatusSchema), adminController.updateUserStatus);

export default router;
