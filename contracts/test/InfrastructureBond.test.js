const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InfrastructureBond", function () {
  let infrastructureBond;
  let owner;
  let minter;
  let investor1;
  let investor2;

  beforeEach(async function () {
    [owner, minter, investor1, investor2] = await ethers.getSigners();

    const InfrastructureBond = await ethers.getContractFactory("InfrastructureBond");
    infrastructureBond = await InfrastructureBond.deploy(
      "INFRACHAIN Bond Token",
      "INFRA"
    );
    await infrastructureBond.waitForDeployment();

    // Grant minter role
    const MINTER_ROLE = await infrastructureBond.MINTER_ROLE();
    await infrastructureBond.grantRole(MINTER_ROLE, minter.address);
  });

  describe("Deployment", function () {
    it("Should set the right token name and symbol", async function () {
      expect(await infrastructureBond.name()).to.equal("INFRACHAIN Bond Token");
      expect(await infrastructureBond.symbol()).to.equal("INFRA");
    });

    it("Should have correct token value", async function () {
      expect(await infrastructureBond.getTokenValue()).to.equal(100);
    });

    it("Should assign admin role to deployer", async function () {
      const DEFAULT_ADMIN_ROLE = await infrastructureBond.DEFAULT_ADMIN_ROLE();
      expect(await infrastructureBond.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await infrastructureBond.connect(minter).mint(investor1.address, amount);
      
      expect(await infrastructureBond.balanceOf(investor1.address)).to.equal(amount);
    });

    it("Should not allow non-minter to mint tokens", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        infrastructureBond.connect(investor1).mint(investor1.address, amount)
      ).to.be.reverted;
    });

    it("Should initialize interest tracking on first mint", async function () {
      const amount = ethers.parseEther("1000");
      await infrastructureBond.connect(minter).mint(investor1.address, amount);
      
      const [lastClaim, totalClaimed] = await infrastructureBond.getInterestInfo(investor1.address);
      expect(lastClaim).to.be.gt(0);
      expect(totalClaimed).to.equal(0);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      const BURNER_ROLE = await infrastructureBond.BURNER_ROLE();
      await infrastructureBond.grantRole(BURNER_ROLE, owner.address);
      
      const amount = ethers.parseEther("1000");
      await infrastructureBond.connect(minter).mint(investor1.address, amount);
    });

    it("Should allow burner to burn tokens", async function () {
      const burnAmount = ethers.parseEther("500");
      await infrastructureBond.burn(investor1.address, burnAmount);
      
      expect(await infrastructureBond.balanceOf(investor1.address)).to.equal(
        ethers.parseEther("500")
      );
    });

    it("Should not allow burning more than balance", async function () {
      const burnAmount = ethers.parseEther("2000");
      await expect(
        infrastructureBond.burn(investor1.address, burnAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Interest Calculation", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      await infrastructureBond.connect(minter).mint(investor1.address, amount);
    });

    it("Should calculate accrued interest correctly", async function () {
      // Note: Time manipulation would require network helpers
      // For now, testing the calculation function with current time
      const annualRate = 850; // 8.5%
      const interest = await infrastructureBond.calculateAccruedInterest(
        investor1.address,
        annualRate
      );
      
      // Interest should be 0 on same block
      expect(interest).to.equal(0);
    });

    it("Should return zero interest for zero balance", async function () {
      const annualRate = 850;
      const interest = await infrastructureBond.calculateAccruedInterest(
        investor2.address,
        annualRate
      );
      
      expect(interest).to.equal(0);
    });
  });

  describe("Holdings Value", function () {
    it("Should calculate holding value correctly", async function () {
      const amount = ethers.parseEther("1000");
      await infrastructureBond.connect(minter).mint(investor1.address, amount);
      
      const value = await infrastructureBond.getHoldingValue(investor1.address);
      
      // 1000 tokens * 100 = 100,000
      expect(value).to.equal(100000n * 10n**18n);
    });
  });

  describe("Pause Functionality", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("1000");
      await infrastructureBond.connect(minter).mint(investor1.address, amount);
    });

    it("Should allow pauser to pause transfers", async function () {
      await infrastructureBond.pause();
      
      await expect(
        infrastructureBond.connect(investor1).transfer(investor2.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should allow pauser to unpause", async function () {
      await infrastructureBond.pause();
      await infrastructureBond.unpause();
      
      await infrastructureBond.connect(investor1).transfer(investor2.address, ethers.parseEther("100"));
      expect(await infrastructureBond.balanceOf(investor2.address)).to.equal(ethers.parseEther("100"));
    });
  });
});
