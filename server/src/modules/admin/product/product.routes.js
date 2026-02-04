import express from 'express';
import * as productController from './product.controller.js';
import { protect } from '../../../middlewares/auth.middleware.js';
import { isAdmin } from '../../../middlewares/admin.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { productSchema, updateProductSchema } from './product.validation.js';

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected admin routes
router.post('/', protect, isAdmin, validate(productSchema), productController.createProduct);
router.put('/:id', protect, isAdmin, validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', protect, isAdmin, productController.deleteProduct);
router.patch('/:id/toggle', protect, isAdmin, productController.toggleProductStatus);

export default router;
