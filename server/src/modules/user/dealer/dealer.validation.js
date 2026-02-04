import Joi from 'joi';
import { DEALER_TYPES } from '../../../utils/constants.js';

export const dealerSchema = Joi.object({
    fullName: Joi.string().required().trim().min(2).max(100),
    mobile: Joi.string().required().pattern(/^[6-9]\d{9}$/),
    email: Joi.string().email().required(),
    city: Joi.string().required().trim(),
    state: Joi.string().required().trim(),
    apartmentName: Joi.string().trim().optional().allow(''),
    businessName: Joi.string().required().trim(),
    type: Joi.string().valid(...Object.values(DEALER_TYPES)).required(),
    distributionCapacity: Joi.string().required().trim(),
    experience: Joi.string().trim().optional().allow(''),
    message: Joi.string().trim().optional().allow('')
});
