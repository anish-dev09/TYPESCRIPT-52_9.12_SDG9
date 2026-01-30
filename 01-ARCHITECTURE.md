# PHASE 1: Architecture & System Design
## Complete Architecture Documentation for INFRACHAIN-SDG9

---

## 🏗️ SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INFRACHAIN PLATFORM                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER (React/Next.js)                │
│  ┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐     │
│  │  Dashboard      │ │  Project Listing │ │ Transparency     │     │
│  │  - Portfolio    │ │  - Cards         │ │ - Fund Tracker   │     │
│  │  - Holdings     │ │  - Filters       │ │ - Milestones     │     │
│  │  - Earnings     │ │  - Detail Page   │ │ - Impact Metrics │     │
│  └─────────────────┘ └──────────────────┘ └──────────────────┘     │
│                                                                      │
│  ┌──────────────────────────────────────┐                          │
│  │    Investment Flow (Step-by-step)    │                          │
│  │    - Select Project                  │                          │
│  │    - Choose Amount                   │                          │
│  │    - Approve Transaction             │                          │
│  │    - Confirm Receipt                 │                          │
│  └──────────────────────────────────────┘                          │
│                                                                      │
│  ┌──────────────────────────────────────┐                          │
│  │     State Management (Redux/Zustand) │                          │
│  │     - User State                     │                          │
│  │     - Investment State               │                          │
│  │     - UI State                       │                          │
│  └──────────────────────────────────────┘                          │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  Web3.js / Ethers.js │
                    │  Layer               │
                    │  - Connect Wallet    │
                    │  - Send Transactions │
                    │  - Read Smart State  │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────────┐
        │                                                 │
    ┌───────────────────┐                  ┌──────────────────────┐
    │   BACKEND API     │                  │  BLOCKCHAIN LAYER    │
    │   (Node.js/Expr)  │                  │  (Ethereum/Polygon)  │
    │                   │                  │                      │
    │ ┌───────────────┐ │                  │ ┌──────────────────┐ │
    │ │ Authentication│ │                  │ │ Smart Contracts  │ │
    │ │ - JWT         │ │                  │ │ - Bond Tokens    │ │
    │ │ - Web3Auth    │ │                  │ │ - Escrow         │ │
    │ │ - KYC Mock    │ │                  │ │ - Milestones     │ │
    │ └───────────────┘ │                  │ └──────────────────┘ │
    │                   │                  │                      │
    │ ┌───────────────┐ │                  │ ┌──────────────────┐ │
    │ │ Project APIs  │ │                  │ │ Contract Events  │ │
    │ │ - List        │ │                  │ │ - TokenMinted    │ │
    │ │ - Detail      │ │                  │ │ - FundTransfer   │ │
    │ │ - Create      │ │                  │ │ - MilestoneHit   │ │
    │ └───────────────┘ │                  │ └──────────────────┘ │
    │                   │                  │                      │
    │ ┌───────────────┐ │                  │ ┌──────────────────┐ │
    │ │ Investment API│ │                  │ │ Event Indexing   │ │
    │ │ - Record Buy  │ │◄──────────────────│ - The Graph (Opt) │ │
    │ │ - Portfolio   │ │                  │ - Blockchain RPC  │ │
    │ │ - History     │ │                  │                    │ │
    │ └───────────────┘ │                  │ ┌──────────────────┐ │
    │                   │                  │ │ Wallet Mgmt      │ │
    │ ┌───────────────┐ │                  │ │ - User Wallets   │ │
    │ │ Transparency  │ │                  │ │ - Fund Escrow    │ │
    │ │ - Fund Track  │ │                  │                    │ │
    │ │ - Milestones  │ │                  └──────────────────┘ │
    │ │ - Calcs       │ │                                        │
    │ └───────────────┘ │                  Polygon Mumbai Testnet│
    │                   │                  (Low Fees, Fast)      │
    │ ┌───────────────┐ │                  or                    │
    │ │ Interest Calc │ │                  Ethereum Sepolia      │
    │ │ Service       │ │                                        │
    │ └───────────────┘ │                  └──────────────────────┘
    │                   │
    └───────────────────┘
            ↓
    ┌──────────────────────┐
    │  DATABASE LAYER      │
    │  (PostgreSQL)        │
    │                      │
    │ ┌──────────────────┐ │
    │ │ Users Table      │ │
    │ │ - id             │ │
    │ │ - wallet_address │ │
    │ │ - kyc_status     │ │
    │ └──────────────────┘ │
    │                      │
    │ ┌──────────────────┐ │
    │ │ Projects Table   │ │
    │ │ - id             │ │
    │ │ - name           │ │
    │ │ - total_funding  │ │
    │ │ - milestones     │ │
    │ └──────────────────┘ │
    │                      │
    │ ┌──────────────────┐ │
    │ │ Investments Table│ │
    │ │ - user_id        │ │
    │ │ - project_id     │ │
    │ │ - tokens_bought  │ │
    │ │ - tx_hash        │ │
    │ └──────────────────┘ │
    │                      │
    │ ┌──────────────────┐ │
    │ │ Milestones Table │ │
    │ │ - project_id     │ │
    │ │ - status         │ │
    │ │ - funds_released │ │
    │ └──────────────────┘ │
    │                      │
    │ ┌──────────────────┐ │
    │ │ Interest Accrual │ │
    │ │ - user_id        │ │
    │ │ - accrued_amount │ │
    │ │ - paid_amount    │ │
    │ └──────────────────┘ │
    │                      │
    └──────────────────────┘
