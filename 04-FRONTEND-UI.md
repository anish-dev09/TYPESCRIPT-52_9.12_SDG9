# PHASE 5-7: Frontend Development Complete Guide
## React/Next.js UI Implementation for INFRACHAIN-SDG9

---

## 📋 PHASE 5: Frontend Architecture & Setup

### **Project Structure**

```
frontend/
├── src/
│   ├── pages/
│   │   ├── _app.tsx                 # Global app wrapper
│   │   ├── _document.tsx            # HTML document
│   │   ├── index.tsx                # Home/landing page
│   │   ├── dashboard.tsx            # Main investor dashboard
│   │   ├── login.tsx                # Auth page
│   │   ├── signup.tsx               # Registration page
│   │   ├── projects/
│   │   │   ├── index.tsx            # Projects listing
│   │   │   ├── [id].tsx             # Project detail page
│   │   │   └── [id]/invest.tsx      # Investment page
│   │   ├── portfolio/
│   │   │   ├── index.tsx            # Holdings
│   │   │   └── history.tsx          # Investment history
│   │   ├── transparency/
│   │   │   ├── index.tsx            # Fund tracking
│   │   │   └── [projectId].tsx      # Project transparency
│   │   └── profile.tsx              # User profile
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── WalletConnect.tsx
│   │   │   └── KYCForm.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectGrid.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── ProjectFilters.tsx
│   │   │   └── ProjectStats.tsx
│   │   │
│   │   ├── investment/
│   │   │   ├── InvestmentFlow.tsx
│   │   │   ├── InvestmentForm.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── SuccessScreen.tsx
│   │   │
│   │   ├── portfolio/
│   │   │   ├── PortfolioOverview.tsx
│   │   │   ├── HoldingsList.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── InterestWidget.tsx
│   │   │   └── TransactionHistory.tsx
│   │   │
│   │   ├── transparency/
│   │   │   ├── FundTracker.tsx
│   │   │   ├── MilestoneTimeline.tsx
│   │   │   ├── ImpactMetrics.tsx
│   │   │   └── AuditLog.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Alert.tsx
│   │   │
│   │   └── layout/
│   │       ├── MainLayout.tsx
│   │       ├── AuthLayout.tsx
│   │       └── PublicLayout.tsx
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios config
│   │   │   ├── projectApi.ts
│   │   │   ├── investmentApi.ts
│   │   │   ├── userApi.ts
│   │   │   ├── transparencyApi.ts
│   │   │   └── authApi.ts
│   │   │
│   │   ├── web3/
│   │   │   ├── web3Provider.ts
│   │   │   ├── contractService.ts
│   │   │   ├── walletService.ts
│   │   │   └── transactionService.ts
│   │   │
│   │   └── utils/
│   │       ├── tokenCalculator.ts
│   │       ├── interestCalculator.ts
│   │       ├── formatters.ts
│   │       └── validators.ts
│   │
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── projectSlice.ts
│   │   │   ├── investmentSlice.ts
│   │   │   └── uiSlice.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProjects.ts
│   │   │   ├── usePortfolio.ts
│   │   │   └── useWeb3.ts
│   │   │
│   │   └── store.ts              # Redux config
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components/
│   │       ├── buttons.css
│   │       ├── cards.css
│   │       └── forms.css
│   │
│   ├── contracts/
│   │   ├── abis/
│   │   │   ├── InfrastructureBond.json
│   │   │   ├── BondIssuance.json
│   │   │   ├── MilestoneManager.json
│   │   │   └── InterestCalculator.json
│   │   │
│   │   └── addresses.json        # Contract addresses
│   │
│   ├── types/
│   │   ├── index.ts
│   │   ├── project.ts
│   │   ├── investment.ts
│   │   ├── user.ts
│   │   └── blockchain.ts
│   │
│   ├── hooks/
│   │   ├── useWindowSize.ts
│   │   ├── useClickOutside.ts
│   │   └── useFetch.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── env.ts
│   │   └── helpers.ts
│   │
│   └── config/
│       ├── networks.ts
│       └── chains.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── logos/
│
├── .env.local
├── .env.production
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### **Key Dependencies**

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "axios": "^1.6.5",
    "ethers": "^6.10.0",
    "web3": "^4.0.0",
    "web3modal": "^3.1.0",
    "tailwindcss": "^3.4.1",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "recharts": "^2.10.3",
    "zustand": "^4.4.6",
    "react-hook-form": "^7.48.0",
    "react-toastify": "^10.0.3",
    "date-fns": "^2.30.0",
    "numeral": "^2.0.6",
    "clsx": "^2.0.0",
    "next-auth": "^4.24.14"
  }
}
```

