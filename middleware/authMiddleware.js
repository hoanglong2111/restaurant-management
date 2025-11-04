const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Check if JWT_SECRET is defined
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined in environment variables');
                return res.status(500).json({ message: 'Server configuration error' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    message: 'Invalid token. Please login again.',
                    error: error.message
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Token expired. Please login again.',
                    error: error.message
                });
            }
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, isAdmin };