```

---

## 🔄 DATA FLOW ARCHITECTURE

### **User Journey: From Signup to Interest Collection**

```
1. USER SIGNUP & ONBOARDING
   ├─ Email signup + Password
   ├─ Connect MetaMask wallet
   ├─ Mock KYC verification (Admin approval)
   └─ Account created with role "investor"

2. BROWSE PROJECTS
   ├─ Backend returns list of projects
   │  ├─ Project name, description
   │  ├─ Funding goal & raised amount
   │  ├─ Interest rate, duration
   │  ├─ Risk level (static)
   │  └─ Milestone timeline
   └─ Frontend displays attractive cards

3. VIEW PROJECT DETAIL
   ├─ Full project information
   ├─ Team & governance info
   ├─ Fund utilization breakdown
   ├─ Milestone timeline
   ├─ Current investor count
   └─ Investment calculator (shows returns)

4. INVEST IN PROJECT
   ├─ User selects token quantity (₹100/token)
   ├─ Backend creates "investment order"
   ├─ Frontend shows: "Approve spending"
   │  └─ User confirms MetaMask transaction
   │     ├─ Smart contract checks user balance
   │     ├─ Transfers mock USDC to escrow
   │     └─ Mints bond tokens to user wallet
   ├─ Frontend polls blockchain for transaction
   ├─ Once confirmed:
   │  ├─ Backend records investment in DB
   │  ├─ Updates project "funds_raised"
   │  └─ Calculates interest accrual rate
   └─ Shows success: "Tokens received!"

5. VIEW PORTFOLIO DASHBOARD
   ├─ Shows all holdings:
   │  ├─ Project name
   │  ├─ Tokens held
   │  ├─ Amount invested
   │  ├─ Current value (with interest)
   │  └─ Interest earned (monthly)
   ├─ Total portfolio stats
   ├─ Diversification chart
   └─ ROI trends

6. TRACK PROJECT PROGRESS
   ├─ Transparency dashboard shows:
   │  ├─ Funds raised vs. target
   │  ├─ Funds locked in escrow
   │  ├─ Funds released per milestone
   │  ├─ Milestone timeline
   │  └─ Project status updates
   └─ User sees real-time progress

7. MILESTONE COMPLETION & FUND RELEASE
   ├─ Admin marks milestone as complete
   ├─ Smart contract releases corresponding funds
   │  ├─ Updates escrow state
   │  ├─ Logs "FundReleased" event
   │  └─ Funds go to project account
   ├─ Backend listens to event
   ├─ Updates "milestone_status" in DB
   └─ Frontend shows milestone as complete

8. INTEREST ACCRUAL & DISTRIBUTION
   ├─ Backend continuously calculates interest:
   │  ├─ Interest rate per project (annual)
   │  ├─ Tokens held by user
   │  ├─ Time held (days)
   │  └─ Formula: (tokens × rate × days) / 365
   ├─ Frontend shows "Interest earned: ₹X"
   ├─ User clicks "Claim Interest"
   │  └─ Smart contract mints new tokens to user
   │     ├─ User receives interest_amount as tokens
   │     ├─ Backend updates "interest_paid"
   │     └─ Resets accrual counter
   └─ Frontend shows "Interest claimed!"

9. SECONDARY MARKET (Optional)
   ├─ User lists tokens for sale
   │  ├─ Chooses price & quantity
   │  └─ Token transfer approval
   ├─ Another user buys tokens
   │  ├─ Transfers mock currency
   │  └─ Receives bond tokens
   └─ Backend updates ownership records

