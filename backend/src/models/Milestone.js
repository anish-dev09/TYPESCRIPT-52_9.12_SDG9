const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Milestone = sequelize.define('Milestone', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  milestoneIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Index in the smart contract milestone array'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  targetDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fundsToRelease: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'delayed', 'failed'),
    defaultValue: 'pending',
    allowNull: false
  },
  completedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  evidenceHash: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'IPFS hash of completion evidence'
  },
  evidenceUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Full IPFS URL to evidence'
  },
  verifiedBy: {
    type: DataTypes.STRING(42),
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{40}$/
    }
  },
  transactionHash: {
    type: DataTypes.STRING(66),
    allowNull: true,
    validate: {
      is: /^0x[a-fA-F0-9]{64}$/
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'milestones',
  timestamps: true,
  indexes: [
    { fields: ['projectId'] },
    { fields: ['status'] },
    { fields: ['targetDate'] },
    { fields: ['milestoneIndex'] }
  ]
});

module.exports = Milestone;
