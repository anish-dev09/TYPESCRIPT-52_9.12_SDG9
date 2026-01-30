const hre = require("hardhat");

async function main() {
  console.log("🏗️  Creating demo project and test investment...\n");

  // Contract addresses from deployment
  const BOND_ISSUANCE_ADDRESS = process.env.BOND_ISSUANCE_ADDRESS;
  const MILESTONE_MANAGER_ADDRESS = process.env.MILESTONE_MANAGER_ADDRESS;

  if (!BOND_ISSUANCE_ADDRESS || !MILESTONE_MANAGER_ADDRESS) {
    console.error("❌ Please set contract addresses in .env file");
    process.exit(1);
  }

  const [deployer, investor] = await hre.ethers.getSigners();

  // Get contract instances
  const bondIssuance = await hre.ethers.getContractAt("BondIssuance", BOND_ISSUANCE_ADDRESS);
  const milestoneManager = await hre.ethers.getContractAt("MilestoneManager", MILESTONE_MANAGER_ADDRESS);

  // 1. Create Demo Project
  console.log("📄 Creating Mumbai Metro Phase 3 project...");
  const projectTx = await bondIssuance.createProject(
    "Mumbai Metro Phase 3",
    hre.ethers.parseEther("1000"), // 1000 MATIC funding goal
    850, // 8.5% annual interest
    24, // 24 months duration
    deployer.address // Project wallet (for demo)
  );
  await projectTx.wait();
  console.log("✅ Project created with ID: 1\n");

  // 2. Make Test Investment
  console.log("💰 Making test investment of 10 MATIC...");
  const investTx = await bondIssuance.connect(investor).investInProject(1, {
    value: hre.ethers.parseEther("10")
  });
  await investTx.wait();
  console.log("✅ Investment successful!\n");

  // 3. Create Milestones
  console.log("🎯 Creating project milestones...");
  const currentTime = Math.floor(Date.now() / 1000);
  
  const milestone1 = await milestoneManager.createMilestone(
    1,
    "Site Survey and Planning",
    "Complete initial site survey, acquire permits, and finalize project plans",
    currentTime + 30 * 24 * 60 * 60, // 30 days
    hre.ethers.parseEther("250")
  );
  await milestone1.wait();
  
  const milestone2 = await milestoneManager.createMilestone(
    1,
    "Foundation and Groundwork",
    "Complete foundation work and initial groundwork for metro tracks",
    currentTime + 90 * 24 * 60 * 60, // 90 days
    hre.ethers.parseEther("350")
  );
  await milestone2.wait();

  const milestone3 = await milestoneManager.createMilestone(
    1,
    "Track Installation",
    "Install metro tracks and signaling systems",
    currentTime + 180 * 24 * 60 * 60, // 180 days
    hre.ethers.parseEther("400")
  );
  await milestone3.wait();

  console.log("✅ Created 3 milestones\n");

  // 4. Get Project Info
  const [name, fundingGoal, fundsRaised, fundsReleased, interestRate, duration, isActive] = 
    await bondIssuance.getProject(1);

  console.log("-------------------------------------------");
  console.log("📊 PROJECT DETAILS");
  console.log("-------------------------------------------");
  console.log("Name:           ", name);
  console.log("Funding Goal:   ", hre.ethers.formatEther(fundingGoal), "MATIC");
  console.log("Funds Raised:   ", hre.ethers.formatEther(fundsRaised), "MATIC");
  console.log("Funds Released: ", hre.ethers.formatEther(fundsReleased), "MATIC");
  console.log("Interest Rate:  ", interestRate / 100, "%");
  console.log("Duration:       ", duration, "months");
  console.log("Status:         ", isActive ? "Active" : "Inactive");
  console.log("");

  const investorCount = await bondIssuance.getProjectInvestorCount(1);
  console.log("Total Investors:", investorCount.toString());
  console.log("-------------------------------------------\n");

  console.log("🎉 Demo setup complete!");
  console.log("");
  console.log("Next steps:");
  console.log("1. Visit your frontend at http://localhost:3000");
  console.log("2. Connect wallet to Mumbai testnet");
  console.log("3. Explore the project and make investments");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
