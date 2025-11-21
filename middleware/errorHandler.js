const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
    let { statusCode = 500, message } = err;

    // Log error
    logger.error(`Error: ${message} | Status: ${statusCode} | Path: ${req.path}`);
    if (process.env.NODE_ENV === 'development') {
        logger.error(err.stack);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message,
        }));
        return ApiResponse.badRequest(res, 'Validation failed', errors);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern)[0];
        message = `${field} already exists`;
        return ApiResponse.conflict(res, message);
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
        return ApiResponse.badRequest(res, message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        return ApiResponse.unauthorized(res, message);
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        return ApiResponse.unauthorized(res, message);
    }

    // Default error response
    return ApiResponse.error(res, message, statusCode);
};

// 404 handler
const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

// Async handler wrapper
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    asyncHandler,
};
