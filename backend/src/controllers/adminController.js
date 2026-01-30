const User = require('../models/User');
const { Op } = require('sequelize');
const { sequelize } = require('../config');

/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 * Protected - Admin only
 */
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      kycStatus, 
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { walletAddress: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: [
        'id',
        'walletAddress',
        'email',
        'name',
        'role',
        'kycStatus',
        'totalInvested',
        'totalTokens',
        'isActive',
        'lastLogin',
        'createdAt'
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 * Protected - Admin only
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['investor', 'project_manager', 'admin', 'auditor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      });
    }

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from changing their own role
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Update role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        userId: user.id,
        newRole: user.role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

/**
 * Get platform statistics
 * GET /api/admin/stats
 * Protected - Admin or Auditor
 */
const getPlatformStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.count();
    const usersByRole = await User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    const usersByKycStatus = await User.findAll({
      attributes: [
        'kycStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['kycStatus']
    });

    // Get investment statistics
    const totalInvested = await User.sum('totalInvested');
    const totalTokensIssued = await User.sum('totalTokens');

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.count({
      where: {
        lastLogin: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    // Format role statistics
    const roleStats = {};
    usersByRole.forEach(item => {
      roleStats[item.role] = parseInt(item.dataValues.count);
    });

    // Format KYC statistics
    const kycStats = {};
    usersByKycStatus.forEach(item => {
      kycStats[item.kycStatus] = parseInt(item.dataValues.count);
    });

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          recentRegistrations,
          byRole: roleStats,
          byKycStatus: kycStats
        },
        investments: {
          totalInvested: parseFloat(totalInvested || 0).toFixed(2),
          totalTokensIssued: parseFloat(totalTokensIssued || 0).toFixed(8)
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve platform statistics',
      error: error.message
    });
  }
};

/**
 * Soft delete user (deactivate)
 * DELETE /api/admin/users/:id
 * Protected - Admin only
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete by setting isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: {
        userId: user.id,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

/**
 * Get single user details
 * GET /api/admin/users/:id
 * Protected - Admin only
 */
const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: [
        'id',
        'walletAddress',
        'email',
        'name',
        'role',
        'kycStatus',
        'kycDocuments',
        'totalInvested',
        'totalTokens',
        'profileImage',
        'isActive',
        'lastLogin',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user details',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  getPlatformStats,
  deleteUser,
  getUserDetails
};
