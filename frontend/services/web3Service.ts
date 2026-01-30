import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

// Contract ABIs (minimal for now)
import InfrastructureBondABI from '../contracts/InfrastructureBond.json';
import BondIssuanceABI from '../contracts/BondIssuance.json';
import MilestoneManagerABI from '../contracts/MilestoneManager.json';
import InterestCalculatorABI from '../contracts/InterestCalculator.json';

// Contract addresses from environment
const CONTRACT_ADDRESSES = {
  infrastructureBond: process.env.NEXT_PUBLIC_INFRASTRUCTURE_BOND_ADDRESS || '',
  bondIssuance: process.env.NEXT_PUBLIC_BOND_ISSUANCE_ADDRESS || '',
  milestoneManager: process.env.NEXT_PUBLIC_MILESTONE_MANAGER_ADDRESS || '',
  interestCalculator: process.env.NEXT_PUBLIC_INTEREST_CALCULATOR_ADDRESS || '',
};

class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  
  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  }

  /**
   * Connect to MetaMask wallet
   */
  async connectWallet(): Promise<{ address: string; chainId: number }> {
    if (!this.isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to continue');
      throw new Error('MetaMask not installed');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      toast.success('Wallet connected successfully!');
      
      return { address, chainId };
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
      throw error;
    }
  }

  /**
   * Get current connected account
   */
  async getCurrentAccount(): Promise<string | null> {
    if (!this.isMetaMaskInstalled()) return null;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0] || null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  /**
   * Sign a message for authentication
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error: any) {
      console.error('Signature error:', error);
      toast.error('Failed to sign message');
      throw error;
    }
  }

  /**
   * Get user's ETH balance
   */
  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  /**
   * Get Infrastructure Bond contract instance
   */
  getBondContract() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    return new ethers.Contract(
      CONTRACT_ADDRESSES.infrastructureBond,
      InfrastructureBondABI.abi,
      this.signer
    );
  }

  /**
   * Get Bond Issuance contract instance
   */
  getBondIssuanceContract() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    return new ethers.Contract(
      CONTRACT_ADDRESSES.bondIssuance,
      BondIssuanceABI.abi,
      this.signer
    );
  }

  /**
   * Get Milestone Manager contract instance
   */
  getMilestoneManagerContract() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    return new ethers.Contract(
      CONTRACT_ADDRESSES.milestoneManager,
      MilestoneManagerABI.abi,
      this.signer
    );
  }

  /**
   * Get Interest Calculator contract instance
   */
  getInterestCalculatorContract() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    
    return new ethers.Contract(
      CONTRACT_ADDRESSES.interestCalculator,
      InterestCalculatorABI.abi,
      this.signer
    );
  }

  /**
   * Switch to a specific network
   */
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      toast.success('Network switched successfully');
    } catch (error: any) {
      if (error.code === 4902) {
        toast.error('Network not added to MetaMask');
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network');
      }
      throw error;
    }
  }

  /**
   * Listen to account changes
   */
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!this.isMetaMaskInstalled()) return;
    
    window.ethereum.on('accountsChanged', callback);
  }

  /**
   * Listen to chain changes
   */
  onChainChanged(callback: (chainId: string) => void): void {
    if (!this.isMetaMaskInstalled()) return;
    
    window.ethereum.on('chainChanged', callback);
  }

  /**
   * Remove event listeners
   */
  removeAllListeners(): void {
    if (!this.isMetaMaskInstalled()) return;
    
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }

  /**
   * Disconnect wallet (clear local references)
   */
  disconnectWallet(): void {
    this.provider = null;
    this.signer = null;
    this.removeAllListeners();
  }

  /**
   * PHASE 8: Token Purchase Flow with Approval
   */
  async purchaseTokens(projectId: string, amount: string): Promise<{
    txHash: string;
    tokensMinted: number;
  }> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const bondIssuanceContract = this.getBondIssuanceContract();
      const amountInWei = ethers.parseEther(amount);

      // Step 1: Estimate gas
      const gasEstimate = await bondIssuanceContract.invest.estimateGas(
        projectId,
        { value: amountInWei }
      );

      // Step 2: Execute purchase with 20% gas buffer
      const tx = await bondIssuanceContract.invest(projectId, {
        value: amountInWei,
        gasLimit: gasEstimate * BigInt(120) / BigInt(100),
      });

      toast.success('Transaction submitted! Waiting for confirmation...');

      // Step 3: Wait for confirmation
      const receipt = await tx.wait();

      // Step 4: Parse events to get tokens minted
      const tokensMinted = this.parseTokensMintedFromReceipt(receipt);

      toast.success(`Successfully purchased ${tokensMinted} tokens!`);

      return {
        txHash: receipt.hash,
        tokensMinted,
      };
    } catch (error: any) {
      console.error('Token purchase error:', error);
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else {
        toast.error('Token purchase failed');
      }
      throw error;
    }
  }

  /**
   * Approve token spending (for secondary market transfers)
   */
  async approveTokenSpending(spenderAddress: string, amount: string): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const bondContract = this.getBondContract();
      const amountInWei = ethers.parseUnits(amount, 18);

      const tx = await bondContract.approve(spenderAddress, amountInWei);
      toast.info('Approval transaction submitted...');

      const receipt = await tx.wait();
      toast.success('Token spending approved!');

      return receipt.hash;
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error('Failed to approve token spending');
      throw error;
    }
  }

  /**
   * Get token balance for an address
   */
  async getTokenBalance(address: string, projectId: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const bondContract = new ethers.Contract(
        CONTRACT_ADDRESSES.infrastructureBond,
        InfrastructureBondABI.abi,
        this.provider
      );

      const balance = await bondContract.balanceOf(address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  }

  /**
   * Estimate gas for token purchase
   */
  async estimateGasForPurchase(projectId: string, amount: string): Promise<{
    gasLimit: bigint;
    gasPrice: bigint;
    estimatedCost: string;
  }> {
    if (!this.provider || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const bondIssuanceContract = this.getBondIssuanceContract();
      const amountInWei = ethers.parseEther(amount);

      // Estimate gas limit
      const gasLimit = await bondIssuanceContract.invest.estimateGas(
        projectId,
        { value: amountInWei }
      );

      // Get current gas price with fallback
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

      // Calculate total cost
      const estimatedCost = ethers.formatEther(gasLimit * gasPrice);

      return {
        gasLimit,
        gasPrice,
        estimatedCost,
      };
    } catch (error) {
      console.error('Gas estimation error:', error);
      // Return fallback estimates
      return {
        gasLimit: BigInt(200000),
        gasPrice: ethers.parseUnits('20', 'gwei'),
        estimatedCost: '0.004',
      };
    }
  }

  /**
   * Monitor transaction status
   */
  async monitorTransaction(txHash: string, onUpdate: (status: {
    status: 'pending' | 'confirmed' | 'failed';
    confirmations?: number;
  }) => void): Promise<void> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      onUpdate({ status: 'pending' });

      const receipt = await this.provider.waitForTransaction(txHash, 1);

      if (receipt && receipt.status === 1) {
        onUpdate({ status: 'confirmed', confirmations: receipt.confirmations });
      } else {
        onUpdate({ status: 'failed' });
      }
    } catch (error) {
      console.error('Transaction monitoring error:', error);
      onUpdate({ status: 'failed' });
    }
  }

  /**
   * Get transaction receipt with details
   */
  async getTransactionReceipt(txHash: string): Promise<{
    success: boolean;
    blockNumber: number;
    gasUsed: string;
    effectiveGasPrice: string;
    from: string;
    to: string;
    events: any[];
  } | null> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) return null;

      return {
        success: receipt.status === 1,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: ethers.formatUnits(receipt.gasPrice, 'gwei'),
        from: receipt.from,
        to: receipt.to || '',
        events: receipt.logs.map(log => ({
          address: log.address,
          topics: log.topics,
          data: log.data,
        })),
      };
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      return null;
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address: string, startBlock: number = 0): Promise<any[]> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // Get events from BondIssuance contract
      const bondIssuanceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.bondIssuance,
        BondIssuanceABI.abi,
        this.provider
      );

      // Get investment events (adjust filter name based on actual contract)
      const filter = bondIssuanceContract.filters.InvestmentMade(address);
      const events = await bondIssuanceContract.queryFilter(filter, startBlock);

      return events.map(event => ({
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        args: event.args,
      }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  /**
   * Mock token airdrop for testing
   */
  async mockTokenAirdrop(address: string, amount: string): Promise<string> {
    // This is a mock function for demo purposes
    // In production, this would call a faucet contract or admin function
    console.log(`Mock airdrop of ${amount} tokens to ${address}`);
    
    toast.info('🎁 Mock token airdrop initiated!');
    
    // Simulate transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTxHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
        toast.success(`Airdrop complete! TX: ${mockTxHash.substring(0, 10)}...`);
        resolve(mockTxHash);
      }, 2000);
    });
  }

  /**
   * Parse tokens minted from transaction receipt
   */
  private parseTokensMintedFromReceipt(receipt: any): number {
    try {
      // Look for TokensMinted or Transfer event
      const bondContract = this.getBondContract();
      
      for (const log of receipt.logs) {
        try {
          const parsed = bondContract.interface.parseLog(log);
          if (parsed && (parsed.name === 'TokensMinted' || parsed.name === 'Transfer')) {
            return Number(ethers.formatUnits(parsed.args.amount || parsed.args.value, 18));
          }
        } catch (e) {
          // Skip logs that don't match our interface
          continue;
        }
      }
      
      // Fallback: estimate from value sent
      return 0;
    } catch (error) {
      console.error('Error parsing tokens minted:', error);
      return 0;
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<{
    name: string;
    chainId: number;
    isTestnet: boolean;
  } | null> {
    if (!this.provider) return null;

    try {
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      const networkNames: Record<number, { name: string; isTestnet: boolean }> = {
        1: { name: 'Ethereum Mainnet', isTestnet: false },
        137: { name: 'Polygon Mainnet', isTestnet: false },
        80001: { name: 'Polygon Mumbai', isTestnet: true },
        11155111: { name: 'Sepolia Testnet', isTestnet: true },
        31337: { name: 'Hardhat Local', isTestnet: true },
      };

      const networkInfo = networkNames[chainId] || { 
        name: `Unknown Network (${chainId})`, 
        isTestnet: true 
      };

      return {
        name: networkInfo.name,
        chainId,
        isTestnet: networkInfo.isTestnet,
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  }
}

// Export singleton instance
const web3Service = new Web3Service();
export default web3Service;

// Type augmentation for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
