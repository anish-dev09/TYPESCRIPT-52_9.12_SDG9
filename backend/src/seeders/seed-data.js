const { User, Project, Investment, Milestone, Transaction, Interest, Notification } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Notification.destroy({ where: {} });
    await Interest.destroy({ where: {} });
    await Transaction.destroy({ where: {} });
    await Milestone.destroy({ where: {} });
    await Investment.destroy({ where: {} });
    await Project.destroy({ where: {} });
    await User.destroy({ where: {} });
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
        isActive: true
      },
      {
        walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        email: 'investor2@example.com',
        name: 'Bob Smith',
        role: 'investor',
        kycStatus: 'verified',
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
        email: 'issuer1@example.com',
        name: 'David Brown',
        role: 'project_manager',
        kycStatus: 'verified',
        isActive: true
      },
      {
        walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        email: 'issuer2@example.com',
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
        name: 'Solar Energy Plant - Manila',
        description: 'A 50MW solar energy plant in Manila to provide clean energy to 50,000 households. This project aligns with SDG 7 (Affordable and Clean Energy) and SDG 9 (Industry, Innovation, and Infrastructure).',
        category: 'energy',
        location: 'Manila, Philippines',
        sdg_alignment: JSON.stringify([7, 9, 13]),
        issuer_id: users[4].id,
        issuer_wallet: users[4].wallet_address,
        total_funding_required: '5000000',
        current_funding: '3500000',
        bond_token_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        interest_rate: '7.5',
        maturity_date: new Date('2029-12-31'),
        bond_issuance_date: new Date('2025-01-15'),
        status: 'active',
        risk_rating: 'A',
        project_documents: JSON.stringify([
          { name: 'Project Proposal.pdf', url: '/docs/solar-manila-proposal.pdf' },
          { name: 'Environmental Impact.pdf', url: '/docs/solar-manila-impact.pdf' }
        ]),
        milestones_achieved: 2,
        total_milestones: 5,
        is_verified: true
      },
      {
        name: 'Water Treatment Facility - Cebu',
        description: 'Modern water treatment facility to provide clean drinking water to 100,000 residents in Cebu. Supports SDG 6 (Clean Water and Sanitation) and SDG 9 (Industry, Innovation, and Infrastructure).',
        category: 'water',
        location: 'Cebu City, Philippines',
        sdg_alignment: JSON.stringify([6, 9, 11]),
        issuer_id: users[5].id,
        issuer_wallet: users[5].wallet_address,
        total_funding_required: '8000000',
        current_funding: '6400000',
        bond_token_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        interest_rate: '8.0',
        maturity_date: new Date('2030-06-30'),
        bond_issuance_date: new Date('2025-02-01'),
        status: 'active',
        risk_rating: 'A+',
        project_documents: JSON.stringify([
          { name: 'Technical Specifications.pdf', url: '/docs/water-cebu-specs.pdf' },
          { name: 'Budget Breakdown.xlsx', url: '/docs/water-cebu-budget.xlsx' }
        ]),
        milestones_achieved: 3,
        total_milestones: 6,
        is_verified: true
      },
      {
        name: 'Smart Highway Network - Mindanao',
        description: 'Construction of a 200km smart highway network connecting major cities in Mindanao with IoT sensors and sustainable materials. Aligns with SDG 9 (Industry, Innovation, and Infrastructure) and SDG 11 (Sustainable Cities).',
        category: 'transportation',
        location: 'Mindanao, Philippines',
        sdg_alignment: JSON.stringify([9, 11]),
        issuer_id: users[4].id,
        issuer_wallet: users[4].wallet_address,
        total_funding_required: '15000000',
        current_funding: '9000000',
        bond_token_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        interest_rate: '8.5',
        maturity_date: new Date('2032-12-31'),
        bond_issuance_date: new Date('2025-03-01'),
        status: 'active',
        risk_rating: 'B+',
        project_documents: JSON.stringify([
          { name: 'Engineering Plan.pdf', url: '/docs/highway-mindanao-plan.pdf' },
          { name: 'Route Map.pdf', url: '/docs/highway-mindanao-map.pdf' }
        ]),
        milestones_achieved: 1,
        total_milestones: 8,
        is_verified: true
      },
      {
        name: 'Digital Education Hub - Davao',
        description: 'State-of-the-art digital education center providing technology training and internet access to underserved communities. Supports SDG 4 (Quality Education) and SDG 9 (Industry, Innovation, and Infrastructure).',
        category: 'education',
        location: 'Davao City, Philippines',
        sdg_alignment: JSON.stringify([4, 9, 10]),
        issuer_id: users[5].id,
        issuer_wallet: users[5].wallet_address,
        total_funding_required: '2500000',
        current_funding: '1500000',
        bond_token_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        interest_rate: '6.5',
        maturity_date: new Date('2028-12-31'),
        bond_issuance_date: new Date('2024-11-01'),
        status: 'active',
        risk_rating: 'A',
        project_documents: JSON.stringify([
          { name: 'Education Program.pdf', url: '/docs/edu-davao-program.pdf' }
        ]),
        milestones_achieved: 4,
        total_milestones: 5,
        is_verified: true
      },
      {
        name: 'Wind Farm - Ilocos Norte',
        description: 'Offshore wind farm project generating 100MW of renewable energy. This project contributes to SDG 7 (Affordable and Clean Energy), SDG 9 (Infrastructure), and SDG 13 (Climate Action).',
        category: 'energy',
        location: 'Ilocos Norte, Philippines',
        sdg_alignment: JSON.stringify([7, 9, 13, 14]),
        issuer_id: users[4].id,
        issuer_wallet: users[4].wallet_address,
        total_funding_required: '12000000',
        current_funding: '3000000',
        bond_token_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        interest_rate: '7.8',
        maturity_date: new Date('2031-12-31'),
        bond_issuance_date: new Date('2025-04-01'),
        status: 'fundraising',
        risk_rating: 'B',
        project_documents: JSON.stringify([
          { name: 'Wind Assessment.pdf', url: '/docs/wind-ilocos-assessment.pdf' }
        ]),
        milestones_achieved: 0,
        total_milestones: 7,
        is_verified: true
      }
    ]);
    console.log(`✅ Created ${projects.length} projects\n`);

    // Create Investments
    console.log('💰 Creating investments...');
    const investments = await Investment.bulkCreate([
      {
        investor_id: users[1].id,
        investor_wallet: users[1].wallet_address,
        project_id: projects[0].id,
        amount: '1000000',
        bond_tokens: '1000',
        transaction_hash: '0x' + '1'.repeat(64),
        investment_date: new Date('2025-01-20'),
        status: 'active',
        expected_return: '75000',
        maturity_date: projects[0].maturity_date
      },
      {
        investor_id: users[2].id,
        investor_wallet: users[2].wallet_address,
        project_id: projects[0].id,
        amount: '2500000',
        bond_tokens: '2500',
        transaction_hash: '0x' + '2'.repeat(64),
        investment_date: new Date('2025-01-22'),
        status: 'active',
        expected_return: '187500',
        maturity_date: projects[0].maturity_date
      },
      {
        investor_id: users[1].id,
        investor_wallet: users[1].wallet_address,
        project_id: projects[1].id,
        amount: '3000000',
        bond_tokens: '3000',
        transaction_hash: '0x' + '3'.repeat(64),
        investment_date: new Date('2025-02-05'),
        status: 'active',
        expected_return: '240000',
        maturity_date: projects[1].maturity_date
      },
      {
        investor_id: users[2].id,
        investor_wallet: users[2].wallet_address,
        project_id: projects[1].id,
        amount: '3400000',
        bond_tokens: '3400',
        transaction_hash: '0x' + '4'.repeat(64),
        investment_date: new Date('2025-02-08'),
        status: 'active',
        expected_return: '272000',
        maturity_date: projects[1].maturity_date
      },
      {
        investor_id: users[1].id,
        investor_wallet: users[1].wallet_address,
        project_id: projects[2].id,
        amount: '5000000',
        bond_tokens: '5000',
        transaction_hash: '0x' + '5'.repeat(64),
        investment_date: new Date('2025-03-10'),
        status: 'active',
        expected_return: '425000',
        maturity_date: projects[2].maturity_date
      },
      {
        investor_id: users[2].id,
        investor_wallet: users[2].wallet_address,
        project_id: projects[2].id,
        amount: '4000000',
        bond_tokens: '4000',
        transaction_hash: '0x' + '6'.repeat(64),
        investment_date: new Date('2025-03-12'),
        status: 'active',
        expected_return: '340000',
        maturity_date: projects[2].maturity_date
      },
      {
        investor_id: users[1].id,
        investor_wallet: users[1].wallet_address,
        project_id: projects[3].id,
        amount: '1500000',
        bond_tokens: '1500',
        transaction_hash: '0x' + '7'.repeat(64),
        investment_date: new Date('2024-11-15'),
        status: 'active',
        expected_return: '97500',
        maturity_date: projects[3].maturity_date
      },
      {
        investor_id: users[2].id,
        investor_wallet: users[2].wallet_address,
        project_id: projects[4].id,
        amount: '3000000',
        bond_tokens: '3000',
        transaction_hash: '0x' + '8'.repeat(64),
        investment_date: new Date('2025-04-05'),
        status: 'active',
        expected_return: '234000',
        maturity_date: projects[4].maturity_date
      }
    ]);
    console.log(`✅ Created ${investments.length} investments\n`);

    // Create Milestones
    console.log('🎯 Creating milestones...');
    const milestones = await Milestone.bulkCreate([
      // Solar Energy Plant - Manila (5 milestones)
      {
        project_id: projects[0].id,
        milestone_number: 1,
        title: 'Site Acquisition and Permits',
        description: 'Secure land rights and obtain all necessary permits for solar plant construction',
        target_amount: '500000',
        target_date: new Date('2025-03-31'),
        status: 'completed',
        completion_date: new Date('2025-03-15'),
        verification_documents: JSON.stringify([
          { name: 'Land Certificate.pdf', url: '/docs/solar-land-cert.pdf' },
          { name: 'Construction Permit.pdf', url: '/docs/solar-permit.pdf' }
        ]),
        verified_by: users[0].id,
        verified_at: new Date('2025-03-16')
      },
      {
        project_id: projects[0].id,
        milestone_number: 2,
        title: 'Foundation and Infrastructure',
        description: 'Complete foundation work and basic infrastructure setup',
        target_amount: '1000000',
        target_date: new Date('2025-06-30'),
        status: 'completed',
        completion_date: new Date('2025-06-20'),
        verification_documents: JSON.stringify([
          { name: 'Foundation Inspection.pdf', url: '/docs/solar-foundation.pdf' }
        ]),
        verified_by: users[0].id,
        verified_at: new Date('2025-06-21')
      },
      {
        project_id: projects[0].id,
        milestone_number: 3,
        title: 'Solar Panel Installation',
        description: 'Install all solar panels and mounting systems',
        target_amount: '2000000',
        target_date: new Date('2025-10-31'),
        status: 'in_progress',
        completion_percentage: 65
      },
      {
        project_id: projects[0].id,
        milestone_number: 4,
        title: 'Grid Connection and Testing',
        description: 'Connect to power grid and complete all safety tests',
        target_amount: '1000000',
        target_date: new Date('2026-02-28'),
        status: 'pending'
      },
      {
        project_id: projects[0].id,
        milestone_number: 5,
        title: 'Commercial Operation',
        description: 'Begin commercial operations and power generation',
        target_amount: '500000',
        target_date: new Date('2026-04-30'),
        status: 'pending'
      },

      // Water Treatment Facility - Cebu (6 milestones)
      {
        project_id: projects[1].id,
        milestone_number: 1,
        title: 'Environmental Impact Assessment',
        description: 'Complete environmental studies and obtain clearances',
        target_amount: '400000',
        target_date: new Date('2025-03-31'),
        status: 'completed',
        completion_date: new Date('2025-03-10'),
        verified_by: users[0].id,
        verified_at: new Date('2025-03-11')
      },
      {
        project_id: projects[1].id,
        milestone_number: 2,
        title: 'Site Preparation',
        description: 'Clear and prepare site for construction',
        target_amount: '600000',
        target_date: new Date('2025-05-31'),
        status: 'completed',
        completion_date: new Date('2025-05-20'),
        verified_by: users[0].id,
        verified_at: new Date('2025-05-21')
      },
      {
        project_id: projects[1].id,
        milestone_number: 3,
        title: 'Main Structure Construction',
        description: 'Build main treatment facility structures',
        target_amount: '2500000',
        target_date: new Date('2025-09-30'),
        status: 'completed',
        completion_date: new Date('2025-09-15'),
        verified_by: users[0].id,
        verified_at: new Date('2025-09-16')
      },
      {
        project_id: projects[1].id,
        milestone_number: 4,
        title: 'Equipment Installation',
        description: 'Install all water treatment equipment and systems',
        target_amount: '3000000',
        target_date: new Date('2026-01-31'),
        status: 'in_progress',
        completion_percentage: 45
      },
      {
        project_id: projects[1].id,
        milestone_number: 5,
        title: 'Testing and Commissioning',
        description: 'Test all systems and obtain operational permits',
        target_amount: '1000000',
        target_date: new Date('2026-04-30'),
        status: 'pending'
      },
      {
        project_id: projects[1].id,
        milestone_number: 6,
        title: 'Full Operations',
        description: 'Begin full-scale water treatment operations',
        target_amount: '500000',
        target_date: new Date('2026-06-30'),
        status: 'pending'
      },

      // Smart Highway Network - Mindanao (8 milestones)
      {
        project_id: projects[2].id,
        milestone_number: 1,
        title: 'Route Planning and Surveys',
        description: 'Complete route surveys and engineering studies',
        target_amount: '1000000',
        target_date: new Date('2025-05-31'),
        status: 'completed',
        completion_date: new Date('2025-05-15'),
        verified_by: users[0].id,
        verified_at: new Date('2025-05-16')
      },
      {
        project_id: projects[2].id,
        milestone_number: 2,
        title: 'Land Acquisition',
        description: 'Acquire all necessary land rights for highway construction',
        target_amount: '2000000',
        target_date: new Date('2025-08-31'),
        status: 'in_progress',
        completion_percentage: 75
      },
      {
        project_id: projects[2].id,
        milestone_number: 3,
        title: 'Phase 1 Construction (0-50km)',
        description: 'Complete first 50km of highway construction',
        target_amount: '3000000',
        target_date: new Date('2026-12-31'),
        status: 'pending'
      },
      {
        project_id: projects[2].id,
        milestone_number: 4,
        title: 'IoT Sensor Deployment - Phase 1',
        description: 'Install smart sensors and monitoring systems for Phase 1',
        target_amount: '1000000',
        target_date: new Date('2027-03-31'),
        status: 'pending'
      },
      {
        project_id: projects[2].id,
        milestone_number: 5,
        title: 'Phase 2 Construction (50-150km)',
        description: 'Complete next 100km of highway construction',
        target_amount: '5000000',
        target_date: new Date('2029-12-31'),
        status: 'pending'
      },
      {
        project_id: projects[2].id,
        milestone_number: 6,
        title: 'IoT Sensor Deployment - Phase 2',
        description: 'Install smart sensors for Phase 2 sections',
        target_amount: '1500000',
        target_date: new Date('2030-06-30'),
        status: 'pending'
      },
      {
        project_id: projects[2].id,
        milestone_number: 7,
        title: 'Phase 3 Construction (150-200km)',
        description: 'Complete final 50km of highway construction',
        target_amount: '3000000',
        target_date: new Date('2032-06-30'),
        status: 'pending'
      },
      {
        project_id: projects[2].id,
        milestone_number: 8,
        title: 'Full Network Integration',
        description: 'Integrate all systems and begin full operations',
        target_amount: '1500000',
        target_date: new Date('2032-12-31'),
        status: 'pending'
      },

      // Digital Education Hub - Davao (5 milestones)
      {
        project_id: projects[3].id,
        milestone_number: 1,
        title: 'Building Renovation',
        description: 'Renovate existing building for education center',
        target_amount: '500000',
        target_date: new Date('2025-01-31'),
        status: 'completed',
        completion_date: new Date('2025-01-20'),
        verified_by: users[0].id,
        verified_at: new Date('2025-01-21')
      },
      {
        project_id: projects[3].id,
        milestone_number: 2,
        title: 'Technology Infrastructure',
        description: 'Install computers, servers, and networking equipment',
        target_amount: '800000',
        target_date: new Date('2025-03-31'),
        status: 'completed',
        completion_date: new Date('2025-03-25'),
        verified_by: users[0].id,
        verified_at: new Date('2025-03-26')
      },
      {
        project_id: projects[3].id,
        milestone_number: 3,
        title: 'Curriculum Development',
        description: 'Develop digital education curriculum and training materials',
        target_amount: '300000',
        target_date: new Date('2025-05-31'),
        status: 'completed',
        completion_date: new Date('2025-05-28'),
        verified_by: users[0].id,
        verified_at: new Date('2025-05-29')
      },
      {
        project_id: projects[3].id,
        milestone_number: 4,
        title: 'Teacher Training',
        description: 'Train educators on digital teaching methods',
        target_amount: '400000',
        target_date: new Date('2025-07-31'),
        status: 'completed',
        completion_date: new Date('2025-07-25'),
        verified_by: users[0].id,
        verified_at: new Date('2025-07-26')
      },
      {
        project_id: projects[3].id,
        milestone_number: 5,
        title: 'Center Launch',
        description: 'Official opening and start of education programs',
        target_amount: '500000',
        target_date: new Date('2025-09-30'),
        status: 'in_progress',
        completion_percentage: 80
      }
    ]);
    console.log(`✅ Created ${milestones.length} milestones\n`);

    // Create Transactions
    console.log('📊 Creating transactions...');
    const transactions = await Transaction.bulkCreate([
      {
        user_id: users[1].id,
        wallet_address: users[1].wallet_address,
        transaction_type: 'investment',
        amount: '1000000',
        transaction_hash: '0x' + '1'.repeat(64),
        status: 'completed',
        related_project_id: projects[0].id,
        related_investment_id: investments[0].id,
        gas_fee: '0.002',
        block_number: 12345678,
        timestamp: new Date('2025-01-20')
      },
      {
        user_id: users[2].id,
        wallet_address: users[2].wallet_address,
        transaction_type: 'investment',
        amount: '2500000',
        transaction_hash: '0x' + '2'.repeat(64),
        status: 'completed',
        related_project_id: projects[0].id,
        related_investment_id: investments[1].id,
        gas_fee: '0.0025',
        block_number: 12345890,
        timestamp: new Date('2025-01-22')
      },
      {
        user_id: users[1].id,
        wallet_address: users[1].wallet_address,
        transaction_type: 'investment',
        amount: '3000000',
        transaction_hash: '0x' + '3'.repeat(64),
        status: 'completed',
        related_project_id: projects[1].id,
        related_investment_id: investments[2].id,
        gas_fee: '0.003',
        block_number: 12356789,
        timestamp: new Date('2025-02-05')
      },
      {
        user_id: users[2].id,
        wallet_address: users[2].wallet_address,
        transaction_type: 'investment',
        amount: '3400000',
        transaction_hash: '0x' + '4'.repeat(64),
        status: 'completed',
        related_project_id: projects[1].id,
        related_investment_id: investments[3].id,
        gas_fee: '0.0032',
        block_number: 12357890,
        timestamp: new Date('2025-02-08')
      },
      {
        user_id: users[1].id,
        wallet_address: users[1].wallet_address,
        transaction_type: 'interest_payment',
        amount: '18750',
        transaction_hash: '0x' + 'a'.repeat(64),
        status: 'completed',
        related_project_id: projects[0].id,
        related_investment_id: investments[0].id,
        gas_fee: '0.001',
        block_number: 12456789,
        timestamp: new Date('2025-07-20'),
        metadata: JSON.stringify({ payment_period: 'Q2 2025', interest_rate: '7.5%' })
      },
      {
        user_id: users[2].id,
        wallet_address: users[2].wallet_address,
        transaction_type: 'interest_payment',
        amount: '46875',
        transaction_hash: '0x' + 'b'.repeat(64),
        status: 'completed',
        related_project_id: projects[0].id,
        related_investment_id: investments[1].id,
        gas_fee: '0.0015',
        block_number: 12456890,
        timestamp: new Date('2025-07-22'),
        metadata: JSON.stringify({ payment_period: 'Q2 2025', interest_rate: '7.5%' })
      }
    ]);
    console.log(`✅ Created ${transactions.length} transactions\n`);

    // Create Interests
    console.log('💵 Creating interest payments...');
    const interests = await Interest.bulkCreate([
      {
        investment_id: investments[0].id,
        amount: '18750',
        payment_date: new Date('2025-07-20'),
        status: 'paid',
        transaction_hash: '0x' + 'a'.repeat(64),
        period_start: new Date('2025-04-01'),
        period_end: new Date('2025-06-30')
      },
      {
        investment_id: investments[1].id,
        amount: '46875',
        payment_date: new Date('2025-07-22'),
        status: 'paid',
        transaction_hash: '0x' + 'b'.repeat(64),
        period_start: new Date('2025-04-01'),
        period_end: new Date('2025-06-30')
      },
      {
        investment_id: investments[2].id,
        amount: '60000',
        due_date: new Date('2025-08-05'),
        status: 'pending',
        period_start: new Date('2025-05-01'),
        period_end: new Date('2025-07-31')
      },
      {
        investment_id: investments[3].id,
        amount: '68000',
        due_date: new Date('2025-08-08'),
        status: 'pending',
        period_start: new Date('2025-05-01'),
        period_end: new Date('2025-07-31')
      }
    ]);
    console.log(`✅ Created ${interests.length} interest records\n`);

    // Create Notifications
    console.log('🔔 Creating notifications...');
    const notifications = await Notification.bulkCreate([
      {
        user_id: users[1].id,
        type: 'investment_success',
        title: 'Investment Successful',
        message: 'Your investment of $1,000,000 in Solar Energy Plant - Manila has been confirmed',
        is_read: true,
        related_project_id: projects[0].id,
        related_investment_id: investments[0].id,
        created_at: new Date('2025-01-20')
      },
      {
        user_id: users[1].id,
        type: 'interest_payment',
        title: 'Interest Payment Received',
        message: 'You received $18,750 interest payment from Solar Energy Plant - Manila',
        is_read: true,
        related_project_id: projects[0].id,
        related_investment_id: investments[0].id,
        created_at: new Date('2025-07-20')
      },
      {
        user_id: users[1].id,
        type: 'milestone_completed',
        title: 'Milestone Completed',
        message: 'Solar Energy Plant - Manila completed milestone: Solar Panel Installation (65%)',
        is_read: false,
        related_project_id: projects[0].id,
        created_at: new Date('2026-01-25')
      },
      {
        user_id: users[2].id,
        type: 'investment_success',
        title: 'Investment Successful',
        message: 'Your investment of $2,500,000 in Solar Energy Plant - Manila has been confirmed',
        is_read: true,
        related_project_id: projects[0].id,
        related_investment_id: investments[1].id,
        created_at: new Date('2025-01-22')
      },
      {
        user_id: users[2].id,
        type: 'interest_payment',
        title: 'Interest Payment Received',
        message: 'You received $46,875 interest payment from Solar Energy Plant - Manila',
        is_read: true,
        related_project_id: projects[0].id,
        related_investment_id: investments[1].id,
        created_at: new Date('2025-07-22')
      },
      {
        user_id: users[4].id,
        type: 'milestone_verified',
        title: 'Milestone Verified',
        message: 'Foundation and Infrastructure milestone has been verified for Solar Energy Plant',
        is_read: true,
        related_project_id: projects[0].id,
        created_at: new Date('2025-06-21')
      },
      {
        user_id: users[5].id,
        type: 'funding_milestone',
        title: 'Funding Milestone Reached',
        message: 'Water Treatment Facility - Cebu has reached 80% funding!',
        is_read: false,
        related_project_id: projects[1].id,
        created_at: new Date('2026-01-28')
      }
    ]);
    console.log(`✅ Created ${notifications.length} notifications\n`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   👥 Users:           ${users.length} (2 investors, 2 project managers, 1 admin, 1 pending)`);
    console.log(`   🏗️  Projects:        ${projects.length} (4 active, 1 fundraising)`);
    console.log(`   💰 Investments:     ${investments.length} ($20.9M total invested)`);
    console.log(`   🎯 Milestones:      ${milestones.length} (12 completed, 4 in-progress, 13 pending)`);
    console.log(`   📊 Transactions:    ${transactions.length}`);
    console.log(`   💵 Interest Records: ${interests.length} (2 paid, 2 pending)`);
    console.log(`   🔔 Notifications:   ${notifications.length}`);
    
    console.log('\n💡 SAMPLE CREDENTIALS:');
    console.log('   Email: investor1@example.com | Password: password123');
    console.log('   Email: issuer1@example.com   | Password: password123');
    console.log('   Email: admin@infrachain.com  | Password: password123');
    
    console.log('\n🎯 PROJECT HIGHLIGHTS:');
    console.log('   • Solar Energy Plant - Manila: 70% funded, 3/5 milestones');
    console.log('   • Water Treatment Facility - Cebu: 80% funded, 4/6 milestones');
    console.log('   • Smart Highway Network: 60% funded, 2/8 milestones');
    console.log('   • Digital Education Hub: 60% funded, 4/5 milestones (almost complete!)');
    console.log('   • Wind Farm - Ilocos: 25% funded, just started fundraising');
    
    console.log('\n✅ Ready for demo and Phase 5 implementation!\n');

    return {
      success: true,
      counts: {
        users: users.length,
        projects: projects.length,
        investments: investments.length,
        milestones: milestones.length,
        transactions: transactions.length,
        interests: interests.length,
        notifications: notifications.length
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
