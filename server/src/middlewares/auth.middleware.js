import { verifyAccessToken } from '../utils/jwt.util.js';
import User from '../modules/user/user.model.js';
import Admin from '../modules/admin/admin.model.js';
import logger from '../utils/logger.js';

/**
 * Protect routes - Verify JWT access token
 */
export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }

    try {
        // Verify token and decode payload
        const decoded = verifyAccessToken(token);

        let user;

        // Check if user exists based on role
        if (decoded.role === 'admin') {
            user = await Admin.findById(decoded.id);
        } else {
            user = await User.findById(decoded.id).select('-password');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.status !== 'active' && user.isActive !== true) { // Handle both User.status and Admin.isActive
            // Admin uses isActive (bool), User uses status (string)
            const isActive = decoded.role === 'admin' ? user.isActive : (user.status === 'active');

            if (!isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated or blocked'
                });
            }
        }

        // Attach user to request object
        req.user = {
            id: user._id,
            role: user.role
        };

        next();
    } catch (error) {
        logger.error(`Auth middleware error: ${error.message}`);

        // Handle specific token errors
        if (error.message === 'Access token expired') {
            return res.status(401).json({
                success: false,
                message: 'Access token expired. Please refresh your token',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.message === 'Invalid access token') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized, token verification failed'
        });
    }
};

/**
 * Optional authentication - Attach user if token is valid, but don't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password');

        if (user && user.status === 'active') {
            req.user = {
                id: user._id,
                role: user.role
            };
        }
    } catch (error) {
        logger.warn(`Optional auth - Invalid token: ${error.message}`);
    }

    next();
};

export default { protect, optionalAuth };
