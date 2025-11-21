const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for auth routes (login, register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
});

// Payment route limiter
const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // 3 payment attempts per minute
    message: 'Too many payment requests, please try again later.',
});

module.exports = {
    apiLimiter,
    authLimiter,
    paymentLimiter,
};
