const User = require('./User');
const Project = require('./Project');
const Investment = require('./Investment');
const Milestone = require('./Milestone');
const Interest = require('./Interest');
const Transaction = require('./Transaction');
const Notification = require('./Notification');

// Define associations

// User - Project (Manager)
User.hasMany(Project, { foreignKey: 'managerId', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// User - Investment
User.hasMany(Investment, { foreignKey: 'investorId', as: 'investments' });
Investment.belongsTo(User, { foreignKey: 'investorId', as: 'investor' });

// Project - Investment
Project.hasMany(Investment, { foreignKey: 'projectId', as: 'investments' });
Investment.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project - Milestone
Project.hasMany(Milestone, { foreignKey: 'projectId', as: 'milestones' });
Milestone.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User - Interest
User.hasMany(Interest, { foreignKey: 'investorId', as: 'interests' });
Interest.belongsTo(User, { foreignKey: 'investorId', as: 'investor' });

// Project - Interest
Project.hasMany(Interest, { foreignKey: 'projectId', as: 'interests' });
Interest.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User - Transaction
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Project - Transaction
Project.hasMany(Transaction, { foreignKey: 'projectId', as: 'transactions' });
Transaction.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User - Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Project,
  Investment,
  Milestone,
  Interest,
  Transaction,
  Notification
};
