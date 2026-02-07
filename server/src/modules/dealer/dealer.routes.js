import express from 'express';
import * as dealerController from './dealer.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { isAdmin } from '../../middlewares/admin.middleware.js';

const publicRouter = express.Router();
publicRouter.post('/', dealerController.submitDealerRequest);

const adminRouter = express.Router();
adminRouter.get('/', protect, isAdmin, dealerController.listDealerRequests);
adminRouter.get('/:id', protect, isAdmin, dealerController.getDealerRequest);
adminRouter.put('/:id/status', protect, isAdmin, dealerController.updateDealerRequestStatus);

export default publicRouter;
export { adminRouter as dealerAdminRoutes };