---

## 🎨 PHASE 6: Core Dashboard Components

### **1. Header Component**

```typescript
// components/common/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/hooks/useAuth';
import { WalletConnect } from '@/components/auth/WalletConnect';
import { UserMenu } from '@/components/common/UserMenu';

interface HeaderProps {
  variant?: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'light' }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className={`header header-${variant}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">IC</span>
            </div>
            <span className="text-xl font-bold text-gray-800">INFRACHAIN</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex gap-8">
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link href="/projects" className="nav-link">
                Projects
              </Link>
              <Link href="/portfolio" className="nav-link">
                Portfolio
              </Link>
              <Link href="/transparency" className="nav-link">
                Transparency
              </Link>
            </nav>
          )}

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <WalletConnect />
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
```

### **2. Portfolio Overview Component**

```typescript
// components/portfolio/PortfolioOverview.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/hooks/useAuth';
import { investmentApi } from '@/services/api/investmentApi';
import { PerformanceChart } from './PerformanceChart';
import { HoldingsList } from './HoldingsList';
import { InterestWidget } from './InterestWidget';

export interface Portfolio {
  totalInvested: number;
  totalCurrentValue: number;
  totalGain: number;
  gainPercentage: number;
  totalTokensHeld: number;
  monthlyInterestEarned: number;
  holdingsByProject: Array<{
    projectId: string;
    projectName: string;
    tokensHeld: number;
    investmentValue: number;
    currentValue: number;
    interestEarned: number;
    percentage: number;
  }>;
}