10. TRANSPARENCY & REPORTING
    ├─ User can export investment history
    ├─ View tax-relevant reports
    ├─ See impact metrics
    │  ├─ Roads built
    │  ├─ Lives impacted
    │  └─ Carbon reduction
    └─ Share impact on social media
```

---

## 🗄️ DATABASE SCHEMA (Logical)

```
TABLE: users
├─ id (PK)
├─ wallet_address (UNIQUE)
├─ email (UNIQUE)
├─ kyc_verified (BOOLEAN)
├─ role (investor | admin | auditor)
├─ created_at
└─ updated_at

TABLE: projects
├─ id (PK)
├─ name
├─ description
├─ total_funding_target (BIGINT)
├─ current_funds_raised (BIGINT)
├─ funds_released (BIGINT)
├─ interest_rate_annual (DECIMAL)
├─ duration_months (INT)
├─ risk_level (low | medium | high)
├─ contract_address (blockchain)
├─ status (active | completed | delayed)
├─ created_at
└─ updated_at

TABLE: investments
├─ id (PK)
├─ user_id (FK → users)
├─ project_id (FK → projects)
├─ tokens_purchased (BIGINT)
├─ amount_invested (DECIMAL)
├─ token_price (DECIMAL)
├─ tx_hash (blockchain tx)
├─ status (pending | confirmed | failed)
├─ invested_at
└─ updated_at

TABLE: milestones
├─ id (PK)
├─ project_id (FK → projects)
├─ name
├─ description
├─ target_date
├─ fund_release_amount (BIGINT)
├─ status (pending | completed | delayed | failed)
├─ completed_date
├─ evidence_url
├─ created_at
└─ updated_at

TABLE: fund_releases
├─ id (PK)
├─ milestone_id (FK → milestones)
├─ amount_released (DECIMAL)
├─ tx_hash (blockchain tx)
├─ released_at
└─ released_by_admin (FK → users)

TABLE: interest_accruals
├─ id (PK)
├─ user_id (FK → users)
├─ project_id (FK → projects)
├─ tokens_held (BIGINT)
├─ interest_rate (DECIMAL)
├─ accrued_amount (DECIMAL)
├─ paid_amount (DECIMAL)
├─ payment_date
└─ updated_at

TABLE: audit_logs
├─ id (PK)
├─ user_id (FK → users)
├─ action
├─ resource_id
├─ old_value (JSON)
├─ new_value (JSON)
├─ timestamp
└─ ip_address
```

---

## 🔐 Smart Contract Architecture

### **Contract Relationships**

```
┌─────────────────────────────────┐
│   InfrastructureBond.sol        │
│   (ERC-20 Token)                │
│                                 │
│   Functions:                    │
│   - mint(amount)                │
│   - transfer(to, amount)        │
│   - approve(spender, amount)    │
│   - balanceOf(account)          │
│                                 │
│   Events:                       │
│   - TokenMinted(amount, to)     │
│   - Transfer(from, to, amount)  │
└─────────────────────────────────┘
            ↓ (inherits from)
┌─────────────────────────────────┐
│   BondIssuance.sol              │
│   (Investment & Escrow)         │
│                                 │
│   Manages:                      │
│   - Investment collection       │
│   - Fund escrow                 │
│   - Investor tracking           │
│   - Fund balance                │
│                                 │
│   Functions:                    │
│   - investProject(projectId,    │
│       amount)                   │
│   - getUserBalance(address)     │
│   - getTotalRaised()            │
│                                 │
│   Events:                       │
│   - InvestmentMade(investor,    │
│       amount)                   │
│   - FundReleased(amount)        │
└─────────────────────────────────┘
            ↓ (calls)
┌─────────────────────────────────┐
│   MilestoneManager.sol          │
│   (Fund Release Logic)          │
│                                 │
│   Manages:                      │
│   - Milestone tracking          │
│   - Conditional fund release    │
│   - Transparency logs           │
│                                 │
│   Functions:                    │
│   - completeMilestone(id)       │
│   - releaseFunds(projectId,     │
│       amount)                   │
│   - getMilestoneStatus(id)      │
│   - getTotalReleased()          │
│                                 │
│   Events:                       │
│   - MilestoneCompleted(id,      │
│       amount)                   │
│   - FundsReleased(amount)       │
└─────────────────────────────────┘
            ↓ (calls)
