import logger from '../utils/logger.js';

// Global error handler middleware
const errorMiddleware = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    logger.error(err.stack);

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        return res.status(400).json({
            success: false,
            message,
            error: err.message
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: message
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorMiddleware;
