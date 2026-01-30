module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('interests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      investorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'investor_id'
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'project_id'
      },
      accruedAmount: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'accrued_amount'
      },
      claimedAmount: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'claimed_amount'
      },
      pendingAmount: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'pending_amount'
      },
      lastAccrualDate: {
        type: Sequelize.DATE,
        field: 'last_accrual_date'
      },
      lastClaimDate: {
        type: Sequelize.DATE,
        field: 'last_claim_date'
      },
      claimCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'claim_count'
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
    await queryInterface.addIndex('interests', ['investor_id']);
    await queryInterface.addIndex('interests', ['project_id']);
    await queryInterface.addIndex('interests', ['last_accrual_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('interests');
  }
};
