module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('projects', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      projectId: {
        type: Sequelize.INTEGER,
        unique: true,
        field: 'project_id'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('transportation', 'energy', 'water', 'telecom', 'social', 'other'),
        allowNull: false
      },
      location: {
        type: Sequelize.STRING
      },
      fundingGoal: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        field: 'funding_goal'
      },
      fundsRaised: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'funds_raised'
      },
      fundsReleased: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'funds_released'
      },
      interestRateAnnual: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        field: 'interest_rate_annual'
      },
      durationMonths: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'duration_months'
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'funded', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'draft'
      },
      managerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'manager_id'
      },
      projectWallet: {
        type: Sequelize.STRING,
        field: 'project_wallet'
      },
      contractAddress: {
        type: Sequelize.STRING,
        field: 'contract_address'
      },
      transactionHash: {
        type: Sequelize.STRING,
        field: 'transaction_hash'
      },
      sdgGoals: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: [],
        field: 'sdg_goals'
      },
      documents: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      investorCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'investor_count'
      },
      startDate: {
        type: Sequelize.DATE,
        field: 'start_date'
      },
      endDate: {
        type: Sequelize.DATE,
        field: 'end_date'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'updated_at'
      }
    });

    // Add indexes
    await queryInterface.addIndex('projects', ['project_id']);
    await queryInterface.addIndex('projects', ['status']);
    await queryInterface.addIndex('projects', ['category']);
    await queryInterface.addIndex('projects', ['manager_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('projects');
  }
};
