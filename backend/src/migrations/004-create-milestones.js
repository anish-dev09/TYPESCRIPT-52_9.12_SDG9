module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('milestones', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      milestoneIndex: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'milestone_index'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      targetDate: {
        type: Sequelize.DATE,
        field: 'target_date'
      },
      completedDate: {
        type: Sequelize.DATE,
        field: 'completed_date'
      },
      fundsToRelease: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
        field: 'funds_to_release'
      },
      status: {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'verified'),
        defaultValue: 'pending'
      },
      evidenceHash: {
        type: Sequelize.STRING,
        field: 'evidence_hash'
      },
      evidenceUrl: {
        type: Sequelize.STRING,
        field: 'evidence_url'
      },
      verifiedBy: {
        type: Sequelize.STRING,
        field: 'verified_by'
      },
      transactionHash: {
        type: Sequelize.STRING,
        field: 'transaction_hash'
      },
      notes: {
        type: Sequelize.TEXT
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
    await queryInterface.addIndex('milestones', ['project_id']);
    await queryInterface.addIndex('milestones', ['status']);
    await queryInterface.addIndex('milestones', ['target_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('milestones');
  }
};
