import express from 'express';
import * as dealerController from './dealer.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { dealerSchema } from './dealer.validation.js';

const router = express.Router();

// Public routes
router.post('/', validate(dealerSchema), dealerController.submitDealerForm);
router.get('/:mobile', dealerController.getDealerStatus);

export default router;
