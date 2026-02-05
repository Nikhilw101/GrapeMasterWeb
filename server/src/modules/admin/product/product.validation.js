import Joi from 'joi';

export const productSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(100),
    price: Joi.number().required().min(0),
    originalPrice: Joi.number().optional().min(0).default(0),
    description: Joi.string().optional().allow('').trim(),
    image: Joi.string().optional().allow('').trim(),
    category: Joi.string().optional().default('Red').trim(),
    stock: Joi.number().optional().min(0).default(100),
    unit: Joi.string().optional().trim().default('kg'),
    origin: Joi.string().optional().trim().default('Nashik'),
    grade: Joi.string().optional().valid('A++', 'A+', 'A', 'B').default('A+'),
    features: Joi.array().items(Joi.string()).optional().default([]),
    discount: Joi.number().optional().min(0).max(100).default(0),
    isFeatured: Joi.boolean().optional().default(false),
    isActive: Joi.boolean().optional().default(true)
});

export const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    price: Joi.number().min(0).optional(),
    originalPrice: Joi.number().min(0).optional(),
    description: Joi.string().optional().allow('').trim(),
    image: Joi.string().optional().allow('').trim(),
    category: Joi.string().optional().trim(),
    stock: Joi.number().min(0).optional(),
    unit: Joi.string().optional().trim(),
    origin: Joi.string().optional().trim(),
    grade: Joi.string().optional().valid('A++', 'A+', 'A', 'B'),
    features: Joi.array().items(Joi.string()).optional(),
    discount: Joi.number().min(0).max(100).optional(),
    isFeatured: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
});
