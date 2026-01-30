const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    comment: 'On-chain project ID from BondIssuance contract'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('transport', 'energy', 'water', 'telecom', 'social', 'mixed'),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fundingGoal: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  fundsRaised: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 0
  },
  fundsReleased: {
    type: DataTypes.DECIMAL(20, 2),
    defaultValue: 0
  },
  interestRateAnnual: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Annual interest rate in percentage (e.g., 8.50)'
  },
  durationMonths: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  projectWallet: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  managerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'funded', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'draft',
    allowNull: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expectedEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sdgGoals: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [9],
    comment: 'UN SDG goals addressed (default: SDG 9 - Infrastructure)'
  },
  contractAddress: {
    type: DataTypes.STRING(42),
    allowNull: true,
    comment: 'Bond token contract address if project-specific'
  },
  transactionHash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    comment: 'Transaction hash of project creation on blockchain'
  },
  investorCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'projects',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['managerId'] }
  ]
});

module.exports = Project;
