const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Submit KYC documents (any authenticated user)
router.post('/submit', authMiddleware, kycController.submitKYC);

// Get user's own KYC status (any authenticated user)
router.get('/status', authMiddleware, kycController.getUserKYC);

// Admin-only routes
router.post('/verify/:userId', authMiddleware, requireRole('admin'), kycController.verifyKYC);
router.get('/pending', authMiddleware, requireRole('admin'), kycController.getPendingKYC);

module.exports = router;
