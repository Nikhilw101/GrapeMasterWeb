import express from 'express';

// User Module Routes
import userRoutes from './modules/user/user.routes.js';
import orderRoutes from './modules/user/order/order.routes.js';
import cartRoutes from './modules/user/cart/cart.routes.js';
import paymentRoutes from './modules/user/payment/payment.routes.js';

// Admin Module Routes
import adminRoutes from './modules/admin/admin.routes.js';
import productRoutes from './modules/admin/product/product.routes.js';
import adminOrderRoutes from './modules/admin/order/order.routes.js';
import settingsRoutes from './modules/admin/settings/settings.routes.js';
import dealerRoutes, { dealerAdminRoutes } from './modules/dealer/dealer.routes.js';

const router = express.Router();

// User Routes
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/payments', paymentRoutes);

// Custom Modules
import uploadRoutes from './modules/upload/upload.routes.js';

// Admin Routes
router.use('/admin/upload', uploadRoutes); // Moved upload under admin namespace
router.use('/admin/products', productRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin/dealer-requests', dealerAdminRoutes);
router.use('/admin', adminRoutes);

router.use('/dealer-requests', dealerRoutes);

export default router;