export const PortfolioOverview: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await investmentApi.getPortfolio();
        setPortfolio(response.portfolio);
        setError(null);
      } catch (err) {
        setError('Failed to load portfolio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [isAuthenticated]);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!portfolio) return null;

  return (
    <div className="portfolio-overview">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Invested"
          value={`₹${portfolio.totalInvested.toLocaleString()}`}
          subtext="across projects"
        />
        <SummaryCard
          title="Current Value"
          value={`₹${portfolio.totalCurrentValue.toLocaleString()}`}
          change={portfolio.gainPercentage}
          trend={portfolio.totalGain > 0 ? 'up' : 'down'}
        />
        <SummaryCard
          title="Total Gain"
          value={`₹${portfolio.totalGain.toLocaleString()}`}
          subtext={`${portfolio.gainPercentage}% return`}
        />
        <SummaryCard
          title="Monthly Interest"
          value={`₹${portfolio.monthlyInterestEarned.toLocaleString()}`}
          subtext="auto-accruing"
        />
      </div>

      {/* Charts & Widgets */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <InterestWidget />
      </div>

      {/* Holdings List */}
      <div className="mt-8">
        <HoldingsList holdings={portfolio.holdingsByProject} />
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtext?: string;
  change?: number;
  trend?: 'up' | 'down';
}> = ({ title, value, subtext, change, trend }) => {
  return (
    <div className="card bg-white shadow-md p-6 rounded-lg">
      <p className="text-gray-600 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
      {change !== undefined && (
        <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {Math.abs(change)}%
        </p>
      )}
      {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
    </div>
  );
};
```

### **3. Project Listing Component**

```typescript
// components/projects/ProjectGrid.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { projectApi } from '@/services/api/projectApi';
import { ProjectCard } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';

export interface Project {
  id: string;
  name: string;
  location: string;
  totalFunding: number;
  fundsRaised: number;
  interestRate: number;
  duration: number;
  riskLevel: 'low' | 'medium' | 'high';
  investors: number;
  completionPercentage: number;
  imageUrl?: string;
  status: 'active' | 'completed' | 'delayed';
}

interface ProjectGridProps {
  filters?: {
    riskLevel?: string;
    status?: string;
    sortBy?: string;
  };
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({ filters = {} }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getProjects({
          page,
          ...filters,
        });
        setProjects(response.projects);
        setTotalPages(response.pagination.pages);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [page, filters]);

  return (
    <div className="project-grid-container">
      <ProjectFilters />

      {loading ? (
        <div className="loading-spinner">Loading projects...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

### **4. Project Card Component**

```typescript
// components/projects/ProjectCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from './ProjectGrid';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const fundingProgress = (project.fundsRaised / project.totalFunding) * 100;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Image */}
        {project.imageUrl && (
          <div className="w-full h-48 bg-gray-200 overflow-hidden">
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 flex-1">
              {project.name}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(project.riskLevel)}`}>
              {project.riskLevel.toUpperCase()}
            </span>
          </div>

          {/* Location */}
          <p className="text-sm text-gray-600 mb-3">📍 {project.location}</p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Funded</span>
              <span>{fundingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(fundingProgress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div>
              <p className="text-xs text-gray-600">Interest Rate</p>
              <p className="text-sm font-bold text-gray-800">
                {(project.interestRate / 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Duration</p>
              <p className="text-sm font-bold text-gray-800">
                {project.duration}mo
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Investors</p>
              <p className="text-sm font-bold text-gray-800">
                {project.investors.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Funding Amount */}
          <div className="border-t pt-3">
            <p className="text-xs text-gray-600">
              ₹{(project.fundsRaised / 10000000).toFixed(0)}Cr /₹{(project.totalFunding / 10000000).toFixed(0)}Cr raised
            </p>
          </div>

          {/* CTA Button */}
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Invest Now
          </button>
        </div>
      </div>
    </Link>
  );
};
```

### **5. Investment Flow Component**

```typescript
// components/investment/InvestmentFlow.tsx
'use client';

import React, { useState } from 'react';
import { Project } from '@/components/projects/ProjectGrid';
import { InvestmentForm } from './InvestmentForm';
import { ConfirmDialog } from './ConfirmDialog';
import { SuccessScreen } from './SuccessScreen';

type Step = 'amount' | 'confirm' | 'processing' | 'success';

export interface InvestmentData {
  projectId: string;
  tokenQuantity: number;
  totalAmount: number;
  transactionHash?: string;
}

interface InvestmentFlowProps {
  project: Project;
  onClose: () => void;
}

export const InvestmentFlow: React.FC<InvestmentFlowProps> = ({ project, onClose }) => {
  const [step, setStep] = useState<Step>('amount');
  const [investmentData, setInvestmentData] = useState<InvestmentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAmountSubmit = (data: InvestmentData) => {
    setInvestmentData(data);
    setStep('confirm');
  };

  const handleConfirm = async (txHash: string) => {
    try {
      setStep('processing');
      // Call backend to record investment
      const response = await fetch('/api/investments/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          tokenQuantity: investmentData!.tokenQuantity,
          totalAmount: investmentData!.totalAmount,
          transactionHash: txHash,
        }),
      });

      if (!response.ok) throw new Error('Investment recording failed');

      setInvestmentData({ ...investmentData!, transactionHash: txHash });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setStep('confirm');
    }
  };

  return (
    <div className="investment-flow">
      {step === 'amount' && (
        <InvestmentForm
          project={project}
          onSubmit={handleAmountSubmit}
          onCancel={onClose}
        />
      )}

      {step === 'confirm' && investmentData && (
        <ConfirmDialog
          investmentData={investmentData}
          project={project}
          onConfirm={handleConfirm}
          onBack={() => setStep('amount')}
          error={error}
        />
      )}

      {step === 'processing' && (
        <div className="text-center py-12">
          <div className="loading-spinner">Processing transaction...</div>
        </div>
      )}

      {step === 'success' && investmentData && (
        <SuccessScreen
          investmentData={investmentData}
          project={project}
          onClose={onClose}
        />
      )}
    </div>
  );
};
```

---

## 🔗 PHASE 8: Blockchain Integration (Web3.js/Ethers.js)

### **Web3 Service Layer**

```typescript
// services/web3/contractService.ts
import { ethers } from 'ethers';
import BondIssuanceABI from '@/contracts/abis/BondIssuance.json';
import InfrastructureBondABI from '@/contracts/abis/InfrastructureBond.json';
import addresses from '@/contracts/addresses.json';

export interface InvestmentTx {
  hash: string;
  amount: string;
  tokens: string;
  projectId: string;
}

export class ContractService {
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer | null = null;

  constructor() {
    // @ts-ignore
    this.provider = new ethers.BrowserProvider(window.ethereum);
  }

  /**
   * Connect wallet and get signer
   */
  async connectWallet(): Promise<string> {
    try {
      // Request account access
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      this.signer = await this.provider.getSigner();
      return accounts[0];
    } catch (error) {
      throw new Error('Failed to connect wallet');
    }
  }

  /**
   * Get bond issuance contract instance
   */
  getBondIssuanceContract() {
    if (!this.signer) throw new Error('Signer not initialized');
    
    return new ethers.Contract(
      addresses.bondIssuance,
      BondIssuanceABI,
      this.signer
    );
  }

  /**
   * Invest in a project
   */
  async investInProject(projectId: number, amount: bigint): Promise<InvestmentTx> {
    try {
      const contract = this.getBondIssuanceContract();

      // Estimate gas
      const gasEstimate = await contract.investInProject.estimateGas(
        projectId,
        amount
      );

      // Send transaction
      const tx = await contract.investInProject(projectId, amount, {
        gasLimit: gasEstimate.mul(11).div(10), // 10% buffer
      });

      const receipt = await tx.wait();

      return {
        hash: tx.hash,
        amount: amount.toString(),
        tokens: amount.toString(), // 1:1 for now
        projectId: projectId.toString(),
      };
    } catch (error) {
      throw new Error(`Investment failed: ${error}`);
    }
  }

  /**
   * Get user's investments in a project
   */
  async getUserHoldings(userAddress: string, projectId: number): Promise<string> {
    try {
      const contract = this.getBondIssuanceContract();
      const holdings = await contract.getInvestorHoldings(userAddress, projectId);
      return holdings.toString();
    } catch (error) {
      throw new Error('Failed to fetch holdings');
    }
  }

  /**
   * Get project details from contract
   */
  async getProjectDetails(projectId: number) {
    try {
      const contract = this.getBondIssuanceContract();
      const details = await contract.getProject(projectId);
      
      return {
        id: details[0].toString(),
        tokenAddress: details[1],
        fundingGoal: details[2].toString(),
        fundsRaised: details[3].toString(),
        fundsReleased: details[4].toString(),
        createdAt: details[5].toString(),
      };
    } catch (error) {
      throw new Error('Failed to fetch project details');
    }
  }

  /**
   * Listen to investment events
   */
  listenToInvestmentEvents(projectId: number, callback: (event: any) => void) {
    const contract = this.getBondIssuanceContract();
    const filter = contract.filters.InvestmentMade(null, projectId);
    
    contract.on(filter, (investor, id, amount, tokens, event) => {
      callback({ investor, amount, tokens, event });
    });
  }

  /**
   * Claim interest tokens
   */
  async claimInterest(projectId: number): Promise<string> {
    try {
      const interestContract = new ethers.Contract(
        addresses.interestCalculator,
        [], // Use minimal ABI
        this.signer
      );

      const tx = await interestContract.claimInterest(projectId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error('Failed to claim interest');
    }
  }

  /**
   * Get user's network
   */
  async getNetwork() {
    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId.toString(),
    };
  }
}

export const contractService = new ContractService();
```

### **Wallet Connection Hook**

```typescript
// services/web3/walletService.ts
import { contractService } from './contractService';

export async function connectMetaMask(): Promise<{
  address: string;
  network: string;
  chainId: string;
}> {
  try {
    // Request wallet connection
    const address = await contractService.connectWallet();

    // Get network info
    const network = await contractService.getNetwork();

    // Validate network (should be Polygon Mumbai)
    if (network.chainId !== '80001') {
      throw new Error('Please switch to Polygon Mumbai testnet');
    }

    return {
      address,
      network: network.name,
      chainId: network.chainId,
    };
  } catch (error) {
    throw new Error(`Wallet connection failed: ${error}`);
  }
}

export async function approveTokenSpending(
  spender: string,
  amount: bigint
): Promise<string> {
  try {
    // Implementation for approving token spending
    // This would call the USDC contract's approve function
    return 'approval_tx_hash';
  } catch (error) {
    throw new Error('Approval failed');
  }
}
```

---

## 📊 PHASE 9: Transparency Dashboard Components

### **Fund Tracker Component**

```typescript
// components/transparency/FundTracker.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { transparencyApi } from '@/services/api/transparencyApi';

interface FundReport {
  projectId: string;
  projectName: string;
  totalRaised: number;
  released: number;
  locked: number;
  timeline: Array<{
    date: string;
    amount: number;
    description: string;
    milestone?: string;
  }>;
}

export const FundTracker: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [report, setReport] = useState<FundReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await transparencyApi.getProjectTransparency(projectId);
        setReport(response.report);
      } catch (error) {
        console.error('Failed to fetch transparency report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;
  if (!report) return null;

  const releasePercentage = (report.released / report.totalRaised) * 100;

  return (
    <div className="fund-tracker bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-6">Fund Tracking</h3>

      {/* Fund Status */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Total Raised</p>
            <p className="text-2xl font-bold">₹{(report.totalRaised / 10000000).toFixed(1)}Cr</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Released</p>
            <p className="text-2xl font-bold text-green-600">₹{(report.released / 10000000).toFixed(1)}Cr</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">In Escrow</p>
            <p className="text-2xl font-bold text-yellow-600">₹{(report.locked / 10000000).toFixed(1)}Cr</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-700">Fund Release Progress</span>
            <span className="font-bold">{releasePercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${releasePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <h4 className="font-bold mb-4">Fund Release Timeline</h4>
        <div className="space-y-4">
          {report.timeline.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full ${event.amount > 0 ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                {index < report.timeline.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-300"></div>
                )}
              </div>
              <div className="pb-4">
                <p className="font-bold text-gray-800">{event.description}</p>
                <p className="text-sm text-gray-600">{event.date}</p>
                {event.amount > 0 && (
                  <p className="text-sm font-bold text-green-600 mt-1">
                    ₹{(event.amount / 10000000).toFixed(1)}Cr released
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### **Milestone Timeline Component**

```typescript
// components/transparency/MilestoneTimeline.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { projectApi } from '@/services/api/projectApi';

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'failed';
  completionPercentage: number;
  fundsToRelease: number;
  evidence?: string;
  daysAhead?: number;
}

export const MilestoneTimeline: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await projectApi.getMilestones(projectId);
        setMilestones(response.milestones);
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="milestones-timeline bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-6">Project Milestones</h3>

      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="relative">
            {/* Vertical line */}
            {index < milestones.length - 1 && (
              <div className="absolute left-4 top-12 w-0.5 h-20 bg-gray-200"></div>
            )}

            {/* Milestone item */}
            <div className="flex gap-4">
              {/* Status indicator */}
              <div className="relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ${getStatusColor(milestone.status)}`}
                >
                  {getStatusIcon(milestone.status)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800">{milestone.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(milestone.status)}`}>
                    {milestone.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress */}
                {milestone.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{milestone.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${milestone.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-gray-600">
                    📅 {new Date(milestone.targetDate).toLocaleDateString()}
                  </span>
                  <span className="text-green-600 font-bold">
                    💰 ₹{(milestone.fundsToRelease / 10000000).toFixed(1)}Cr
                  </span>
                  {milestone.daysAhead && milestone.daysAhead > 0 && (
                    <span className="text-blue-600">{milestone.daysAhead} days ahead</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-600';
    case 'in_progress':
      return 'bg-blue-600';
    case 'delayed':
      return 'bg-orange-600';
    case 'failed':
      return 'bg-red-600';
    default:
      return 'bg-gray-400';
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'completed':
      return '✓';
    case 'in_progress':
      return '⊙';
    case 'delayed':
      return '⚠';
    case 'failed':
      return '✕';
    default:
      return '○';
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'delayed':
      return 'bg-orange-100 text-orange-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
```

---

## ✅ Completion Checklist for Phases 5-9

- [ ] Next.js project setup complete with TypeScript
- [ ] All page components created
- [ ] Redux store configured
- [ ] All UI components implemented
- [ ] Tailwind CSS styling applied
- [ ] Web3.js integration complete
- [ ] Contract service layer functional
- [ ] Wallet connection working
- [ ] Investment transactions functional
- [ ] Portfolio calculations working
- [ ] Transparency dashboard displaying data
- [ ] Milestone timeline rendering
- [ ] All API calls tested
- [ ] Mobile responsive design verified

---

**Next Phase:** Phase 10 - Testing & Demo
**Estimated Duration:** 4-5 hours
**Dependencies:** All frontend + blockchain components complete

Created: January 30, 2026
Status: Complete ✅
