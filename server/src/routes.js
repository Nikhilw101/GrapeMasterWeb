import express from 'express';

// User Module Routes
import userRoutes from './modules/user/user.routes.js';
import orderRoutes from './modules/user/order/order.routes.js';
import cartRoutes from './modules/user/cart/cart.routes.js';
import dealerRoutes from './modules/user/dealer/dealer.routes.js';
import paymentRoutes from './modules/user/payment/payment.routes.js';

// Admin Module Routes
import adminRoutes from './modules/admin/admin.routes.js';
import productRoutes from './modules/admin/product/product.routes.js';
import adminOrderRoutes from './modules/admin/order/order.routes.js';
import settingsRoutes from './modules/admin/settings/settings.routes.js';

const router = express.Router();

// User Routes
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/dealers', dealerRoutes);
router.use('/payments', paymentRoutes);

// Admin Routes
router.use('/admin/products', productRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/settings', settingsRoutes);
router.use('/admin', adminRoutes);

export default router;
