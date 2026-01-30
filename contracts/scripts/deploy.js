const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting INFRACHAIN Contract Deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());
  console.log("Network:", hre.network.name);
  console.log("-------------------------------------------\n");

  // 1. Deploy InfrastructureBond
  console.log("📄 Deploying InfrastructureBond...");
  const InfrastructureBond = await hre.ethers.getContractFactory("InfrastructureBond");
  const infrastructureBond = await InfrastructureBond.deploy(
    "INFRACHAIN Bond Token",
    "INFRA"
  );
  await infrastructureBond.waitForDeployment();
  const bondAddress = await infrastructureBond.getAddress();
  console.log("✅ InfrastructureBond deployed to:", bondAddress);
  console.log("");

  // 2. Deploy BondIssuance
  console.log("📄 Deploying BondIssuance...");
  const BondIssuance = await hre.ethers.getContractFactory("BondIssuance");
  const bondIssuance = await BondIssuance.deploy(bondAddress);
  await bondIssuance.waitForDeployment();
  const issuanceAddress = await bondIssuance.getAddress();
  console.log("✅ BondIssuance deployed to:", issuanceAddress);
  console.log("");

  // 3. Deploy MilestoneManager
  console.log("📄 Deploying MilestoneManager...");
  const MilestoneManager = await hre.ethers.getContractFactory("MilestoneManager");
  const milestoneManager = await MilestoneManager.deploy(issuanceAddress);
  await milestoneManager.waitForDeployment();
  const milestoneAddress = await milestoneManager.getAddress();
  console.log("✅ MilestoneManager deployed to:", milestoneAddress);
  console.log("");

  // 4. Deploy InterestCalculator
  console.log("📄 Deploying InterestCalculator...");
  const InterestCalculator = await hre.ethers.getContractFactory("InterestCalculator");
  const interestCalculator = await InterestCalculator.deploy(bondAddress, issuanceAddress);
  await interestCalculator.waitForDeployment();
  const calculatorAddress = await interestCalculator.getAddress();
  console.log("✅ InterestCalculator deployed to:", calculatorAddress);
  console.log("");

  // 5. Setup Roles
  console.log("⚙️  Setting up roles and permissions...");
  
  const MINTER_ROLE = await infrastructureBond.MINTER_ROLE();
  const ADMIN_ROLE = await bondIssuance.ADMIN_ROLE();

  // Grant BondIssuance permission to mint tokens
  await infrastructureBond.grantRole(MINTER_ROLE, issuanceAddress);
  console.log("✅ Granted MINTER_ROLE to BondIssuance");

  // Grant InterestCalculator permission to mint tokens (for interest payments)
  await infrastructureBond.grantRole(MINTER_ROLE, calculatorAddress);
  console.log("✅ Granted MINTER_ROLE to InterestCalculator");

  // Grant MilestoneManager permission to release funds
  await bondIssuance.grantRole(ADMIN_ROLE, milestoneAddress);
  console.log("✅ Granted ADMIN_ROLE to MilestoneManager");

  console.log("");
  console.log("-------------------------------------------");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("-------------------------------------------\n");

  console.log("📋 Contract Addresses:");
  console.log("InfrastructureBond:", bondAddress);
  console.log("BondIssuance:      ", issuanceAddress);
  console.log("MilestoneManager:  ", milestoneAddress);
  console.log("InterestCalculator:", calculatorAddress);
  console.log("");

  console.log("💾 Save these addresses to your .env file:");
  console.log(`BOND_TOKEN_ADDRESS=${bondAddress}`);
  console.log(`BOND_ISSUANCE_ADDRESS=${issuanceAddress}`);
  console.log(`MILESTONE_MANAGER_ADDRESS=${milestoneAddress}`);
  console.log(`INTEREST_CALCULATOR_ADDRESS=${calculatorAddress}`);
  console.log("");

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("-------------------------------------------");
    console.log("📝 To verify contracts on Polygonscan, run:");
    console.log("");
    console.log(`npx hardhat verify --network ${hre.network.name} ${bondAddress} "INFRACHAIN Bond Token" "INFRA"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${issuanceAddress} ${bondAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${milestoneAddress} ${issuanceAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${calculatorAddress} ${bondAddress} ${issuanceAddress}`);
    console.log("");
  }

  return {
    infrastructureBond: bondAddress,
    bondIssuance: issuanceAddress,
    milestoneManager: milestoneAddress,
    interestCalculator: calculatorAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
