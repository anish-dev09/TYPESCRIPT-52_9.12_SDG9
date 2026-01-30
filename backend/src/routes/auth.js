const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/auth/nonce
 * @desc    Get nonce for wallet signature
 * @access  Public
 */
router.get('/nonce', authController.getNonce);

/**
 * @route   POST /api/auth/login
 * @desc    Login or register with wallet signature
 * @access  Public
 */
router.post('/login', authController.loginWithWallet);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
