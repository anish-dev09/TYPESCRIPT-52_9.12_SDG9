const fs = require('fs');
const path = require('path');

/**
 * Database Seed Script for INFRACHAIN-SDG9
 * 
 * This script loads the mock projects data and can be used to populate
 * your database with diverse infrastructure projects for demo purposes.
 * 
 * Usage:
 * - With MongoDB: node seedDatabase.js --db mongodb
 * - With PostgreSQL: node seedDatabase.js --db postgresql
 * - Dry run (print only): node seedDatabase.js --dry-run
 */

// Load mock projects
const mockProjects = require('../data/mockProjects.json');

// Mock user data for testing
const mockUsers = [
  {
    id: 'user-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    kycVerified: true,
    role: 'investor',
    totalInvested: 2500000,
    portfolioValue: 2687500,
    joinedDate: '2025-08-15'
  },
  {
    id: 'user-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    walletAddress: '0x8a90F2b8fC3a3a3a3a3a3a3a3a3a3a3a3a3a3a',
    kycVerified: true,
    role: 'investor',
    totalInvested: 1800000,
    portfolioValue: 1944000,
    joinedDate: '2025-09-20'
  },
  {
    id: 'user-003',
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    kycVerified: true,
    role: 'investor',
    totalInvested: 500000,
    portfolioValue: 545000,
    joinedDate: '2025-11-10'
  },
  {
    id: 'admin-001',
    name: 'System Admin',
    email: 'admin@infrachain.com',
    walletAddress: '0xadmin1234567890abcdef1234567890abcdef12',
    kycVerified: true,
    role: 'admin',
    totalInvested: 0,
    portfolioValue: 0,
    joinedDate: '2025-06-01'
  }
];

// Generate sample investments
function generateInvestments() {
  const investments = [];
  let investmentId = 1;

  // User 1 (Rajesh) - Diversified portfolio
  investments.push(
    {
      id: `inv-${String(investmentId++).padStart(3, '0')}`,
      userId: 'user-001',
      projectId: 'proj-001',
      amount: 1000000,
      tokens: 10000,
      investmentDate: '2025-10-15',
      interestEarned: 85000,
      status: 'active'
    },
    {
      id: `inv-${String(investmentId++).padStart(3, '0')}`,
      userId: 'user-001',
      projectId: 'proj-002',
      amount: 750000,
      tokens: 7500,
      investmentDate: '2025-11-01',
      interestEarned: 69000,
      status: 'active'
    },
    {
      id: `inv-${String(investmentId++).padStart(3, '0')}`,
      userId: 'user-001',
      projectId: 'proj-004',
      amount: 750000,
      tokens: 7500,
      investmentDate: '2025-12-10',
      interestEarned: 33500,
      status: 'active'
    }
  );

  // User 2 (Priya) - Energy focused
  investments.push(
    {
      id: `inv-${String(investmentId++).padStart(3, '0')}`,
      userId: 'user-002',
      projectId: 'proj-002',
      amount: 1200000,
      tokens: 12000,
      investmentDate: '2025-10-05',
      interestEarned: 110400,
      status: 'active'
    },
    {
      id: `inv-${String(investmentId++).padStart(3, '0')}`,
      userId: 'user-002',
      projectId: 'proj-008',
      amount: 600000,
      tokens: 6000,
      investmentDate: '2025-12-01',
      interestEarned: 29400,
      status: 'active'
    }
  );

  // User 3 (Amit) - Small retail investor
  investments.push(
    {
      id: `inv-${String(investmentId++).padStart(3, '0')}`,
      userId: 'user-003',
      projectId: 'proj-009',
      amount: 250000,
      tokens: 2500,
      investmentDate: '2025-11-20',
      interestEarned: 12750,
      status: 'active'
    },
    {
      id: `inv-${String(investmentId++).padStart(3, '0')}`,
      userId: 'user-003',
      projectId: 'proj-010',
      amount: 250000,
      tokens: 2500,
      investmentDate: '2025-12-15',
      interestEarned: 9000,
      status: 'active'
    }
  );

  return investments;
}

// Generate sample transactions (blockchain mock)
function generateTransactions(investments) {
  const transactions = [];
  
  investments.forEach((inv, index) => {
    transactions.push({
      id: `tx-${String(index + 1).padStart(3, '0')}`,
      investmentId: inv.id,
      userId: inv.userId,
      projectId: inv.projectId,
      type: 'token_purchase',
      amount: inv.amount,
      tokens: inv.tokens,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: 12345000 + index * 100,
      timestamp: inv.investmentDate,
      status: 'confirmed',
      gasUsed: '0.0021'
    });
  });

  return transactions;
}

// Main seed function
async function seedDatabase(options = {}) {
  console.log('🌱 Starting database seed...\n');

  const investments = generateInvestments();
  const transactions = generateTransactions(investments);

  // Calculate statistics
  const stats = {
    projects: mockProjects.length,
    users: mockUsers.length,
    investments: investments.length,
    transactions: transactions.length,
    totalFunding: mockProjects.reduce((sum, p) => sum + p.currentFunding, 0),
    totalInvestors: mockProjects.reduce((sum, p) => sum + p.investors, 0)
  };

  console.log('📊 Seed Data Statistics:');
  console.log(`   Projects: ${stats.projects}`);
  console.log(`   Users: ${stats.users}`);
  console.log(`   Investments: ${stats.investments}`);
  console.log(`   Transactions: ${stats.transactions}`);
  console.log(`   Total Funding: ₹${(stats.totalFunding / 10000000).toFixed(2)} Crores`);
  console.log(`   Total Investors: ${stats.totalInvestors.toLocaleString()}\n`);

  if (options.dryRun) {
    console.log('🔍 Dry run mode - No database changes made\n');
    return {
      projects: mockProjects,
      users: mockUsers,
      investments,
      transactions,
      stats
    };
  }

  // TODO: Implement actual database insertion based on DB type
  console.log('💾 Database insertion would happen here...');
  console.log('   Use --dry-run to preview data without inserting\n');

  return {
    projects: mockProjects,
    users: mockUsers,
    investments,
    transactions,
    stats
  };
}

// Export sample data for use in API endpoints
function getSampleData() {
  return {
    projects: mockProjects,
    users: mockUsers,
    investments: generateInvestments(),
    transactions: generateTransactions(generateInvestments())
  };
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    dbType: args.includes('--db') ? args[args.indexOf('--db') + 1] : 'mongodb'
  };

  seedDatabase(options)
    .then(() => {
      console.log('✅ Seed process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  getSampleData,
  mockProjects,
  mockUsers
};