┌─────────────────────────────────┐
│   InterestCalculator.sol        │
│   (Earnings Distribution)       │
│                                 │
│   Manages:                      │
│   - Interest accrual            │
│   - Monthly/quarterly payouts   │
│   - Claim logic                 │
│                                 │
│   Functions:                    │
│   - calculateInterest(user)     │
│   - claimInterest()             │
│   - distributeMonthlyInterest() │
│   - getAccruedAmount(user)      │
│                                 │
│   Events:                       │
│   - InterestClaimed(user,       │
│       amount)                   │
│   - InterestDistributed(total)  │
└─────────────────────────────────┘
```

---

## 📡 API Architecture

### **API Gateway Pattern**

```
Frontend (React)
        ↓
API Request (HTTP/REST)
        ↓
┌───────────────────────────────────┐
│   API Gateway (Express Router)    │
│   - Route validation              │
│   - Auth middleware               │
│   - Rate limiting                 │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│   Middleware Chain                │
│   ├─ JWT verification             │
│   ├─ KYC check                    │
│   ├─ Role-based access control    │
│   └─ Logging                      │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│   Route Handlers                  │
│   ├─ projectController            │
│   ├─ investmentController         │
│   ├─ userController               │
│   ├─ transparencyController       │
│   └─ milestoneController          │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│   Services (Business Logic)       │
│   ├─ ProjectService              │
│   ├─ InvestmentService           │
│   ├─ InterestService             │
│   ├─ BlockchainService           │
│   └─ Web3Service                 │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│   Data Access Layer (ORM)         │
│   ├─ User.findById()              │
│   ├─ Project.findAll()            │
│   ├─ Investment.create()          │
│   └─ Milestone.update()           │
└───────────────────────────────────┘
        ↓
┌───────────────────────────────────┐
│   Database (PostgreSQL)           │
└───────────────────────────────────┘
```

---

## 🌊 Blockchain Interaction Flow

```
Frontend Action: "Invest in Project"
        ↓
1. User clicks "Invest" button
        ↓
2. Frontend calls Web3Service.connectWallet()
   ├─ Detects MetaMask
   ├─ Requests account access
   └─ Gets user's wallet address
        ↓
3. Backend API: POST /api/investments
   ├─ Creates investment record (status: pending)
   ├─ Generates transaction data
   └─ Returns contract ABI & encoded data
        ↓
4. Frontend: Send Transaction
   ├─ Calls contract.approve() for token spending
   │  └─ User confirms in MetaMask
   │     ├─ Gas fees shown
   │     ├─ Blockchain signs
   │     └─ TX submitted to mempool
   │
   ├─ Polls blockchain for approval confirmation
   │
   └─ Calls contract.investProject(projectId, amount)
      └─ User confirms in MetaMask
         ├─ Contract executes:
         │  ├─ Validates investment amount
         │  ├─ Transfers funds to escrow
         │  ├─ Mints bond tokens to user
         │  └─ Emits InvestmentMade event
         │
         └─ TX submitted to blockchain
                ↓
5. Frontend: Monitor Transaction
   ├─ Polls transaction receipt
   ├─ Shows "Processing..."
   └─ On confirmation:
      ├─ Shows "Success!"
      └─ Calls backend POST /api/investments/confirm
                ↓
6. Backend: Record Investment
   ├─ Verifies TX on blockchain
   ├─ Updates DB: investment.status = "confirmed"
   ├─ Updates project.funds_raised
   ├─ Calculates interest rate
   └─ Returns success
                ↓
7. Frontend: Update UI
   ├─ Refreshes portfolio
   ├─ Shows new holdings
   ├─ Updates total invested
   └─ Shows dashboard updated
```

---

## 🎯 Security Architecture

```
┌──────────────────────────────────────────┐
│   SECURITY LAYERS                        │
├──────────────────────────────────────────┤
│                                          │
│ Layer 1: Frontend Security               │
│ ├─ HTTPS only                            │
│ ├─ Content Security Policy (CSP)         │
│ ├─ XSS protection                        │
│ ├─ CSRF tokens                           │
│ └─ Secure localStorage (JWT tokens)      │
│                                          │
│ Layer 2: Backend Security                │
│ ├─ JWT signature verification            │
│ ├─ Rate limiting (10 req/sec per IP)     │
│ ├─ Input validation & sanitization       │
│ ├─ SQL injection prevention (ORM)        │
│ ├─ CORS policy (whitelist origins)       │
│ └─ Helmet.js headers                     │
│                                          │
│ Layer 3: Smart Contract Security         │
│ ├─ ReentrancyGuard (OpenZeppelin)        │
│ ├─ Pausable (emergency stop)             │
│ ├─ AccessControl (admin only functions)  │
│ ├─ SafeERC20 (correct token handling)    │
│ └─ Check-Effects-Interactions pattern    │
│                                          │
│ Layer 4: Blockchain Security             │
│ ├─ Testnet only (no real value)          │
│ ├─ Multi-sig wallet (admin actions)      │
│ ├─ Audit trail (all TX logged)           │
│ └─ Transparent execution (readable code) │
│                                          │
│ Layer 5: Data Security                   │
│ ├─ Password hashing (bcrypt)             │
│ ├─ Encrypted sensitive fields            │
│ ├─ Database backups                      │
│ ├─ Row-level security                    │
│ └─ Audit logging (immutable logs)        │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📊 Monitoring & Analytics Architecture

