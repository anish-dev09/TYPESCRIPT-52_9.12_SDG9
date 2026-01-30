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
 * @route   POST /api/auth/register
 * @desc    Register new user with wallet
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login with wallet signature
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/wallet
 * @desc    Login or register with wallet signature (legacy)
 * @access  Public
 */
router.post('/wallet', authController.loginWithWallet);

/**
 * @route   POST /api/auth/signup
 * @desc    Register with email and password
 * @access  Public
 */
router.post('/signup', authController.emailSignup);

/**
 * @route   POST /api/auth/email-login
 * @desc    Login with email and password
 * @access  Public
 */
router.post('/email-login', authController.emailLogin);

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
