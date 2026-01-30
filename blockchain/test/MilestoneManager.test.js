const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MilestoneManager", function () {
  let milestoneManager;
  let infrastructureBond;
  let owner;
  let projectManager;
  let auditor;
  let investor;

  const PROJECT_ID = "proj-001";
  const TOTAL_FUNDING = ethers.parseEther("50000"); // 50,000 ETH

  beforeEach(async function () {
    [owner, projectManager, auditor, investor] = await ethers.getSigners();

    // Deploy InfrastructureBond first
    const InfrastructureBond = await ethers.getContractFactory("InfrastructureBond");
    infrastructureBond = await InfrastructureBond.deploy(
      "Mumbai Coastal Road",
      "MCR",
      ethers.parseEther("50000000"),
      ethers.parseEther("0.001")
    );

    // Deploy MilestoneManager
    const MilestoneManager = await ethers.getContractFactory("MilestoneManager");
    milestoneManager = await MilestoneManager.deploy(
      PROJECT_ID,
      infrastructureBond.address,
      TOTAL_FUNDING
    );

    // Grant project manager role
    await milestoneManager.grantProjectManagerRole(projectManager.address);
    await milestoneManager.grantAuditorRole(auditor.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await milestoneManager.owner()).to.equal(owner.address);
    });

    it("Should set the correct project ID", async function () {
      expect(await milestoneManager.projectId()).to.equal(PROJECT_ID);
    });

    it("Should set the correct bond token address", async function () {
      expect(await milestoneManager.bondToken()).to.equal(infrastructureBond.address);
    });

    it("Should initialize with zero milestones", async function () {
      expect(await milestoneManager.getMilestoneCount()).to.equal(0);
    });
  });

  describe("Milestone Creation", function () {
    it("Should allow project manager to create milestone", async function () {
      const name = "Site Preparation";
      const description = "Land acquisition and site preparation";
      const fundRelease = ethers.parseEther("5000");
      const targetDate = Math.floor(Date.now() / 1000) + 86400 * 90; // 90 days

      await milestoneManager
        .connect(projectManager)
        .createMilestone(name, description, fundRelease, targetDate);

      expect(await milestoneManager.getMilestoneCount()).to.equal(1);

      const milestone = await milestoneManager.getMilestone(0);
      expect(milestone.name).to.equal(name);
      expect(milestone.description).to.equal(description);
      expect(milestone.fundReleaseAmount).to.equal(fundRelease);
      expect(milestone.isCompleted).to.equal(false);
    });

    it("Should reject milestone creation from non-project manager", async function () {
      await expect(
        milestoneManager
          .connect(investor)
          .createMilestone(
            "Milestone",
            "Description",
            ethers.parseEther("1000"),
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.be.revertedWith("Not authorized: requires PROJECT_MANAGER role");
    });

    it("Should emit MilestoneCreated event", async function () {
      const name = "Foundation Work";
      const fundRelease = ethers.parseEther("8000");

      await expect(
        milestoneManager
          .connect(projectManager)
          .createMilestone(
            name,
            "Foundation and piling",
            fundRelease,
            Math.floor(Date.now() / 1000) + 86400 * 180
          )
      )
        .to.emit(milestoneManager, "MilestoneCreated")
        .withArgs(0, name, fundRelease);
    });

    it("Should reject milestone with zero fund release", async function () {
      await expect(
        milestoneManager
          .connect(projectManager)
          .createMilestone(
            "Milestone",
            "Description",
            0,
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.be.revertedWith("Fund release amount must be greater than zero");
    });

    it("Should reject milestone with past target date", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 86400;

      await expect(
        milestoneManager
          .connect(projectManager)
          .createMilestone(
            "Milestone",
            "Description",
            ethers.parseEther("1000"),
            pastDate
          )
      ).to.be.revertedWith("Target date must be in the future");
    });
  });

  describe("Milestone Completion", function () {
    beforeEach(async function () {
      // Create a milestone first
      await milestoneManager
        .connect(projectManager)
        .createMilestone(
          "Site Preparation",
          "Land acquisition",
          ethers.parseEther("5000"),
          Math.floor(Date.now() / 1000) + 86400 * 90
        );

      // Fund the contract
      await owner.sendTransaction({
        to: milestoneManager.address,
        value: TOTAL_FUNDING
      });
    });

    it("Should allow auditor to mark milestone as complete", async function () {
      await milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 1", "Deliverable 2"]);

      const milestone = await milestoneManager.getMilestone(0);
      expect(milestone.isCompleted).to.equal(true);
    });

    it("Should reject completion from non-auditor", async function () {
      await expect(
        milestoneManager.connect(investor).completeMilestone(0, ["Deliverable 1"])
      ).to.be.revertedWith("Not authorized: requires AUDITOR role");
    });

    it("Should reject completion of non-existent milestone", async function () {
      await expect(
        milestoneManager.connect(auditor).completeMilestone(5, ["Deliverable 1"])
      ).to.be.revertedWith("Invalid milestone ID");
    });

    it("Should reject completion of already completed milestone", async function () {
      await milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 1"]);

      await expect(
        milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 2"])
      ).to.be.revertedWith("Milestone already completed");
    });

    it("Should emit MilestoneCompleted event", async function () {
      const deliverables = ["Land acquired", "Site cleared"];

      await expect(milestoneManager.connect(auditor).completeMilestone(0, deliverables))
        .to.emit(milestoneManager, "MilestoneCompleted")
        .withArgs(0, ethers.parseEther("5000"));
    });

    it("Should track total funds released", async function () {
      await milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 1"]);

      expect(await milestoneManager.totalFundsReleased()).to.equal(ethers.parseEther("5000"));
    });
  });

  describe("Fund Release", function () {
    beforeEach(async function () {
      await milestoneManager
        .connect(projectManager)
        .createMilestone(
          "Milestone 1",
          "Description",
          ethers.parseEther("5000"),
          Math.floor(Date.now() / 1000) + 86400 * 90
        );

      await owner.sendTransaction({
        to: milestoneManager.address,
        value: TOTAL_FUNDING
      });
    });

    it("Should release funds upon milestone completion", async function () {
      const initialBalance = await ethers.provider.getBalance(milestoneManager.address);

      await milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 1"]);

      const finalBalance = await ethers.provider.getBalance(milestoneManager.address);
      expect(initialBalance - finalBalance).to.equal(ethers.parseEther("5000"));
    });

    it("Should emit FundsReleased event", async function () {
      await expect(milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 1"]))
        .to.emit(milestoneManager, "FundsReleased")
        .withArgs(0, ethers.parseEther("5000"));
    });

    it("Should fail if contract has insufficient balance", async function () {
      // Create milestone with large fund release
      await milestoneManager
        .connect(projectManager)
        .createMilestone(
          "Large Milestone",
          "Description",
          ethers.parseEther("100000"),
          Math.floor(Date.now() / 1000) + 86400 * 90
        );

      await expect(
        milestoneManager.connect(auditor).completeMilestone(1, ["Deliverable 1"])
      ).to.be.revertedWith("Insufficient contract balance");
    });
  });

  describe("Multiple Milestones", function () {
    it("Should handle multiple milestones correctly", async function () {
      const milestones = [
        {
          name: "Milestone 1",
          amount: ethers.parseEther("5000")
        },
        {
          name: "Milestone 2",
          amount: ethers.parseEther("8000")
        },
        {
          name: "Milestone 3",
          amount: ethers.parseEther("12000")
        }
      ];

      for (const m of milestones) {
        await milestoneManager
          .connect(projectManager)
          .createMilestone(
            m.name,
            "Description",
            m.amount,
            Math.floor(Date.now() / 1000) + 86400 * 90
          );
      }

      expect(await milestoneManager.getMilestoneCount()).to.equal(3);
    });

    it("Should calculate correct project progress", async function () {
      // Create 3 milestones
      for (let i = 0; i < 3; i++) {
        await milestoneManager
          .connect(projectManager)
          .createMilestone(
            `Milestone ${i + 1}`,
            "Description",
            ethers.parseEther("5000"),
            Math.floor(Date.now() / 1000) + 86400 * 90
          );
      }

      await owner.sendTransaction({
        to: milestoneManager.address,
        value: TOTAL_FUNDING
      });

      // Complete first milestone
      await milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 1"]);

      const progress = await milestoneManager.getProjectProgress();
      expect(progress).to.equal(33); // 1 out of 3 = 33%
    });
  });

  describe("Role Management", function () {
    it("Should allow owner to grant project manager role", async function () {
      const newManager = investor;
      await milestoneManager.grantProjectManagerRole(newManager.address);

      // Should be able to create milestone
      await expect(
        milestoneManager
          .connect(newManager)
          .createMilestone(
            "Milestone",
            "Description",
            ethers.parseEther("1000"),
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.not.be.reverted;
    });

    it("Should allow owner to revoke project manager role", async function () {
      await milestoneManager.revokeProjectManagerRole(projectManager.address);

      await expect(
        milestoneManager
          .connect(projectManager)
          .createMilestone(
            "Milestone",
            "Description",
            ethers.parseEther("1000"),
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.be.revertedWith("Not authorized: requires PROJECT_MANAGER role");
    });

    it("Should allow owner to grant auditor role", async function () {
      const newAuditor = investor;
      await milestoneManager.grantAuditorRole(newAuditor.address);

      await milestoneManager
        .connect(projectManager)
        .createMilestone(
          "Milestone",
          "Description",
          ethers.parseEther("5000"),
          Math.floor(Date.now() / 1000) + 86400
        );

      await owner.sendTransaction({
        to: milestoneManager.address,
        value: TOTAL_FUNDING
      });

      await expect(
        milestoneManager.connect(newAuditor).completeMilestone(0, ["Deliverable 1"])
      ).to.not.be.reverted;
    });

    it("Should prevent non-owner from granting roles", async function () {
      await expect(
        milestoneManager.connect(investor).grantProjectManagerRole(investor.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      const milestones = [
        { name: "M1", amount: ethers.parseEther("5000") },
        { name: "M2", amount: ethers.parseEther("8000") },
        { name: "M3", amount: ethers.parseEther("12000") }
      ];

      for (const m of milestones) {
        await milestoneManager
          .connect(projectManager)
          .createMilestone(
            m.name,
            "Description",
            m.amount,
            Math.floor(Date.now() / 1000) + 86400 * 90
          );
      }

      await owner.sendTransaction({
        to: milestoneManager.address,
        value: TOTAL_FUNDING
      });

      await milestoneManager.connect(auditor).completeMilestone(0, ["Deliverable 1"]);
    });

    it("Should return all milestones", async function () {
      const milestones = await milestoneManager.getAllMilestones();
      expect(milestones.length).to.equal(3);
    });

    it("Should return pending milestones", async function () {
      const pending = await milestoneManager.getPendingMilestones();
      expect(pending.length).to.equal(2);
    });

    it("Should return completed milestones", async function () {
      const completed = await milestoneManager.getCompletedMilestones();
      expect(completed.length).to.equal(1);
    });

    it("Should calculate total funds locked correctly", async function () {
      const totalLocked = await milestoneManager.getTotalFundsLocked();
      expect(totalLocked).to.equal(ethers.parseEther("20000")); // 8000 + 12000
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause contract", async function () {
      await milestoneManager.pause();

      await expect(
        milestoneManager
          .connect(projectManager)
          .createMilestone(
            "Milestone",
            "Description",
            ethers.parseEther("1000"),
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to emergency withdraw", async function () {
      await owner.sendTransaction({
        to: milestoneManager.address,
        value: TOTAL_FUNDING
      });

      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await milestoneManager.emergencyWithdraw();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("Should prevent non-owner from emergency withdraw", async function () {
      await expect(
        milestoneManager.connect(investor).emergencyWithdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
