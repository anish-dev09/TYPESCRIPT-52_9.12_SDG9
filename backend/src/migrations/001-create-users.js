module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      walletAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'wallet_address'
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      name: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.ENUM('investor', 'project_manager', 'admin'),
        defaultValue: 'investor'
      },
      kycStatus: {
        type: Sequelize.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending',
        field: 'kyc_status'
      },
      kycDocuments: {
        type: Sequelize.JSONB,
        field: 'kyc_documents'
      },
      totalInvested: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'total_invested'
      },
      totalTokens: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue: 0,
        field: 'total_tokens'
      },
      profileImage: {
        type: Sequelize.STRING,
        field: 'profile_image'
      },
      bio: {
        type: Sequelize.TEXT
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        field: 'last_login_at'
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
    await queryInterface.addIndex('users', ['wallet_address']);
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['kyc_status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
