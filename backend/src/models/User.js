const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  walletAddress: {
    type: DataTypes.STRING(42),
    allowNull: true, // Changed to true to support email-only users
    unique: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Null for wallet-only users
    validate: {
      len: [6, 255] // Minimum 6 characters for password
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('investor', 'project_manager', 'admin', 'auditor'),
    defaultValue: 'investor',
    allowNull: false
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  kycDocuments: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  totalInvested: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 0
  },
  totalTokens: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['walletAddress'] },
    { fields: ['email'] },
    { fields: ['role'] },
    { fields: ['kycStatus'] }
  ]
});

module.exports = User;
