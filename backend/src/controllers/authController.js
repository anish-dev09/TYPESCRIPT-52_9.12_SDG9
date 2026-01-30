const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ethers } = require('ethers');
const bcrypt = require('bcrypt');

class AuthController {
  /**
   * Register new user with wallet
   */
  async register(req, res) {
    try {
      const { walletAddress, email, name, signature } = req.body;

      if (!walletAddress || !email || !name || !signature) {
        return res.status(400).json({ 
          success: false,
          message: 'Wallet address, email, name, and signature are required' 
        });
      }

      // Normalize wallet address
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { walletAddress: normalizedAddress } 
      });

      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'User with this wallet address already exists' 
        });
      }

      // Create new user
      const user = await User.create({
        walletAddress: normalizedAddress,
        email,
        name,
        role: 'investor',
        kycStatus: 'pending',
        totalInvested: 0,
        totalTokens: 0,
        isActive: true
      });

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

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
          totalInvested: user.totalInvested,
          totalTokens: user.totalTokens,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Registration failed',
        error: error.message 
      });
    }
  }

  /**
   * Login with wallet signature
   */
  async login(req, res) {
    try {
      const { walletAddress, signature } = req.body;

      if (!walletAddress || !signature) {
        return res.status(400).json({ 
          success: false,
          message: 'Wallet address and signature are required' 
        });
      }

      // Normalize wallet address
      const normalizedAddress = walletAddress.toLowerCase();

      // Find user
      const user = await User.findOne({ 
        where: { walletAddress: normalizedAddress } 
      });

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found. Please register first.' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'Account is inactive' 
        });
      }

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
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
          totalInvested: user.totalInvested,
          totalTokens: user.totalTokens,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Login failed',
        error: error.message 
      });
    }
  }

  /**
   * Login or register with wallet signature (legacy endpoint)
   */
  async loginWithWallet(req, res) {
    try {
      const { walletAddress, signature, message } = req.body;

      if (!walletAddress || !signature) {
        return res.status(400).json({ error: 'Missing required fields' });
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
      const user = await User.findByPk(req.userId);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      res.json({ 
        success: true,
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.kycStatus,
        totalInvested: user.totalInvested,
        totalTokens: user.totalTokens,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch profile',
        error: error.message 
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const { email, name } = req.body;
      
      if (!email && !name) {
        return res.status(400).json({ 
          success: false,
          message: 'At least one field (name or email) is required' 
        });
      }

      const user = await User.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        name: user.name,
        role: user.role,
        kycStatus: user.kycStatus,
        totalInvested: user.totalInvested,
        totalTokens: user.totalTokens,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to update profile',
        error: error.message 
      });
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

  /**
   * Email signup (register with email and password)
   */
  async emailSignup(req, res) {
    try {
      const { email, password, name, role } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({ 
          success: false,
          message: 'Email, password, and name are required' 
        });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Password must be at least 6 characters long' 
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'User with this email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Validate role if provided
      const validRoles = ['investor', 'project_manager', 'admin', 'auditor'];
      const userRole = role && validRoles.includes(role) ? role : 'investor';

      // Create new user
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role: userRole,
        kycStatus: 'pending',
        totalInvested: 0,
        totalTokens: 0,
        isActive: true,
        walletAddress: null // Email-only users don't have wallet initially
      });

      // Generate JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
          totalInvested: user.totalInvested,
          totalTokens: user.totalTokens,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Email signup error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Signup failed',
        error: error.message 
      });
    }
  }

  /**
   * Email login (login with email and password)
   */
  async emailLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'Email and password are required' 
        });
      }

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Check if user has password (email-based account)
      if (!user.password) {
        return res.status(401).json({ 
          success: false,
          message: 'This account uses wallet authentication. Please login with your wallet.' 
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({ 
          success: false,
          message: 'Account is inactive' 
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid email or password' 
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
          totalInvested: user.totalInvested,
          totalTokens: user.totalTokens,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Email login error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Login failed',
        error: error.message 
      });
    }
  }
}

module.exports = new AuthController();
