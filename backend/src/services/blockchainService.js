const Web3 = require('web3');
const { ethers } = require('ethers');

// Contract ABIs (simplified - will need full ABIs after deployment)
const BOND_TOKEN_ABI = require('../contracts/InfrastructureBond.json');
const BOND_ISSUANCE_ABI = require('../contracts/BondIssuance.json');
const MILESTONE_MANAGER_ABI = require('../contracts/MilestoneManager.json');
const INTEREST_CALCULATOR_ABI = require('../contracts/InterestCalculator.json');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    this.web3 = new Web3(process.env.BLOCKCHAIN_RPC_URL);
    
    // Contract addresses from environment
    this.bondTokenAddress = process.env.BOND_TOKEN_ADDRESS;
    this.bondIssuanceAddress = process.env.BOND_ISSUANCE_ADDRESS;
    this.milestoneManagerAddress = process.env.MILESTONE_MANAGER_ADDRESS;
    this.interestCalculatorAddress = process.env.INTEREST_CALCULATOR_ADDRESS;
    
    // Initialize contracts (read-only)
    this.bondToken = new ethers.Contract(
      this.bondTokenAddress,
      BOND_TOKEN_ABI,
      this.provider
    );
    
    this.bondIssuance = new ethers.Contract(
      this.bondIssuanceAddress,
      BOND_ISSUANCE_ABI,
      this.provider
    );
    
    this.milestoneManager = new ethers.Contract(
      this.milestoneManagerAddress,
      MILESTONE_MANAGER_ABI,
      this.provider
    );
    
    this.interestCalculator = new ethers.Contract(
      this.interestCalculatorAddress,
      INTEREST_CALCULATOR_ABI,
      this.provider
    );
  }

  /**
   * Get project details from blockchain
   */
  async getProject(projectId) {
    try {
      const project = await this.bondIssuance.getProject(projectId);
      return {
        name: project[0],
        fundingGoal: ethers.formatEther(project[1]),
        fundsRaised: ethers.formatEther(project[2]),
        fundsReleased: ethers.formatEther(project[3]),
        interestRate: Number(project[4]) / 100,
        duration: Number(project[5]),
        isActive: project[6]
      };
    } catch (error) {
      console.error('Error fetching project from blockchain:', error);
      throw error;
    }
  }

  /**
   * Get user's token balance
   */
  async getTokenBalance(walletAddress) {
    try {
      const balance = await this.bondToken.balanceOf(walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      throw error;
    }
  }

  /**
   * Get user's investment in a project
   */
  async getUserInvestment(walletAddress, projectId) {
    try {
      const investment = await this.bondIssuance.getUserInvestment(walletAddress, projectId);
      return ethers.formatEther(investment);
    } catch (error) {
      console.error('Error fetching user investment:', error);
      throw error;
    }
  }

  /**
   * Get project investors count
   */
  async getProjectInvestorCount(projectId) {
    try {
      const count = await this.bondIssuance.getProjectInvestorCount(projectId);
      return Number(count);
    } catch (error) {
      console.error('Error fetching investor count:', error);
      throw error;
    }
  }

  /**
   * Get project milestones from blockchain
   */
  async getProjectMilestones(projectId) {
    try {
      const milestones = await this.milestoneManager.getProjectMilestones(projectId);
      return milestones.map(m => ({
        name: m.name,
        description: m.description,
        targetDate: new Date(Number(m.targetDate) * 1000),
        fundsToRelease: ethers.formatEther(m.fundsToRelease),
        status: Number(m.status),
        completedDate: m.completedDate > 0 ? new Date(Number(m.completedDate) * 1000) : null,
        evidenceHash: m.evidenceHash
      }));
    } catch (error) {
      console.error('Error fetching milestones:', error);
      throw error;
    }
  }

  /**
   * Get accrued interest for investor
   */
  async getAccruedInterest(walletAddress, projectId) {
    try {
      const interest = await this.interestCalculator.calculateAccruedInterest(walletAddress, projectId);
      return ethers.formatEther(interest);
    } catch (error) {
      console.error('Error calculating interest:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      console.error('Error fetching transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Get current block number
   */
  async getCurrentBlock() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error('Error fetching block number:', error);
      throw error;
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(txHash) {
    try {
      const receipt = await this.getTransactionReceipt(txHash);
      if (!receipt) {
        return { status: 'pending', confirmed: false };
      }
      
      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        confirmed: true,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: receipt.from,
        to: receipt.to
      };
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw error;
    }
  }

  /**
   * Listen to contract events
   */
  listenToEvents() {
    // Investment events
    this.bondIssuance.on('InvestmentMade', (projectId, investor, amount, tokensMinted, event) => {
      console.log('Investment Event:', {
        projectId: Number(projectId),
        investor,
        amount: ethers.formatEther(amount),
        tokensMinted: ethers.formatEther(tokensMinted),
        txHash: event.log.transactionHash
      });
      // Emit to websocket or process
    });

    // Milestone completion events
    this.milestoneManager.on('MilestoneCompleted', (projectId, milestoneIndex, fundsReleased, evidenceHash, event) => {
      console.log('Milestone Completed:', {
        projectId: Number(projectId),
        milestoneIndex: Number(milestoneIndex),
        fundsReleased: ethers.formatEther(fundsReleased),
        evidenceHash,
        txHash: event.log.transactionHash
      });
    });

    // Interest claim events
    this.interestCalculator.on('InterestClaimed', (investor, projectId, amount, tokensMinted, event) => {
      console.log('Interest Claimed:', {
        investor,
        projectId: Number(projectId),
        amount: ethers.formatEther(amount),
        tokensMinted: ethers.formatEther(tokensMinted),
        txHash: event.log.transactionHash
      });
    });
  }

  /**
   * Get contract with signer (for write operations - admin only)
   */
  getContractWithSigner(contractName, privateKey) {
    const wallet = new ethers.Wallet(privateKey, this.provider);
    
    const addresses = {
      bondToken: this.bondTokenAddress,
      bondIssuance: this.bondIssuanceAddress,
      milestoneManager: this.milestoneManagerAddress,
      interestCalculator: this.interestCalculatorAddress
    };

    const abis = {
      bondToken: BOND_TOKEN_ABI,
      bondIssuance: BOND_ISSUANCE_ABI,
      milestoneManager: MILESTONE_MANAGER_ABI,
      interestCalculator: INTEREST_CALCULATOR_ABI
    };

    return new ethers.Contract(addresses[contractName], abis[contractName], wallet);
  }

  /**
   * Get current block number
   */
  async getCurrentBlock() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      console.error('Error fetching current block:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
