const express = require('express');
const { authenticateToken, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/user/me
 * Get current user information (protected route)
 */
router.get('/me', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

/**
 * GET /api/user/profile
 * Get current user profile (requires email verification)
 */
router.get('/profile', authenticateToken, requireEmailVerification, (req, res) => {
    res.json({
        success: true,
        message: 'Profile access granted',
        user: req.user
    });
});

module.exports = router; 