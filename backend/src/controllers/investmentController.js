const { Investment, User, Project, Transaction } = require('../models');
const blockchainService = require('../services/blockchainService');

class InvestmentController {
  /**
   * Get all investments for authenticated user
   */
  async getUserInvestments(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: investments } = await Investment.findAndCountAll({
        where: { investorId: req.userId },
        include: [
          { model: Project, as: 'project', attributes: ['id', 'name', 'category', 'status', 'interestRateAnnual'] }
        ],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        investments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get user investments error:', error);
      res.status(500).json({ error: 'Failed to fetch investments' });
    }
  }

  /**
   * Get investments by project ID
   */
  async getProjectInvestments(req, res) {
    try {
      const { projectId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const { count, rows: investments } = await Investment.findAndCountAll({
        where: { projectId },
        include: [
          { model: User, as: 'investor', attributes: ['id', 'name', 'walletAddress'] }
        ],
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        investments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get project investments error:', error);
      res.status(500).json({ error: 'Failed to fetch project investments' });
    }
  }

  /**
   * Record investment after blockchain transaction
   */
  async recordInvestment(req, res) {
    try {
      const {
        projectId,
        amount,
        tokensMinted,
        transactionHash
      } = req.body;

      // Validation
      if (!projectId || !amount || !tokensMinted || !transactionHash) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const project = await Project.findByPk(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Verify transaction on blockchain
      const txStatus = await blockchainService.verifyTransaction(transactionHash);
      
      if (!txStatus.confirmed) {
        return res.status(400).json({ error: 'Transaction not confirmed yet' });
      }

      // Check if investment already recorded
      const existing = await Investment.findOne({ where: { transactionHash } });
      if (existing) {
        return res.status(409).json({ error: 'Investment already recorded' });
      }

      // Create investment record
      const investment = await Investment.create({
        investorId: req.userId,
        projectId,
        amount,
        tokensMinted,
        transactionHash,
        blockNumber: txStatus.blockNumber,
        status: 'confirmed',
        gasUsed: txStatus.gasUsed
      });

      // Update project stats
      await project.update({
        fundsRaised: parseFloat(project.fundsRaised) + parseFloat(amount),
        investorCount: await Investment.count({
          where: { projectId },
          distinct: true,
          col: 'investorId'
        })
      });

      // Update user stats
      const user = await User.findByPk(req.userId);
      await user.update({
        totalInvested: parseFloat(user.totalInvested) + parseFloat(amount),
        totalTokens: parseFloat(user.totalTokens) + parseFloat(tokensMinted)
      });

      // Create transaction record
      await Transaction.create({
        userId: req.userId,
        projectId,
        type: 'investment',
        transactionHash,
        from: req.walletAddress,
        to: project.projectWallet,
        amount,
        tokenAmount: tokensMinted,
        blockNumber: txStatus.blockNumber,
        status: 'confirmed'
      });

      res.status(201).json({
        success: true,
        investment
      });
    } catch (error) {
      console.error('Record investment error:', error);
      res.status(500).json({ error: 'Failed to record investment' });
    }
  }

  /**
   * Get investment statistics for user
   */
  async getUserInvestmentStats(req, res) {
    try {
      const investments = await Investment.findAll({
        where: { 
          investorId: req.userId,
          status: 'confirmed'
        },
        include: [
          { model: Project, as: 'project' }
        ]
      });

      const stats = {
        totalInvested: investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
        totalTokens: investments.reduce((sum, inv) => sum + parseFloat(inv.tokensMinted), 0),
        projectCount: [...new Set(investments.map(inv => inv.projectId))].length,
        investmentCount: investments.length,
        byCategory: {},
        byStatus: {}
      };

      investments.forEach(inv => {
        const category = inv.project.category;
        const status = inv.project.status;
        
        stats.byCategory[category] = (stats.byCategory[category] || 0) + parseFloat(inv.amount);
        stats.byStatus[status] = (stats.byStatus[status] || 0) + parseFloat(inv.amount);
      });

      res.json({ stats });
    } catch (error) {
      console.error('Get investment stats error:', error);
      res.status(500).json({ error: 'Failed to fetch investment statistics' });
    }
  }
}

module.exports = new InvestmentController();