```
┌─────────────────────────────────────┐
│   Application Monitoring            │
├─────────────────────────────────────┤
│                                     │
│ Backend Metrics:                    │
│ ├─ API response times               │
│ ├─ Database query performance       │
│ ├─ Error rates (500s, 4xx)          │
│ ├─ Active user connections          │
│ └─ Business metrics:                │
│    ├─ Projects created              │
│    ├─ Investments made              │
│    ├─ Total funds raised            │
│    └─ Interest distributed          │
│                                     │
│ Frontend Metrics:                   │
│ ├─ Page load times                  │
│ ├─ Component render times           │
│ ├─ User interactions (clicks)       │
│ ├─ Error tracking                   │
│ └─ User flow analytics              │
│                                     │
│ Blockchain Metrics:                 │
│ ├─ Contract interactions            │
│ ├─ Transaction success rate         │
│ ├─ Gas consumption                  │
│ ├─ Event emissions                  │
│ └─ Wallet activity                  │
│                                     │
│ Tools:                              │
│ ├─ Winston (logging)                │
│ ├─ Prometheus (metrics)             │
│ ├─ Grafana (dashboards)             │
│ ├─ Sentry (error tracking)          │
│ └─ Mixpanel (user analytics)        │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔍 Audit & Compliance Architecture

```
┌─────────────────────────────────────┐
│   AUDIT TRAIL SYSTEM                │
├─────────────────────────────────────┤
│                                     │
│ Every User Action Logged:           │
│ ├─ User ID                          │
│ ├─ Action type                      │
│ ├─ Timestamp (UTC)                  │
│ ├─ IP address                       │
│ ├─ Changes (before → after)         │
│ ├─ Status (success / failure)       │
│ └─ Reason (if failed)               │
│                                     │
│ Every Blockchain TX Indexed:        │
│ ├─ TX hash                          │
│ ├─ Function called                  │
│ ├─ Parameters                       │
│ ├─ Sender wallet                    │
│ ├─ Amount transferred               │
│ └─ Block number                     │
│                                     │
│ Regulatory Reports:                 │
│ ├─ Fund flow reports                │
│ ├─ Investor reports                 │
│ ├─ Compliance reports               │
│ ├─ KYC/AML status                   │
│ └─ Tax documentation                │
│                                     │
│ Transparency Dashboard:             │
│ ├─ Total funds raised               │
│ ├─ Funds released (with dates)      │
│ ├─ Fund utilization                 │
│ ├─ Active projects                  │
│ ├─ Total investors                  │
│ └─ Compliance status                │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture (Hackathon)

```
DEVELOPMENT
    ↓
├─ Local Hardhat node (contract testing)
├─ Local PostgreSQL (data)
├─ Local backend (Node.js with nodemon)
└─ Local frontend (React dev server)

STAGING
    ↓
├─ Polygon Mumbai testnet (smart contracts)
├─ Cloud PostgreSQL (RDS)
├─ Backend: Heroku/Render (Node.js)
├─ Frontend: Vercel (Next.js)
└─ GitHub Actions (CI/CD pipeline)

DEMO ENVIRONMENT
    ↓
├─ Live Polygon Mumbai
├─ Live Database
├─ Live APIs
├─ Live Frontend
└─ Demo script with pre-loaded data
```

---

## ✅ Completion Checklist for Phase 1

- [ ] All diagrams reviewed and approved
- [ ] Tech stack confirmed with team
- [ ] Database schema normalized
- [ ] API endpoints documented
- [ ] Smart contract interfaces defined
- [ ] Security requirements listed
- [ ] Deployment strategy agreed
- [ ] Development environment setup instructions ready
- [ ] GitHub repo created with folder structure
- [ ] Team roles assigned
- [ ] Timeline confirmed
- [ ] Success metrics defined

---

**Next Phase:** Phase 2 - Smart Contract Development
**Estimated Duration:** 4-5 hours
**Dependencies:** None (can start immediately)

---

Created: January 30, 2026
Status: Complete ✅
