import { errorResponse } from '../utils/apiResponse.js';

// Validation middleware factory
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return errorResponse(res, 'Validation Error', 400, errors);
        }

        next();
    };
};
