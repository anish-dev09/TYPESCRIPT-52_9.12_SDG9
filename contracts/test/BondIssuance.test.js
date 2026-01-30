const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BondIssuance", function () {
  let infrastructureBond;
  let bondIssuance;
  let owner;
  let projectManager;
  let investor1;
  let investor2;
  let projectWallet;

  beforeEach(async function () {
    [owner, projectManager, investor1, investor2, projectWallet] = await ethers.getSigners();

    // Deploy InfrastructureBond
    const InfrastructureBond = await ethers.getContractFactory("InfrastructureBond");
    infrastructureBond = await InfrastructureBond.deploy(
      "INFRACHAIN Bond Token",
      "INFRA"
    );
    await infrastructureBond.waitForDeployment();

    // Deploy BondIssuance
    const BondIssuance = await ethers.getContractFactory("BondIssuance");
    bondIssuance = await BondIssuance.deploy(await infrastructureBond.getAddress());
    await bondIssuance.waitForDeployment();

    // Grant roles
    const MINTER_ROLE = await infrastructureBond.MINTER_ROLE();
    const PROJECT_MANAGER_ROLE = await bondIssuance.PROJECT_MANAGER_ROLE();
    
    await infrastructureBond.grantRole(MINTER_ROLE, await bondIssuance.getAddress());
    await bondIssuance.grantRole(PROJECT_MANAGER_ROLE, projectManager.address);
  });

  describe("Project Creation", function () {
    it("Should create a new project successfully", async function () {
      const tx = await bondIssuance.connect(projectManager).createProject(
        "Mumbai Metro Phase 3",
        ethers.parseEther("1000"),
        850, // 8.5% annual interest
        24, // 24 months
        projectWallet.address
      );

      await expect(tx).to.emit(bondIssuance, "ProjectCreated");
      
      const [name, fundingGoal, , , interestRate, duration, isActive] = 
        await bondIssuance.getProject(1);
      
      expect(name).to.equal("Mumbai Metro Phase 3");
      expect(fundingGoal).to.equal(ethers.parseEther("1000"));
      expect(interestRate).to.equal(850);
      expect(duration).to.equal(24);
      expect(isActive).to.be.true;
    });

    it("Should not allow non-project-manager to create project", async function () {
      await expect(
        bondIssuance.connect(investor1).createProject(
          "Test Project",
          ethers.parseEther("1000"),
          850,
          24,
          projectWallet.address
        )
      ).to.be.reverted;
    });

    it("Should validate project parameters", async function () {
      await expect(
        bondIssuance.connect(projectManager).createProject(
          "",
          ethers.parseEther("1000"),
          850,
          24,
          projectWallet.address
        )
      ).to.be.revertedWith("Project name required");

      await expect(
        bondIssuance.connect(projectManager).createProject(
          "Test Project",
          0,
          850,
          24,
          projectWallet.address
        )
      ).to.be.revertedWith("Funding goal must be greater than zero");

      await expect(
        bondIssuance.connect(projectManager).createProject(
          "Test Project",
          ethers.parseEther("1000"),
          2500, // 25% - too high
          24,
          projectWallet.address
        )
      ).to.be.revertedWith("Interest rate must be between 0-20%");
    });
  });

  describe("Investments", function () {
    beforeEach(async function () {
      await bondIssuance.connect(projectManager).createProject(
        "Delhi Smart City",
        ethers.parseEther("1000"),
        850,
        24,
        projectWallet.address
      );
    });

    it("Should accept investment and mint tokens", async function () {
      const investmentAmount = ethers.parseEther("10");
      
      await bondIssuance.connect(investor1).investInProject(1, {
        value: investmentAmount
      });

      // Check investment recorded
      const userInvestment = await bondIssuance.getUserInvestment(investor1.address, 1);
      expect(userInvestment).to.equal(investmentAmount);

      // Check tokens minted (10 ETH / 100 per token = 0.1 * 10^18 tokens)
      const tokenBalance = await infrastructureBond.balanceOf(investor1.address);
      expect(tokenBalance).to.be.gt(0);

      // Check project funds raised
      const [, , fundsRaised] = await bondIssuance.getProject(1);
      expect(fundsRaised).to.equal(investmentAmount);
    });

    it("Should track multiple investors", async function () {
      await bondIssuance.connect(investor1).investInProject(1, {
        value: ethers.parseEther("10")
      });
      
      await bondIssuance.connect(investor2).investInProject(1, {
        value: ethers.parseEther("20")
      });

      const investorCount = await bondIssuance.getProjectInvestorCount(1);
      expect(investorCount).to.equal(2);

      const investors = await bondIssuance.getProjectInvestors(1);
      expect(investors).to.include(investor1.address);
      expect(investors).to.include(investor2.address);
    });

    it("Should not accept investment exceeding funding goal", async function () {
      await expect(
        bondIssuance.connect(investor1).investInProject(1, {
          value: ethers.parseEther("1500")
        })
      ).to.be.revertedWith("Investment exceeds funding goal");
    });

    it("Should not accept investment in inactive project", async function () {
      await bondIssuance.connect(projectManager).setProjectStatus(1, false);
      
      await expect(
        bondIssuance.connect(investor1).investInProject(1, {
          value: ethers.parseEther("10")
        })
      ).to.be.revertedWith("Project is not active");
    });
  });

  describe("Fund Release", function () {
    beforeEach(async function () {
      await bondIssuance.connect(projectManager).createProject(
        "Bengaluru Metro",
        ethers.parseEther("1000"),
        850,
        24,
        projectWallet.address
      );

      await bondIssuance.connect(investor1).investInProject(1, {
        value: ethers.parseEther("500")
      });
    });

    it("Should release funds successfully", async function () {
      const initialBalance = await ethers.provider.getBalance(projectWallet.address);
      
      await bondIssuance.releaseFunds(1, ethers.parseEther("200"));
      
      const finalBalance = await ethers.provider.getBalance(projectWallet.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("200"));

      const [, , , fundsReleased] = await bondIssuance.getProject(1);
      expect(fundsReleased).to.equal(ethers.parseEther("200"));
    });

    it("Should not release more than raised", async function () {
      await expect(
        bondIssuance.releaseFunds(1, ethers.parseEther("600"))
      ).to.be.revertedWith("Cannot release more than raised");
    });

    it("Should track escrow balance correctly", async function () {
      const escrowBefore = await bondIssuance.getEscrowBalance(1);
      expect(escrowBefore).to.equal(ethers.parseEther("500"));

      await bondIssuance.releaseFunds(1, ethers.parseEther("200"));

      const escrowAfter = await bondIssuance.getEscrowBalance(1);
      expect(escrowAfter).to.equal(ethers.parseEther("300"));
    });
  });

  describe("Project Progress", function () {
    beforeEach(async function () {
      await bondIssuance.connect(projectManager).createProject(
        "Hyderabad Roads",
        ethers.parseEther("1000"),
        850,
        24,
        projectWallet.address
      );
    });

    it("Should calculate funding progress correctly", async function () {
      await bondIssuance.connect(investor1).investInProject(1, {
        value: ethers.parseEther("500")
      });

      const [fundingProgress] = await bondIssuance.getProjectProgress(1);
      expect(fundingProgress).to.equal(50); // 50%
    });

    it("Should calculate release progress correctly", async function () {
      await bondIssuance.connect(investor1).investInProject(1, {
        value: ethers.parseEther("500")
      });

      await bondIssuance.releaseFunds(1, ethers.parseEther("250"));

      const [, releaseProgress] = await bondIssuance.getProjectProgress(1);
      expect(releaseProgress).to.equal(50); // 50%
    });
  });
});
