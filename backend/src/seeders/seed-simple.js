const { User, Project, Investment, Milestone } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Milestone.destroy({ where: {}, truncate: true, cascade: true });
    await Investment.destroy({ where: {}, truncate: true, cascade: true });
    await Project.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Existing data cleared\n');

    // Create Users
    console.log('👥 Creating users...');
    const users = await User.bulkCreate([
      {
        walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        email: 'admin@infrachain.com',
        name: 'Admin User',
        role: 'admin',
        kycStatus: 'verified',
        isActive: true
      },
      {
        walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        email: 'investor1@example.com',
        name: 'Alice Johnson',
        role: 'investor',
        kycStatus: 'verified',
        totalInvested: '10500000',
        totalTokens: '10500',
        isActive: true
      },
      {
        walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        email: 'investor2@example.com',
        name: 'Bob Smith',
        role: 'investor',
        kycStatus: 'verified',
        totalInvested: '10400000',
        totalTokens: '10400',
        isActive: true
      },
      {
        walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        email: 'investor3@example.com',
        name: 'Carol White',
        role: 'investor',
        kycStatus: 'pending',
        isActive: true
      },
      {
        walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        email: 'manager1@example.com',
        name: 'David Brown',
        role: 'project_manager',
        kycStatus: 'verified',
        isActive: true
      },
      {
        walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        email: 'manager2@example.com',
        name: 'Eva Martinez',
        role: 'project_manager',
        kycStatus: 'verified',
        isActive: true
      }
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    // Create Projects
    console.log('🏗️  Creating projects...');
    const projects = await Project.bulkCreate([
      {
        projectId: 1,
        name: 'Solar Energy Plant - Manila',
        description: 'A 50MW solar energy plant in Manila to provide clean energy to 50,000 households. Aligns with SDG 7, 9, and 13.',
        category: 'energy',
        location: 'Manila, Philippines',
        fundingGoal: '5000000',
        fundsRaised: '3500000',
        interestRateAnnual: '7.5',
        durationMonths: 60,
        projectWallet: users[4].walletAddress,
        managerId: users[4].id,
        status: 'active',
        sdgGoals: [7, 9, 13],
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        investorCount: 2
      },
      {
        projectId: 2,
        name: 'Water Treatment Facility - Cebu',
        description: 'Modern water treatment facility providing clean drinking water to 100,000 residents. Supports SDG 6, 9, and 11.',
        category: 'water',
        location: 'Cebu City, Philippines',
        fundingGoal: '8000000',
        fundsRaised: '6400000',
        interestRateAnnual: '8.0',
        durationMonths: 72,
        projectWallet: users[5].walletAddress,
        managerId: users[5].id,
        status: 'active',
        sdgGoals: [6, 9, 11],
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        investorCount: 2
      },
      {
        projectId: 3,
        name: 'Smart Highway Network - Mindanao',
        description: '200km smart highway network with IoT sensors and sustainable materials. SDG 9 and 11.',
        category: 'transport',
        location: 'Mindanao, Philippines',
        fundingGoal: '15000000',
        fundsRaised: '9000000',
        interestRateAnnual: '8.5',
        durationMonths: 96,
        projectWallet: users[4].walletAddress,
        managerId: users[4].id,
        status: 'active',
        sdgGoals: [9, 11],
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        investorCount: 2
      },
      {
        projectId: 4,
        name: 'Digital Education Hub - Davao',
        description: 'Digital education center providing technology training to underserved communities. SDG 4, 9, and 10.',
        category: 'social',
        location: 'Davao City, Philippines',
        fundingGoal: '2500000',
        fundsRaised: '1500000',
        interestRateAnnual: '6.5',
        durationMonths: 48,
        projectWallet: users[5].walletAddress,
        managerId: users[5].id,
        status: 'in_progress',
        sdgGoals: [4, 9, 10],
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        investorCount: 1
      },
      {
        projectId: 5,
        name: 'Wind Farm - Ilocos Norte',
        description: '100MW offshore wind farm for renewable energy. SDG 7, 9, 13, and 14.',
        category: 'energy',
        location: 'Ilocos Norte, Philippines',
        fundingGoal: '12000000',
        fundsRaised: '3000000',
        interestRateAnnual: '7.8',
        durationMonths: 84,
        projectWallet: users[4].walletAddress,
        managerId: users[4].id,
        status: 'active',
        sdgGoals: [7, 9, 13, 14],
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        investorCount: 1
      }
    ]);
    console.log(`✅ Created ${projects.length} projects\n`);

    // Create Investments
    console.log('💰 Creating investments...');
    const investments = await Investment.bulkCreate([
      {
        investorId: users[1].id,
        projectId: projects[0].id,
        amount: '1000000',
        tokensMinted: '1000',
        transactionHash: '0x' + '1'.repeat(64),
        blockNumber: 12345678,
        status: 'confirmed'
      },
      {
        investorId: users[2].id,
        projectId: projects[0].id,
        amount: '2500000',
        tokensMinted: '2500',
        transactionHash: '0x' + '2'.repeat(64),
        blockNumber: 12345890,
        status: 'confirmed'
      },
      {
        investorId: users[1].id,
        projectId: projects[1].id,
        amount: '3000000',
        tokensMinted: '3000',
        transactionHash: '0x' + '3'.repeat(64),
        blockNumber: 12356789,
        status: 'confirmed'
      },
      {
        investorId: users[2].id,
        projectId: projects[1].id,
        amount: '3400000',
        tokensMinted: '3400',
        transactionHash: '0x' + '4'.repeat(64),
        blockNumber: 12357890,
        status: 'confirmed'
      },
      {
        investorId: users[1].id,
        projectId: projects[2].id,
        amount: '5000000',
        tokensMinted: '5000',
        transactionHash: '0x' + '5'.repeat(64),
        blockNumber: 12367890,
        status: 'confirmed'
      },
      {
        investorId: users[2].id,
        projectId: projects[2].id,
        amount: '4000000',
        tokensMinted: '4000',
        transactionHash: '0x' + '6'.repeat(64),
        blockNumber: 12378901,
        status: 'confirmed'
      },
      {
        investorId: users[1].id,
        projectId: projects[3].id,
        amount: '1500000',
        tokensMinted: '1500',
        transactionHash: '0x' + '7'.repeat(64),
        blockNumber: 12389012,
        status: 'confirmed'
      },
      {
        investorId: users[2].id,
        projectId: projects[4].id,
        amount: '3000000',
        tokensMinted: '3000',
        transactionHash: '0x' + '8'.repeat(64),
        blockNumber: 12400123,
        status: 'confirmed'
      }
    ]);
    console.log(`✅ Created ${investments.length} investments\n`);

    // Create Milestones
    console.log('🎯 Creating milestones...');
    const milestones = await Milestone.bulkCreate([
      // Solar Energy Plant - Manila
      {
        projectId: projects[0].id,
        milestoneIndex: 0,
        name: 'Site Acquisition and Permits',
        description: 'Secure land rights and obtain construction permits',
        targetDate: new Date('2025-03-31'),
        fundsToRelease: '500000',
        status: 'completed',
        completedDate: new Date('2025-03-15')
      },
      {
        projectId: projects[0].id,
        milestoneIndex: 1,
        name: 'Foundation and Infrastructure',
        description: 'Complete foundation work and infrastructure setup',
        targetDate: new Date('2025-06-30'),
        fundsToRelease: '1000000',
        status: 'completed',
        completedDate: new Date('2025-06-20')
      },
      {
        projectId: projects[0].id,
        milestoneIndex: 2,
        name: 'Solar Panel Installation',
        description: 'Install all solar panels and mounting systems',
        targetDate: new Date('2025-10-31'),
        fundsToRelease: '2000000',
        status: 'in_progress'
      },
      {
        projectId: projects[0].id,
        milestoneIndex: 3,
        name: 'Grid Connection and Testing',
        description: 'Connect to power grid and complete safety tests',
        targetDate: new Date('2026-02-28'),
        fundsToRelease: '1000000',
        status: 'pending'
      },

      // Water Treatment Facility - Cebu
      {
        projectId: projects[1].id,
        milestoneIndex: 0,
        name: 'Environmental Assessment',
        description: 'Complete environmental studies',
        targetDate: new Date('2025-03-31'),
        fundsToRelease: '400000',
        status: 'completed',
        completedDate: new Date('2025-03-10')
      },
      {
        projectId: projects[1].id,
        milestoneIndex: 1,
        name: 'Site Preparation',
        description: 'Clear and prepare construction site',
        targetDate: new Date('2025-05-31'),
        fundsToRelease: '600000',
        status: 'completed',
        completedDate: new Date('2025-05-20')
      },
      {
        projectId: projects[1].id,
        milestoneIndex: 2,
        name: 'Main Structure Construction',
        description: 'Build main treatment facility structures',
        targetDate: new Date('2025-09-30'),
        fundsToRelease: '2500000',
        status: 'completed',
        completedDate: new Date('2025-09-15')
      },
      {
        projectId: projects[1].id,
        milestoneIndex: 3,
        name: 'Equipment Installation',
        description: 'Install water treatment equipment',
        targetDate: new Date('2026-01-31'),
        fundsToRelease: '3000000',
        status: 'in_progress'
      },

      // Smart Highway Network
      {
        projectId: projects[2].id,
        milestoneIndex: 0,
        name: 'Route Planning and Surveys',
        description: 'Complete route surveys and engineering studies',
        targetDate: new Date('2025-05-31'),
        fundsToRelease: '1000000',
        status: 'completed',
        completedDate: new Date('2025-05-15')
      },
      {
        projectId: projects[2].id,
        milestoneIndex: 1,
        name: 'Land Acquisition',
        description: 'Acquire land rights for highway',
        targetDate: new Date('2025-08-31'),
        fundsToRelease: '2000000',
        status: 'in_progress'
      },
      {
        projectId: projects[2].id,
        milestoneIndex: 2,
        name: 'Phase 1 Construction (0-50km)',
        description: 'Complete first 50km of highway',
        targetDate: new Date('2026-12-31'),
        fundsToRelease: '3000000',
        status: 'pending'
      },

      // Digital Education Hub
      {
        projectId: projects[3].id,
        milestoneIndex: 0,
        name: 'Building Renovation',
        description: 'Renovate building for education center',
        targetDate: new Date('2025-01-31'),
        fundsToRelease: '500000',
        status: 'completed',
        completedDate: new Date('2025-01-20')
      },
      {
        projectId: projects[3].id,
        milestoneIndex: 1,
        name: 'Technology Infrastructure',
        description: 'Install computers and networking',
        targetDate: new Date('2025-03-31'),
        fundsToRelease: '800000',
        status: 'completed',
        completedDate: new Date('2025-03-25')
      },
      {
        projectId: projects[3].id,
        milestoneIndex: 2,
        name: 'Center Launch',
        description: 'Official opening and program start',
        targetDate: new Date('2025-09-30'),
        fundsToRelease: '500000',
        status: 'in_progress'
      }
    ]);
    console.log(`✅ Created ${milestones.length} milestones\n`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   👥 Users:        ${users.length} (2 investors, 2 managers, 1 admin, 1 pending)`);
    console.log(`   🏗️  Projects:     ${projects.length} (4 active, 1 in-progress)`);
    console.log(`   💰 Investments:  ${investments.length} ($20.9M total invested)`);
    console.log(`   🎯 Milestones:   ${milestones.length} (8 completed, 4 in-progress, 2 pending)`);
    
    console.log('\n💡 TEST WALLETS (from Hardhat accounts):');
    console.log('   Admin:     0xf39Fd...92266 (admin@infrachain.com)');
    console.log('   Investor1: 0x70997...c79C8 (investor1@example.com)');
    console.log('   Investor2: 0x3C44C...293BC (investor2@example.com)');
    console.log('   Manager1:  0x15d34...C6A65 (manager1@example.com)');
    console.log('   Manager2:  0x99655...0A4dc (manager2@example.com)');
    
    console.log('\n🎯 PROJECT HIGHLIGHTS:');
    console.log('   • Solar Energy - Manila: 70% funded, 2/4 milestones complete');
    console.log('   • Water Treatment - Cebu: 80% funded, 3/4 milestones complete');
    console.log('   • Smart Highway - Mindanao: 60% funded, 1/3 milestones complete');
    console.log('   • Education Hub - Davao: 60% funded, 2/3 milestones complete');
    console.log('   • Wind Farm - Ilocos: 25% funded, fundraising');
    
    console.log('\n✅ Ready for Phase 5 implementation!\n');

    return {
      success: true,
      counts: {
        users: users.length,
        projects: projects.length,
        investments: investments.length,
        milestones: milestones.length
      }
    };

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;
