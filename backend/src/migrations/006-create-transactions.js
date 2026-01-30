module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'user_id'
      },
      projectId: {
        type: Sequelize.UUID,
        references: {
          model: 'projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'project_id'
      },
      type: {
        type: Sequelize.ENUM('investment', 'interest_claim', 'milestone_completion', 'fund_release', 'token_transfer'),
        allowNull: false
      },
      transactionHash: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        field: 'transaction_hash'
      },
      from: {
        type: Sequelize.STRING,
        allowNull: false
      },
      to: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0
      },
      tokenAmount: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'token_amount'
      },
      blockNumber: {
        type: Sequelize.INTEGER,
        field: 'block_number'
      },
      gasUsed: {
        type: Sequelize.BIGINT,
        field: 'gas_used'
      },
      gasFee: {
        type: Sequelize.DECIMAL(20, 10),
        field: 'gas_fee'
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed'),
        defaultValue: 'confirmed'
      },
      metadata: {
        type: Sequelize.JSONB
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
    await queryInterface.addIndex('transactions', ['user_id']);
    await queryInterface.addIndex('transactions', ['project_id']);
    await queryInterface.addIndex('transactions', ['transaction_hash']);
    await queryInterface.addIndex('transactions', ['type']);
    await queryInterface.addIndex('transactions', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  }
};
