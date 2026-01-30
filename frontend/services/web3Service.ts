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
