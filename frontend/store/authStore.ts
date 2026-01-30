import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import web3Service from '../services/web3Service';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  walletAddress: string;
  email: string;
  name: string;
  role: 'investor' | 'project_manager' | 'admin';
  kycStatus: 'pending' | 'verified' | 'rejected';
  totalInvested: number;
  totalTokens: number;
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  // State
  user: User | null;
  walletAddress: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isAuthenticated: boolean;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  login: (email?: string, name?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  setWalletAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      walletAddress: null,
      chainId: null,
      isConnecting: false,
      isAuthenticated: false,

      // Connect wallet action
      connectWallet: async () => {
        set({ isConnecting: true });
        
        try {
          const { address, chainId } = await web3Service.connectWallet();
          set({
            walletAddress: address,
            chainId,
            isConnecting: false,
          });

          // Setup listeners for account and chain changes
          web3Service.onAccountsChanged((accounts) => {
            if (accounts.length === 0) {
              get().disconnectWallet();
            } else {
              set({ walletAddress: accounts[0] });
              toast.info('Account changed');
            }
          });

          web3Service.onChainChanged((chainIdHex) => {
            const newChainId = parseInt(chainIdHex, 16);
            set({ chainId: newChainId });
            toast.info('Network changed');
            // Reload page on network change
            window.location.reload();
          });

          return;
        } catch (error) {
          console.error('Wallet connection error:', error);
          set({ isConnecting: false });
          throw error;
        }
      },

      // Disconnect wallet action
      disconnectWallet: () => {
        web3Service.disconnectWallet();
        apiService.clearToken();
        set({
          user: null,
          walletAddress: null,
          chainId: null,
          isAuthenticated: false,
        });
        toast.success('Wallet disconnected');
      },

      // Login action (authenticate with backend)
      login: async (email?: string, name?: string) => {
        const { walletAddress } = get();
        
        if (!walletAddress) {
          throw new Error('Please connect your wallet first');
        }

        try {
          // Create authentication message
          const message = `Welcome to INFRACHAIN!\n\nSign this message to authenticate your wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
          
          // Sign message with MetaMask
          const signature = await web3Service.signMessage(message);

          // Try to login first
          try {
            const loginResponse = await apiService.login(walletAddress, signature);
            
            apiService.setToken(loginResponse.token);
            set({
              user: loginResponse.user,
              isAuthenticated: true,
            });
            
            toast.success(`Welcome back, ${loginResponse.user.name}!`);
          } catch (loginError: any) {
            // If login fails (user doesn't exist), register new user
            if (loginError.response?.status === 404 || loginError.response?.status === 401) {
              if (!email || !name) {
                throw new Error('Email and name required for new users');
              }

              const registerResponse = await apiService.register({
                walletAddress,
                email,
                name,
                signature,
              });

              apiService.setToken(registerResponse.token);
              set({
                user: registerResponse.user,
                isAuthenticated: true,
              });

              toast.success(`Welcome to INFRACHAIN, ${name}!`);
            } else {
              throw loginError;
            }
          }
        } catch (error: any) {
          console.error('Login error:', error);
          throw error;
        }
      },

      // Logout action
      logout: () => {
        get().disconnectWallet();
        toast.success('Logged out successfully');
      },

      // Update user profile
      updateProfile: async (data) => {
        try {
          const updatedUser = await apiService.updateProfile(data);
          set({ user: updatedUser });
          toast.success('Profile updated successfully');
        } catch (error) {
          console.error('Profile update error:', error);
          throw error;
        }
      },

      // Refresh user data from backend
      refreshUser: async () => {
        try {
          const user = await apiService.getProfile();
          set({ user });
        } catch (error) {
          console.error('Refresh user error:', error);
          // If refresh fails, user might not be authenticated
          set({ user: null, isAuthenticated: false });
        }
      },

      // Set wallet address (for external updates)
      setWalletAddress: (address) => {
        set({ walletAddress: address });
      },

      // Set chain ID (for external updates)
      setChainId: (chainId) => {
        set({ chainId });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        walletAddress: state.walletAddress,
        chainId: state.chainId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
