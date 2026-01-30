const { Milestone, Project } = require('../models');
const blockchainService = require('../services/blockchainService');

class MilestoneController {
  /**
   * Get milestones for a project
   */
  async getProjectMilestones(req, res) {
    try {
      const { projectId } = req.params;

      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const milestones = await Milestone.findAll({
        where: { projectId },
        order: [['milestoneIndex', 'ASC']]
      });

      // Fetch blockchain data
      try {
        const blockchainMilestones = await blockchainService.getProjectMilestones(project.projectId);
        milestones.forEach((milestone, index) => {
          if (blockchainMilestones[index]) {
            milestone.dataValues.blockchainData = blockchainMilestones[index];
          }
        });
      } catch (blockchainError) {
        console.error('Blockchain milestone fetch error:', blockchainError);
      }

      res.json({ milestones });
    } catch (error) {
      console.error('Get milestones error:', error);
      res.status(500).json({ error: 'Failed to fetch milestones' });
    }
  }

  /**
   * Create a new milestone
   */
  async createMilestone(req, res) {
    try {
      const { projectId } = req.params;
      const {
        name,
        description,
        targetDate,
        fundsToRelease
      } = req.body;

      // Validation
      if (!name || !description || !targetDate || !fundsToRelease) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Check authorization
      if (project.managerId !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      // Get next milestone index
      const milestoneCount = await Milestone.count({ where: { projectId } });

      const milestone = await Milestone.create({
        projectId,
        milestoneIndex: milestoneCount,
        name,
        description,
        targetDate: new Date(targetDate),
        fundsToRelease,
        status: 'pending'
      });

      res.status(201).json({
        success: true,
        milestone
      });
    } catch (error) {
      console.error('Create milestone error:', error);
      res.status(500).json({ error: 'Failed to create milestone' });
    }
  }

  /**
   * Update milestone status
   */
  async updateMilestoneStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, evidenceHash, evidenceUrl, transactionHash, notes } = req.body;

      const milestone = await Milestone.findByPk(id, {
        include: [{ model: Project, as: 'project' }]
      });

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      // Check authorization
      if (milestone.project.managerId !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updates = { status };
      
      if (status === 'completed') {
        updates.completedDate = new Date();
        updates.evidenceHash = evidenceHash;
        updates.evidenceUrl = evidenceUrl;
        updates.verifiedBy = req.walletAddress;
        updates.transactionHash = transactionHash;

        // Update project funds released
        await milestone.project.update({
          fundsReleased: parseFloat(milestone.project.fundsReleased) + parseFloat(milestone.fundsToRelease)
        });
      }

      if (notes) {
        updates.notes = notes;
      }

      await milestone.update(updates);

      res.json({
        success: true,
        milestone
      });
    } catch (error) {
      console.error('Update milestone error:', error);
      res.status(500).json({ error: 'Failed to update milestone' });
    }
  }

  /**
   * Get milestone by ID
   */
  async getMilestoneById(req, res) {
    try {
      const { id } = req.params;

      const milestone = await Milestone.findByPk(id, {
        include: [{ model: Project, as: 'project' }]
      });

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      res.json({ milestone });
    } catch (error) {
      console.error('Get milestone error:', error);
      res.status(500).json({ error: 'Failed to fetch milestone' });
    }
  }
}

module.exports = new MilestoneController();
