import Joi from 'joi';

export const productSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(100),
    weight: Joi.string().required().trim(),
    price: Joi.number().required().min(0),
    description: Joi.string().optional().allow('').trim(),
    image: Joi.string().optional().allow('').trim(),
    category: Joi.string().optional().default('Grapes').trim(),
    stock: Joi.number().optional().min(0).default(100),
    origin: Joi.string().optional().trim().default('Nashik'),
    discount: Joi.number().optional().min(0).max(100).default(0),
    isFeatured: Joi.boolean().optional().default(false),
    grade: Joi.string().optional().trim().default('A'),
    isActive: Joi.boolean().optional().default(true)
});

export const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    weight: Joi.string().trim().optional(),
    price: Joi.number().min(0).optional(),
    description: Joi.string().optional().allow('').trim(),
    image: Joi.string().optional().allow('').trim(),
    category: Joi.string().optional().trim(),
    stock: Joi.number().min(0).optional(),
    origin: Joi.string().optional().trim(),
    discount: Joi.number().min(0).max(100).optional(),
    isFeatured: Joi.boolean().optional(),
    grade: Joi.string().optional().trim(),
    isActive: Joi.boolean().optional()
});
