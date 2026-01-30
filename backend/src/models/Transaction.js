const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'investment',
      'interest_claim',
      'milestone_completion',
      'fund_release',
      'token_transfer'
    ),
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
  from: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  to: {
    type: DataTypes.STRING(42),
    allowNull: false,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  amount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: false
  },
  tokenAmount: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  },
  blockNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gasUsed: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gasFee: {
    type: DataTypes.DECIMAL(20, 8),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['projectId'] },
    { fields: ['transactionHash'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = Transaction;
