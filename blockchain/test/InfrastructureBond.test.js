const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InfrastructureBond", function () {
  let infrastructureBond;
  let owner;
  let investor1;
  let investor2;
  let projectManager;

  const PROJECT_NAME = "Mumbai Coastal Road";
  const PROJECT_SYMBOL = "MCR";
  const TOTAL_SUPPLY = ethers.parseEther("50000000"); // 50 million tokens
  const TOKEN_PRICE = ethers.parseEther("0.001"); // 0.001 ETH per token (mock ₹100)

  beforeEach(async function () {
    [owner, investor1, investor2, projectManager] = await ethers.getSigners();

    const InfrastructureBond = await ethers.getContractFactory("InfrastructureBond");
    infrastructureBond = await InfrastructureBond.deploy(
      PROJECT_NAME,
      PROJECT_SYMBOL,
      TOTAL_SUPPLY,
      TOKEN_PRICE
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await infrastructureBond.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await infrastructureBond.balanceOf(owner.address);
      expect(await infrastructureBond.totalSupply()).to.equal(ownerBalance);
    });

    it("Should set the correct token price", async function () {
      expect(await infrastructureBond.tokenPrice()).to.equal(TOKEN_PRICE);
    });

    it("Should have correct name and symbol", async function () {
      expect(await infrastructureBond.name()).to.equal(PROJECT_NAME);
      expect(await infrastructureBond.symbol()).to.equal(PROJECT_SYMBOL);
    });
  });

  describe("Token Purchase", function () {
    it("Should allow users to purchase tokens", async function () {
      const tokensToBuy = ethers.parseEther("1000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: cost
      });

      expect(await infrastructureBond.balanceOf(investor1.address)).to.equal(tokensToBuy);
    });

    it("Should reject purchase with insufficient payment", async function () {
      const tokensToBuy = ethers.parseEther("1000");
      const insufficientPayment = ethers.parseEther("0.5");

      await expect(
        infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
          value: insufficientPayment
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject purchase exceeding available supply", async function () {
      const excessiveTokens = TOTAL_SUPPLY + ethers.parseEther("1000");

      await expect(
        infrastructureBond.connect(investor1).purchaseTokens(excessiveTokens, {
          value: ethers.parseEther("100000")
        })
      ).to.be.revertedWith("Insufficient tokens available");
    });

    it("Should emit TokensPurchased event", async function () {
      const tokensToBuy = ethers.parseEther("1000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await expect(
        infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
          value: cost
        })
      )
        .to.emit(infrastructureBond, "TokensPurchased")
        .withArgs(investor1.address, tokensToBuy, cost);
    });

    it("Should refund excess payment", async function () {
      const tokensToBuy = ethers.parseEther("1000");
      const exactCost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");
      const excessPayment = exactCost + ethers.parseEther("0.5");

      const initialBalance = await ethers.provider.getBalance(investor1.address);

      const tx = await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: excessPayment
      });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice || receipt.gasUsed * tx.gasPrice;

      const finalBalance = await ethers.provider.getBalance(investor1.address);
      const actualCost = initialBalance - finalBalance;

      expect(actualCost).to.be.closeTo(exactCost, ethers.parseEther("0.001"));
    });
  });

  describe("Token Transfers", function () {
    beforeEach(async function () {
      const tokensToBuy = ethers.parseEther("5000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: cost
      });
    });

    it("Should allow token transfers between investors", async function () {
      const transferAmount = ethers.parseEther("1000");

      await infrastructureBond.connect(investor1).transfer(investor2.address, transferAmount);

      expect(await infrastructureBond.balanceOf(investor2.address)).to.equal(transferAmount);
      expect(await infrastructureBond.balanceOf(investor1.address)).to.equal(
        ethers.parseEther("4000")
      );
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const transferAmount = ethers.parseEther("6000");

      await expect(
        infrastructureBond.connect(investor1).transfer(investor2.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should allow approved transfers", async function () {
      const approvalAmount = ethers.parseEther("2000");
      const transferAmount = ethers.parseEther("1500");

      await infrastructureBond.connect(investor1).approve(investor2.address, approvalAmount);

      await infrastructureBond
        .connect(investor2)
        .transferFrom(investor1.address, investor2.address, transferAmount);

      expect(await infrastructureBond.balanceOf(investor2.address)).to.equal(transferAmount);
    });
  });

  describe("Interest Accrual", function () {
    it("Should calculate correct interest for token holders", async function () {
      const tokensToBuy = ethers.parseEther("10000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: cost
      });

      const annualRate = 850; // 8.5%
      const holdingPeriodDays = 365;

      const expectedInterest = await infrastructureBond.calculateInterest(
        investor1.address,
        annualRate,
        holdingPeriodDays
      );

      // Interest = (tokens * rate * days) / (100 * 365)
      const calculatedInterest = (tokensToBuy * BigInt(annualRate) * BigInt(holdingPeriodDays)) / (BigInt(100) * BigInt(365));

      expect(expectedInterest).to.equal(calculatedInterest);
    });

    it("Should return zero interest for non-token holders", async function () {
      const interest = await infrastructureBond.calculateInterest(investor2.address, 850, 365);
      expect(interest).to.equal(0);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update token price", async function () {
      const newPrice = ethers.parseEther("0.002");

      await infrastructureBond.updateTokenPrice(newPrice);

      expect(await infrastructureBond.tokenPrice()).to.equal(newPrice);
    });

    it("Should prevent non-owner from updating token price", async function () {
      const newPrice = ethers.parseEther("0.002");

      await expect(
        infrastructureBond.connect(investor1).updateTokenPrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to pause token transfers", async function () {
      await infrastructureBond.pause();

      const tokensToBuy = ethers.parseEther("1000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await expect(
        infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
          value: cost
        })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause token transfers", async function () {
      await infrastructureBond.pause();
      await infrastructureBond.unpause();

      const tokensToBuy = ethers.parseEther("1000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await expect(
        infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
          value: cost
        })
      ).to.not.be.reverted;
    });

    it("Should allow owner to withdraw collected funds", async function () {
      const tokensToBuy = ethers.parseEther("10000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: cost
      });

      const contractBalance = await ethers.provider.getBalance(infrastructureBond.address);
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      await infrastructureBond.withdrawFunds();

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });
  });

  describe("Token Burning", function () {
    it("Should allow token holders to burn their tokens", async function () {
      const tokensToBuy = ethers.parseEther("5000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: cost
      });

      const burnAmount = ethers.parseEther("1000");
      await infrastructureBond.connect(investor1).burn(burnAmount);

      expect(await infrastructureBond.balanceOf(investor1.address)).to.equal(
        ethers.parseEther("4000")
      );
      expect(await infrastructureBond.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("Should fail to burn more tokens than owned", async function () {
      const tokensToBuy = ethers.parseEther("1000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: cost
      });

      const burnAmount = ethers.parseEther("2000");

      await expect(
        infrastructureBond.connect(investor1).burn(burnAmount)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("Events", function () {
    it("Should emit Transfer event on token purchase", async function () {
      const tokensToBuy = ethers.parseEther("1000");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await expect(
        infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
          value: cost
        })
      )
        .to.emit(infrastructureBond, "Transfer")
        .withArgs(owner.address, investor1.address, tokensToBuy);
    });

    it("Should emit TokenPriceUpdated event", async function () {
      const newPrice = ethers.parseEther("0.002");

      await expect(infrastructureBond.updateTokenPrice(newPrice))
        .to.emit(infrastructureBond, "TokenPriceUpdated")
        .withArgs(TOKEN_PRICE, newPrice);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple investors correctly", async function () {
      const tokens1 = ethers.parseEther("3000");
      const tokens2 = ethers.parseEther("2000");
      const cost1 = tokens1 * TOKEN_PRICE / ethers.parseEther("1");
      const cost2 = tokens2 * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokens1, {
        value: cost1
      });

      await infrastructureBond.connect(investor2).purchaseTokens(tokens2, {
        value: cost2
      });

      expect(await infrastructureBond.balanceOf(investor1.address)).to.equal(tokens1);
      expect(await infrastructureBond.balanceOf(investor2.address)).to.equal(tokens2);
    });

    it("Should handle fractional token purchases correctly", async function () {
      const tokensToBuy = ethers.parseEther("0.1");
      const cost = tokensToBuy * TOKEN_PRICE / ethers.parseEther("1");

      await infrastructureBond.connect(investor1).purchaseTokens(tokensToBuy, {
        value: cost
      });

      expect(await infrastructureBond.balanceOf(investor1.address)).to.equal(tokensToBuy);
    });
  });
});
