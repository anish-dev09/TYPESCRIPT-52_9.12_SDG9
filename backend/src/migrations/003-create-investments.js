module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('investments', {
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
      amount: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false
      },
      tokensMinted: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        field: 'tokens_minted'
      },
      transactionHash: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        field: 'transaction_hash'
      },
      blockNumber: {
        type: Sequelize.INTEGER,
        field: 'block_number'
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'failed'),
        defaultValue: 'pending'
      },
      gasUsed: {
        type: Sequelize.BIGINT,
        field: 'gas_used'
      },
      gasFee: {
        type: Sequelize.DECIMAL(20, 10),
        field: 'gas_fee'
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
    await queryInterface.addIndex('investments', ['investor_id']);
    await queryInterface.addIndex('investments', ['project_id']);
    await queryInterface.addIndex('investments', ['transaction_hash']);
    await queryInterface.addIndex('investments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('investments');
  }
};
