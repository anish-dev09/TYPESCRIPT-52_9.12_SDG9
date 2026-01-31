// Seed script to populate database with sample infrastructure projects
// Run with: node backend/scripts/seedProjects.js

const { Sequelize } = require('sequelize');
const config = require('../src/config/database');
const bcrypt = require('bcrypt');

// Initialize Sequelize
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

// Import models
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Milestone = require('../src/models/Milestone');

async function seedProjects() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get any existing user to use as project manager
    let projectManager = await User.findOne({ 
      attributes: ['id']
    });
    
    if (!projectManager) {
      console.log('⚠️  No users found in database. Please create a user first.');
      console.log('You can register at http://localhost:3000/auth/register');
      process.exit(1);
    }

    console.log(`✅ Using user ID: ${projectManager.id} as project creator`);
    // Clear existing projects and milestones
    await Milestone.destroy({ where: {} });
    await Project.destroy({ where: {} });
    console.log('✅ Cleared existing projects and milestones');
    // Sample Projects Data
    const projects = [
      {
        projectId: 1001,
        name: 'Mumbai Metro Line 4 Extension',
        description: 'Construction of 15km metro line connecting Wadala to Kasarvadavali, serving 2 million commuters daily. Modern rail infrastructure with 12 stations.',
        category: 'transport',
        status: 'active',
        fundingGoal: 85000000, // ₹850 Cr
        currentFunding: 45000000, // ₹450 Cr raised
        fundsRaised: 45000000,
        location: 'Mumbai, Maharashtra',
        impactMetrics: '2M daily commuters, 40% reduction in travel time, 30% reduction in carbon emissions',
        sdgGoals: [9, 11, 13],
        riskLevel: 'low',
        interestRateAnnual: 7.5,
        durationMonths: 36,
        projectWallet: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        managerId: projectManager.id,
        milestones: [
          { title: 'Land Acquisition', description: 'Complete land acquisition for all 12 stations', targetDate: '2026-06-30', fundingRequired: 15000000, status: 'completed' },
          { title: 'Phase 1 Construction', description: 'Complete civil work for first 5 stations', targetDate: '2026-12-31', fundingRequired: 25000000, status: 'in_progress' },
          { title: 'Track Laying', description: 'Install metro tracks and signaling systems', targetDate: '2027-06-30', fundingRequired: 20000000, status: 'pending' },
          { title: 'Testing & Commissioning', description: 'Safety testing and trial runs', targetDate: '2027-12-31', fundingRequired: 25000000, status: 'pending' }
        ]
      },
      {
        projectId: 1002,
        name: 'Rajasthan Solar Power Plant',
        description: '500 MW solar power generation facility in Jodhpur district. Clean energy initiative with 25-year operational life, powering 400,000 homes.',
        category: 'energy',
        status: 'active',
        fundingGoal: 45000000, // ₹450 Cr
        currentFunding: 22000000, // ₹220 Cr raised
        fundsRaised: 22000000,
        location: 'Jodhpur, Rajasthan',
        impactMetrics: '500 MW clean energy, 400K homes powered, 600K tons CO2 reduction annually',
        sdgGoals: [7, 13],
        riskLevel: 'medium',
        interestRateAnnual: 8.2,
        durationMonths: 30,
        projectWallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        managerId: projectManager.id,
        milestones: [
          { title: 'Site Preparation', description: 'Clear and level 800 hectares of land', targetDate: '2026-05-31', fundingRequired: 5000000, status: 'completed' },
          { title: 'Panel Installation', description: 'Install 1.5M solar panels', targetDate: '2026-10-31', fundingRequired: 25000000, status: 'in_progress' },
          { title: 'Grid Connection', description: 'Connect to state power grid', targetDate: '2027-02-28', fundingRequired: 10000000, status: 'pending' },
          { title: 'Battery Storage', description: 'Install 200 MWh battery storage', targetDate: '2027-05-31', fundingRequired: 5000000, status: 'pending' }
        ]
      },
      {
        projectId: 1003,
        name: 'Smart Water Distribution Network - Bangalore',
        description: 'IoT-enabled water distribution system with leak detection, quality monitoring, and automated billing for 500,000 connections.',
        category: 'water',
        status: 'active',
        fundingGoal: 28000000, // ₹280 Cr
        currentFunding: 12000000, // ₹120 Cr raised
        fundsRaised: 12000000,
        location: 'Bangalore, Karnataka',
        impactMetrics: '500K households, 35% reduction in water wastage, 99% billing accuracy, 24/7 quality monitoring',
        sdgGoals: [6, 9, 11],
        riskLevel: 'medium',
        interestRateAnnual: 7.8,
        durationMonths: 24,
        projectWallet: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        managerId: projectManager.id,
        milestones: [
          { title: 'Network Mapping', description: 'Digital mapping of entire water network', targetDate: '2026-04-30', fundingRequired: 3000000, status: 'completed' },
          { title: 'Sensor Installation', description: 'Install IoT sensors at 5000 points', targetDate: '2026-09-30', fundingRequired: 10000000, status: 'in_progress' },
          { title: 'Software Platform', description: 'Deploy monitoring and analytics platform', targetDate: '2026-12-31', fundingRequired: 8000000, status: 'pending' },
          { title: 'Smart Meters', description: 'Install smart meters at all connections', targetDate: '2027-06-30', fundingRequired: 7000000, status: 'pending' }
        ]
      },
      {
        projectId: 1004,
        name: 'Delhi-NCR Expressway Widening',
        description: '60 km expressway expansion from 4 to 8 lanes with smart toll collection and real-time traffic management systems.',
        category: 'transport',
        status: 'active',
        fundingGoal: 120000000, // ₹1200 Cr
        currentFunding: 75000000, // ₹750 Cr raised
        fundsRaised: 75000000,
        location: 'Delhi NCR, Multiple States',
        impactMetrics: '150K vehicles daily, 50% reduction in congestion, 25% fuel savings, 40% travel time reduction',
        sdgGoals: [9, 11],
        riskLevel: 'low',
        interestRateAnnual: 7.2,
        durationMonths: 36,
        projectWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        managerId: projectManager.id,
        milestones: [
          { title: 'Design & Approval', description: 'Complete engineering design and govt approvals', targetDate: '2026-03-31', fundingRequired: 10000000, status: 'completed' },
          { title: 'Phase 1 Construction', description: 'Widen first 30 km section', targetDate: '2026-11-30', fundingRequired: 50000000, status: 'in_progress' },
          { title: 'Smart Systems', description: 'Install traffic management and toll systems', targetDate: '2027-03-31', fundingRequired: 20000000, status: 'pending' },
          { title: 'Phase 2 Completion', description: 'Complete remaining 30 km', targetDate: '2027-09-30', fundingRequired: 40000000, status: 'pending' }
        ]
      },
      {
        projectId: 1005,
        name: 'Rural Healthcare Centers - Bihar',
        description: '50 primary healthcare centers with telemedicine facilities, serving 500 villages across 5 districts in Bihar.',
        category: 'social',
        status: 'active',
        fundingGoal: 15000000, // ₹150 Cr
        currentFunding: 8000000, // ₹80 Cr raised
        fundsRaised: 8000000,
        location: 'Multiple Districts, Bihar',
        impactMetrics: '500 villages covered, 2M population served, 24/7 emergency services, telemedicine connectivity',
        sdgGoals: [3, 9, 10],
        riskLevel: 'medium',
        interestRateAnnual: 8.5,
        durationMonths: 24,
        projectWallet: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        managerId: projectManager.id,
        milestones: [
          { title: 'Site Selection', description: 'Identify and acquire land for 50 centers', targetDate: '2026-05-31', fundingRequired: 2000000, status: 'completed' },
          { title: 'Phase 1 Construction', description: 'Build first 20 centers', targetDate: '2026-10-31', fundingRequired: 5000000, status: 'in_progress' },
          { title: 'Equipment Procurement', description: 'Medical equipment and telemedicine systems', targetDate: '2027-01-31', fundingRequired: 4000000, status: 'pending' },
          { title: 'Staff Training', description: 'Train healthcare workers and commission centers', targetDate: '2027-05-31', fundingRequired: 4000000, status: 'pending' }
        ]
      },
      {
        projectId: 1006,
        name: 'Tech Park & Incubation Center - Hyderabad',
        description: '2 million sq ft IT park with startup incubation space, co-working facilities, and modern amenities for 50,000 professionals.',
        category: 'telecom',
        status: 'active',
        fundingGoal: 95000000, // ₹950 Cr
        currentFunding: 55000000, // ₹550 Cr raised
        fundsRaised: 55000000,
        location: 'Hyderabad, Telangana',
        impactMetrics: '50K jobs created, 200+ startups incubated, LEED Platinum certified, 80% renewable energy',
        sdgGoals: [8, 9, 11],
        riskLevel: 'low',
        interestRateAnnual: 7.0,
        durationMonths: 30,
        projectWallet: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
        managerId: projectManager.id,
        milestones: [
          { title: 'Land Development', description: 'Site preparation and foundation work', targetDate: '2026-06-30', fundingRequired: 15000000, status: 'completed' },
          { title: 'Phase 1 Construction', description: 'Complete first 3 towers (1M sq ft)', targetDate: '2026-12-31', fundingRequired: 40000000, status: 'in_progress' },
          { title: 'Infrastructure Setup', description: 'IT infrastructure and smart building systems', targetDate: '2027-04-30', fundingRequired: 20000000, status: 'pending' },
          { title: 'Phase 2 Completion', description: 'Complete remaining towers and amenities', targetDate: '2027-10-31', fundingRequired: 20000000, status: 'pending' }
        ]
      },
      {
        projectId: 1007,
        name: 'Organic Farming Cooperative - Punjab',
        description: 'Organic farming initiative across 10,000 hectares with processing units, cold storage, and direct market linkage for 5,000 farmers.',
        category: 'mixed',
        status: 'active',
        fundingGoal: 18000000, // ₹180 Cr
        currentFunding: 9000000, // ₹90 Cr raised
        fundsRaised: 9000000,
        location: 'Multiple Districts, Punjab',
        impactMetrics: '5K farmers, 10K hectares, 30% income increase, zero pesticides, sustainable farming practices',
        sdgGoals: [2, 8, 12, 13],
        riskLevel: 'high',
        interestRateAnnual: 9.2,
        durationMonths: 36,
        projectWallet: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
        managerId: projectManager.id,
        milestones: [
          { title: 'Farmer Training', description: 'Train 5000 farmers in organic methods', targetDate: '2026-07-31', fundingRequired: 2000000, status: 'completed' },
          { title: 'Transition Support', description: 'Support farmers during 3-year transition', targetDate: '2027-03-31', fundingRequired: 6000000, status: 'in_progress' },
          { title: 'Processing Units', description: 'Build 5 organic processing facilities', targetDate: '2027-06-30', fundingRequired: 5000000, status: 'pending' },
          { title: 'Market Linkage', description: 'Establish direct market access channels', targetDate: '2027-12-31', fundingRequired: 5000000, status: 'pending' }
        ]
      },
      {
        projectId: 1008,
        name: 'EV Charging Network - National Highways',
        description: '500 fast-charging stations along major national highways with solar canopies, supporting India\'s EV transition.',
        category: 'energy',
        status: 'active',
        fundingGoal: 35000000, // ₹350 Cr
        currentFunding: 18000000, // ₹180 Cr raised
        fundsRaised: 18000000,
        location: 'Pan India - National Highways',
        impactMetrics: '500 stations, 2000 charging points, 100% solar powered, 50K EVs supported daily',
        sdgGoals: [7, 9, 11, 13],
        riskLevel: 'medium',
        interestRateAnnual: 8.0,
        durationMonths: 30,
        projectWallet: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
        managerId: projectManager.id,
        milestones: [
          { title: 'Site Approvals', description: 'Secure permissions for 500 highway locations', targetDate: '2026-05-31', fundingRequired: 3000000, status: 'completed' },
          { title: 'Phase 1 Deployment', description: 'Install first 200 charging stations', targetDate: '2026-11-30', fundingRequired: 14000000, status: 'in_progress' },
          { title: 'Solar Integration', description: 'Add solar canopies to all stations', targetDate: '2027-04-30', fundingRequired: 10000000, status: 'pending' },
          { title: 'Network Completion', description: 'Complete remaining 300 stations', targetDate: '2027-10-31', fundingRequired: 8000000, status: 'pending' }
        ]
      }
    ];

    // Insert projects and milestones
    for (const projectData of projects) {
      const { milestones, ...projectFields } = projectData;
      
      const project = await Project.create(projectFields);
      console.log(`✅ Created project: ${project.name}`);

      // Create milestones for this project
      for (let i = 0; i < milestones.length; i++) {
        const milestone = milestones[i];
        await Milestone.create({
          projectId: project.id,
          milestoneIndex: i,
          name: milestone.title,
          description: milestone.description,
          targetDate: new Date(milestone.targetDate),
          fundsToRelease: milestone.fundingRequired,
          status: milestone.status
        });
      }
      console.log(`   ✅ Added ${milestones.length} milestones`);
    }

    console.log('\n🎉 Successfully seeded database with sample projects!');
    console.log(`📊 Total Projects: ${projects.length}`);
    console.log('🌐 View projects at: http://localhost:3000/projects');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    process.exit(1);
  }
}

seedProjects();
