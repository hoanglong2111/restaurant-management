const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/apiResponse');
const { generateToken, generateRefreshToken } = require('../utils/tokenUtils');
const User = require('../models/user');

// Google OAuth
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    asyncHandler(async (req, res) => {
        const token = generateToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        // Save refresh token to user
        req.user.refreshToken = refreshToken;
        await req.user.save();

        // Redirect to frontend with token
        const redirectUrl = `${process.env.CLIENT_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}`;
        res.redirect(redirectUrl);
    })
);

// Facebook OAuth
router.get(
    '/facebook',
    passport.authenticate('facebook', {
        scope: ['email'],
    })
);

// Facebook OAuth callback
router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
    asyncHandler(async (req, res) => {
        const token = generateToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        // Save refresh token to user
        req.user.refreshToken = refreshToken;
        await req.user.save();

        // Redirect to frontend with token
        const redirectUrl = `${process.env.CLIENT_URL}/oauth/callback?token=${token}&refreshToken=${refreshToken}`;
        res.redirect(redirectUrl);
    })
);

// Refresh token endpoint
router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return ApiResponse.unauthorized(res, 'Refresh token required');
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || user.refreshToken !== refreshToken) {
                return ApiResponse.unauthorized(res, 'Invalid refresh token');
            }

            const newToken = generateToken(user);
            const newRefreshToken = generateRefreshToken(user);

            user.refreshToken = newRefreshToken;
            await user.save();

            return ApiResponse.success(res, {
                token: newToken,
                refreshToken: newRefreshToken,
            });
        } catch (error) {
            return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
        }
    })
);

module.exports = router;
