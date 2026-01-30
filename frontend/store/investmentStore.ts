import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  description: string;
  targetFunding: number;
  currentFunding: number;
  tokenPrice: number;
  interestRate: number;
  duration: number;
  risk: string;
  status: string;
  category: string;
  location: string;
  investorCount?: number;
  bondContractAddress?: string;
  issuanceContractAddress?: string;
}

interface Investment {
  id: string;
  projectId: string;
  projectName: string;
  tokenAmount: number;
  tokensHeld: number;
  investmentAmount: number;
  purchaseDate: string;
  interestEarned: number;
  currentValue: number;
}

interface TransactionStatus {
  status: 'idle' | 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
}

interface InvestmentState {
  // Selected project for investment
  selectedProject: Project | null;
  
  // Investment amount
  investmentAmount: number;
  tokenAmount: number;
  
  // Transaction status
  transaction: TransactionStatus;
  
  // User's investments
  investments: Investment[];
  
  // Portfolio summary
  totalInvested: number;
  totalTokens: number;
  totalInterestEarned: number;
  activeProjects: number;
  
  // Actions
  selectProject: (project: Project) => void;
  setInvestmentAmount: (amount: number) => void;
  calculateTokens: () => void;
  startTransaction: () => void;
  updateTransaction: (status: Partial<TransactionStatus>) => void;
  completeInvestment: (investment: Investment) => void;
  resetInvestment: () => void;
  loadInvestments: (investments: Investment[]) => void;
  updatePortfolioSummary: () => void;
  clearInvestments: () => void;
}

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedProject: null,
      investmentAmount: 0,
      tokenAmount: 0,
      transaction: {
        status: 'idle',
        message: '',
      },
      investments: [],
      totalInvested: 0,
      totalTokens: 0,
      totalInterestEarned: 0,
      activeProjects: 0,

      // Select a project for investment
      selectProject: (project) => {
        set({
          selectedProject: project,
          investmentAmount: 0,
          tokenAmount: 0,
          transaction: { status: 'idle', message: '' },
        });
      },

      // Set investment amount and calculate tokens
      setInvestmentAmount: (amount) => {
        const { selectedProject } = get();
        if (selectedProject) {
          const tokens = amount / selectedProject.tokenPrice;
          set({
            investmentAmount: amount,
            tokenAmount: tokens,
          });
        }
      },

      // Calculate tokens based on investment amount
      calculateTokens: () => {
        const { selectedProject, investmentAmount } = get();
        if (selectedProject && selectedProject.tokenPrice > 0) {
          const tokens = investmentAmount / selectedProject.tokenPrice;
          set({ tokenAmount: tokens });
        }
      },

      // Start transaction
      startTransaction: () => {
        set({
          transaction: {
            status: 'pending',
            message: 'Processing transaction...',
          },
        });
      },

      // Update transaction status
      updateTransaction: (status) => {
        set((state) => ({
          transaction: {
            ...state.transaction,
            ...status,
          },
        }));
      },

      // Complete investment after successful transaction
      completeInvestment: (investment) => {
        set((state) => {
          const updatedInvestments = [...state.investments, investment];
          return {
            investments: updatedInvestments,
            selectedProject: null,
            investmentAmount: 0,
            tokenAmount: 0,
            transaction: {
              status: 'success',
              message: 'Investment completed successfully!',
            },
          };
        });
        get().updatePortfolioSummary();
      },

      // Reset investment state
      resetInvestment: () => {
        set({
          selectedProject: null,
          investmentAmount: 0,
          tokenAmount: 0,
          transaction: { status: 'idle', message: '' },
        });
      },

      // Load investments from API
      loadInvestments: (investments) => {
        set({ investments });
        get().updatePortfolioSummary();
      },

      // Update portfolio summary
      updatePortfolioSummary: () => {
        const { investments } = get();
        
        const totalInvested = investments.reduce(
          (sum, inv) => sum + inv.investmentAmount,
          0
        );
        
        const totalTokens = investments.reduce(
          (sum, inv) => sum + inv.tokenAmount,
          0
        );
        
        const totalInterestEarned = investments.reduce(
          (sum, inv) => sum + inv.interestEarned,
          0
        );
        
        const uniqueProjects = new Set(investments.map((inv) => inv.projectId));
        const activeProjects = uniqueProjects.size;

        set({
          totalInvested,
          totalTokens,
          totalInterestEarned,
          activeProjects,
        });
      },

      // Clear all investments (logout)
      clearInvestments: () => {
        set({
          investments: [],
          totalInvested: 0,
          totalTokens: 0,
          totalInterestEarned: 0,
          activeProjects: 0,
          selectedProject: null,
          investmentAmount: 0,
          tokenAmount: 0,
          transaction: { status: 'idle', message: '' },
        });
      },
    }),
    {
      name: 'investment-storage',
      partialize: (state) => ({
        investments: state.investments,
        totalInvested: state.totalInvested,
        totalTokens: state.totalTokens,
        totalInterestEarned: state.totalInterestEarned,
        activeProjects: state.activeProjects,
      }),
    }
  )
);

export type { Project, Investment, TransactionStatus };
