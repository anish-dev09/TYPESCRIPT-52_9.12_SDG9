const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All routes require admin role
router.use(authMiddleware);

// User management routes (admin only)
router.get('/users', requireRole('admin'), adminController.getAllUsers);
router.get('/users/:id', requireRole('admin'), adminController.getUserDetails);
router.put('/users/:id/role', requireRole('admin'), adminController.updateUserRole);
router.delete('/users/:id', requireRole('admin'), adminController.deleteUser);

// Statistics route (admin and auditor)
router.get('/stats', requireRole('admin', 'auditor'), adminController.getPlatformStats);

module.exports = router;
