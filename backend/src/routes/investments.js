const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   GET /api/investments/my
 * @desc    Get all investments for authenticated user
 * @access  Private
 */
router.get('/my', authMiddleware, investmentController.getUserInvestments);

/**
 * @route   GET /api/investments/stats
 * @desc    Get investment statistics for authenticated user
 * @access  Private
 */
router.get('/stats', authMiddleware, investmentController.getUserInvestmentStats);

/**
 * @route   GET /api/investments/project/:projectId
 * @desc    Get investments by project ID
 * @access  Private
 */
router.get('/project/:projectId', authMiddleware, investmentController.getProjectInvestments);

/**
 * @route   POST /api/investments
 * @desc    Record investment after blockchain transaction
 * @access  Private
 */
router.post('/', authMiddleware, investmentController.recordInvestment);

module.exports = router;
