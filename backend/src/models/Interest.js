const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Interest = sequelize.define('Interest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  investorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  accruedAmount: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    comment: 'Total accrued interest in tokens'
  },
  claimedAmount: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    comment: 'Total claimed interest in tokens'
  },
  pendingAmount: {
    type: DataTypes.DECIMAL(20, 8),
    defaultValue: 0,
    comment: 'Pending interest available to claim'
  },
  lastAccrualDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastClaimDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  claimCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'interests',
  timestamps: true,
  indexes: [
    { fields: ['investorId'] },
    { fields: ['projectId'] },
    { fields: ['lastAccrualDate'] }
  ]
});

module.exports = Interest;
