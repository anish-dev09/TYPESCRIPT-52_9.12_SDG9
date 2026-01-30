const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth');

/**
 * @route   GET /api/projects
 * @desc    Get all projects with filters
 * @access  Public
 */
router.get('/', optionalAuth, projectController.getAllProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, projectController.getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private (Project Manager or Admin)
 */
router.post('/', authMiddleware, requireRole('project_manager', 'admin'), projectController.createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private (Project Manager or Admin)
 */
router.put('/:id', authMiddleware, projectController.updateProject);

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get project statistics
 * @access  Public
 */
router.get('/:id/stats', projectController.getProjectStats);

module.exports = router;
