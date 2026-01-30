const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ethers } = require('ethers');

class AuthController {
  /**
   * Login or register with wallet signature
   */
  async loginWithWallet(req, res) {
    try {
      const { walletAddress, signature, message } = req.body;

      if (!walletAddress || !signature || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Find or create user
      let user = await User.findOne({ where: { walletAddress: walletAddress.toLowerCase() } });
      
      if (!user) {
        user = await User.create({
          walletAddress: walletAddress.toLowerCase(),
          role: 'investor',
          kycStatus: 'pending',
          isActive: true
        });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Generate JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          walletAddress: user.walletAddress,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
          totalInvested: user.totalInvested,
          totalTokens: user.totalTokens
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const { email, name, profileImage } = req.body;
      
      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({
        email: email || user.email,
        name: name || user.name,
        profileImage: profileImage || user.profileImage
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  /**
   * Request nonce for wallet signature
   */
  async getNonce(req, res) {
    try {
      const { walletAddress } = req.query;
      
      if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
      }

      const message = `Sign this message to authenticate with INFRACHAIN.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
      
      res.json({ message });
    } catch (error) {
      console.error('Get nonce error:', error);
      res.status(500).json({ error: 'Failed to generate nonce' });
    }
  }
}

module.exports = new AuthController();
