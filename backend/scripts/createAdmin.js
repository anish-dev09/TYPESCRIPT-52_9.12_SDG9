// Quick script to create an admin user
// Run with: node backend/scripts/createAdmin.js

const bcrypt = require('bcrypt');
const { User } = require('../src/models');
const sequelize = require('../src/config/database');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@infrachain.com',
      password: hashedPassword,
      role: 'admin',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // First Hardhat account
      kycStatus: 'approved',
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@infrachain.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');
    console.log('💼 Wallet:', admin.walletAddress);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();
