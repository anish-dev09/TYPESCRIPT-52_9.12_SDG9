const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/milestones/project/:projectId
 * @desc    Get milestones for a project
 * @access  Public
 */
router.get('/project/:projectId', optionalAuth, milestoneController.getProjectMilestones);

/**
 * @route   GET /api/milestones/:id
 * @desc    Get milestone by ID
 * @access  Public
 */
router.get('/:id', milestoneController.getMilestoneById);

/**
 * @route   POST /api/milestones/project/:projectId
 * @desc    Create a new milestone
 * @access  Private (Project Manager or Admin)
 */
router.post('/project/:projectId', authMiddleware, requireRole('project_manager', 'admin'), milestoneController.createMilestone);

/**
 * @route   PUT /api/milestones/:id
 * @desc    Update milestone status
 * @access  Private (Project Manager or Admin)
 */
router.put('/:id', authMiddleware, requireRole('project_manager', 'admin'), milestoneController.updateMilestoneStatus);

module.exports = router;
