import { USER_ROLES } from '../utils/constants.js';
import { errorResponse } from '../utils/apiResponse.js';

// Check if user is admin
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
    }

    if (req.user.role !== USER_ROLES.ADMIN) {
        return errorResponse(res, 'Access denied. Admin privileges required.', 403);
    }

    next();
};
