const { Project, User, Investment, Milestone } = require('../models');
const blockchainService = require('../services/blockchainService');
const { Op } = require('sequelize');

class ProjectController {
  /**
   * Get all projects with filters
   */
  async getAllProjects(req, res) {
    try {
      const { 
        status, 
        category, 
        search, 
        page = 1, 
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const where = {};
      
      if (status) where.status = status;
      if (category) where.category = category;
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows: projects } = await Project.findAndCountAll({
        where,
        include: [
          { model: User, as: 'manager', attributes: ['id', 'name', 'walletAddress'] }
        ],
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder]]
      });

      res.json({
        projects,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(req, res) {
    try {
      const { id } = req.params;

      const project = await Project.findByPk(id, {
        include: [
          { model: User, as: 'manager', attributes: ['id', 'name', 'walletAddress', 'email'] },
          { model: Milestone, as: 'milestones', order: [['targetDate', 'ASC']] },
          { model: Investment, as: 'investments', include: [
            { model: User, as: 'investor', attributes: ['id', 'name', 'walletAddress'] }
          ]}
        ]
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Fetch blockchain data
      try {
        const blockchainData = await blockchainService.getProject(project.projectId);
        project.dataValues.blockchainData = blockchainData;
      } catch (blockchainError) {
        console.error('Blockchain fetch error:', blockchainError);
        project.dataValues.blockchainData = null;
      }

      res.json({ project });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  /**
   * Create new project
   */
  async createProject(req, res) {
    try {
      const {
        name,
        description,
        category,
        location,
        fundingGoal,
        interestRateAnnual,
        durationMonths,
        projectWallet,
        images,
        documents,
        startDate,
        expectedEndDate,
        sdgGoals
      } = req.body;

      // Validation
      if (!name || !description || !category || !location || !fundingGoal || !interestRateAnnual || !durationMonths || !projectWallet) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get next project ID (should match blockchain)
      const projectCount = await Project.count();
      const projectId = projectCount + 1;

      const project = await Project.create({
        projectId,
        name,
        description,
        category,
        location,
        fundingGoal,
        interestRateAnnual,
        durationMonths,
        projectWallet,
        managerId: req.userId,
        status: 'draft',
        images: images || [],
        documents: documents || {},
        startDate: startDate || new Date(),
        expectedEndDate: expectedEndDate || new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000),
        sdgGoals: sdgGoals || [9]
      });

      res.status(201).json({
        success: true,
        project
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  /**
   * Update project
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const project = await Project.findByPk(id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check if user is manager or admin
      if (project.managerId !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this project' });
      }

      await project.update(updates);

      res.json({
        success: true,
        project
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(req, res) {
    try {
      const { id } = req.params;

      const project = await Project.findByPk(id, {
        include: [
          { model: Investment, as: 'investments' },
          { model: Milestone, as: 'milestones' }
        ]
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const stats = {
        fundingProgress: project.fundingGoal > 0 
          ? (parseFloat(project.fundsRaised) / parseFloat(project.fundingGoal) * 100).toFixed(2)
          : 0,
        releaseProgress: project.fundsRaised > 0
          ? (parseFloat(project.fundsReleased) / parseFloat(project.fundsRaised) * 100).toFixed(2)
          : 0,
        totalInvestments: project.investments.length,
        totalInvestors: project.investorCount,
        totalMilestones: project.milestones.length,
        completedMilestones: project.milestones.filter(m => m.status === 'completed').length,
        pendingMilestones: project.milestones.filter(m => m.status === 'pending').length,
        fundsInEscrow: (parseFloat(project.fundsRaised) - parseFloat(project.fundsReleased)).toFixed(2)
      };

      res.json({ stats });
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({ error: 'Failed to fetch project statistics' });
    }
  }
}

module.exports = new ProjectController();
