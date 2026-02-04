import Joi from 'joi';

// Initiate payment validation
export const initiatePaymentSchema = Joi.object({
    orderId: Joi.string().required()
});

// Retry payment validation
export const retryPaymentSchema = Joi.object({
    orderId: Joi.string().required()
});

// Payment callback validation (PhonePe webhook)
export const callbackSchema = Joi.object({
    response: Joi.string().required(),
    checksum: Joi.string().required()
});

export default {
    initiatePaymentSchema,
    retryPaymentSchema,
    callbackSchema
};
