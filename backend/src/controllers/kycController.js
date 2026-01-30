const User = require('../models/User');

/**
 * Submit KYC documents
 * POST /api/kyc/submit
 * Protected - Any authenticated user
 */
const submitKYC = async (req, res) => {
  try {
    const { documentType, documentNumber, fullName, dateOfBirth, address, country } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!documentType || !documentNumber || !fullName || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Missing required KYC fields'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update KYC documents and status
    const kycData = {
      documentType,
      documentNumber,
      fullName,
      dateOfBirth,
      address,
      country,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    user.kycDocuments = kycData;
    user.kycStatus = 'pending';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC documents submitted successfully',
      data: {
        kycStatus: user.kycStatus,
        submittedAt: kycData.submittedAt
      }
    });

  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit KYC documents',
      error: error.message
    });
  }
};

/**
 * Verify KYC documents (Admin only)
 * POST /api/kyc/verify/:userId
 * Protected - Admin only
 */
const verifyKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be either "verified" or "rejected"'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if KYC documents exist
    if (!user.kycDocuments || Object.keys(user.kycDocuments).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No KYC documents found for this user'
      });
    }

    // Update KYC status
    user.kycStatus = status;
    
    // Add verification details to kycDocuments
    const updatedKycData = {
      ...user.kycDocuments,
      verificationStatus: status,
      verifiedBy: req.user.id,
      verifiedAt: new Date().toISOString(),
      rejectionReason: status === 'rejected' ? rejectionReason : null
    };
    
    user.kycDocuments = updatedKycData;
    await user.save();

    res.status(200).json({
      success: true,
      message: `KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully`,
      data: {
        userId: user.id,
        kycStatus: user.kycStatus,
        verifiedAt: updatedKycData.verifiedAt
      }
    });

  } catch (error) {
    console.error('KYC verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify KYC documents',
      error: error.message
    });
  }
};

/**
 * Get pending KYC submissions (Admin only)
 * GET /api/kyc/pending
 * Protected - Admin only
 */
const getPendingKYC = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where: { kycStatus: 'pending' },
      attributes: [
        'id',
        'walletAddress',
        'email',
        'name',
        'kycStatus',
        'kycDocuments',
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
    console.error('Get pending KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending KYC submissions',
      error: error.message
    });
  }
};

/**
 * Get user's own KYC status
 * GET /api/kyc/status
 * Protected - Any authenticated user
 */
const getUserKYC = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'kycStatus', 'kycDocuments']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data from kycDocuments before sending
    const kycData = user.kycDocuments || {};
    const sanitizedKycData = {
      submittedAt: kycData.submittedAt,
      verifiedAt: kycData.verifiedAt,
      rejectionReason: kycData.rejectionReason,
      status: kycData.status
    };

    res.status(200).json({
      success: true,
      data: {
        kycStatus: user.kycStatus,
        kycData: sanitizedKycData
      }
    });

  } catch (error) {
    console.error('Get user KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve KYC status',
      error: error.message
    });
  }
};

module.exports = {
  submitKYC,
  verifyKYC,
  getPendingKYC,
  getUserKYC
};
