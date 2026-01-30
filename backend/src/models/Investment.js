const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Investment = sequelize.define('Investment', {
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
  amount: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tokensMinted: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false
  },
  transactionHash: {
    type: DataTypes.STRING(66),
    allowNull: false,
    unique: true,
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  gasUsed: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gasFee: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  }
}, {
  tableName: 'investments',
  timestamps: true,
  indexes: [
    { fields: ['investorId'] },
    { fields: ['projectId'] },
    { fields: ['transactionHash'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Investment;
