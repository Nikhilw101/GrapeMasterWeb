import express from 'express';
import * as settingsController from './settings.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { isAdmin } from '../../../middlewares/admin.middleware.js';

const router = express.Router();

// Public route to get specific setting
router.get('/:key', settingsController.getSettingByKey);

// Protected admin routes
router.get('/', protect, isAdmin, settingsController.getAllSettings);
router.post('/', protect, isAdmin, settingsController.createSetting);
router.put('/:key', protect, isAdmin, settingsController.updateSetting);

export default router;
