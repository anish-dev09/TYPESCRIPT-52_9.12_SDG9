# INFRACHAIN-SDG9: Quick Start Reference Guide
## For Hackathon Teams - Get Building Fast

---

## 🚀 QUICK START (First 30 Minutes)

### 1. Setup Development Environment

```bash
# Create project directories
mkdir infrachain-mvp && cd infrachain-mvp
mkdir smart-contracts backend frontend

# Clone dependencies
git clone https://github.com/infrachain/infrachain-mvp.git .

# Install all dependencies
cd smart-contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### 2. Deploy Smart Contracts (5 minutes)

```bash
cd smart-contracts

# Configure .env
echo "MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com" > .env
echo "PRIVATE_KEY=your_private_key" >> .env
echo "ESCROW_WALLET=0x..." >> .env

# Deploy
npx hardhat run scripts/deploy.js --network mumbai

# Save addresses (copy from output)
# Keep for frontend config
```

### 3. Start Backend (5 minutes)

```bash
cd backend

# Configure .env
cp .env.example .env
# Edit: DATABASE_URL, BLOCKCHAIN_RPC, CONTRACT_ADDRESSES

# Create database
npx sequelize db:create

# Run migrations
npx sequelize db:migrate

# Seed demo data
npx sequelize db:seed:all

# Start server
npm run dev
# Server runs on http://localhost:5000
```

### 4. Start Frontend (5 minutes)

```bash
cd frontend

# Configure .env
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
echo "NEXT_PUBLIC_CONTRACT_ADDRESS=0x..." >> .env.local
echo "NEXT_PUBLIC_NETWORK=mumbai" >> .env.local

# Start dev server
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. Login & Demo (15 minutes)

```
Open http://localhost:3000 in browser

1. Click "Sign Up"
   Email: demo@infrachain.local
   Password: Demo123!@#
   Name: Demo User

2. Click "Connect Wallet"
   - Opens MetaMask
   - Switch to Polygon Mumbai testnet
   - Approve connection

3. Go to Projects
   - See 15 demo projects
   - Click any project → "Invest Now"

4. Invest
   - Amount: 10 (₹1,000)
   - Approve in MetaMask
   - See transaction on blockchain!

5. Check Dashboard
   - See holdings updated
   - See interest accruing
   - View transparency data
```

---

## 📁 FILE STRUCTURE AT A GLANCE

### Smart Contracts
```
smart-contracts/
├── contracts/
│   ├── InfrastructureBond.sol      ✅ Main token
│   ├── BondIssuance.sol            ✅ Investment handling
│   ├── MilestoneManager.sol        ✅ Fund release logic
│   └── InterestCalculator.sol      ✅ Interest accrual
├── test/
│   └── integration.test.js         ✅ All tests
├── scripts/
│   └── deploy.js                   ✅ Deployment
└── hardhat.config.js
```

### Backend API
```
backend/
├── src/
│   ├── models/                     ✅ DB models
│   ├── controllers/                ✅ Route handlers
│   ├── services/                   ✅ Business logic
│   ├── routes/                     ✅ API endpoints
│   └── app.js                      ✅ Express setup
├── database/
│   └── seeders/                    ✅ Demo data
└── server.js
```

### Frontend
```
frontend/
├── pages/
│   ├── index.tsx                   ✅ Home
│   ├── dashboard.tsx               ✅ Portfolio
│   ├── projects/                   ✅ Listing & detail
│   ├── transparency/               ✅ Tracking
│   └── auth/                       ✅ Login/signup
├── components/
│   ├── projects/                   ✅ Project UI
│   ├── portfolio/                  ✅ Dashboard UI
│   ├── investment/                 ✅ Buy flow
│   └── common/                     ✅ Shared components
├── services/
│   ├── api/                        ✅ Backend calls
│   └── web3/                       ✅ Blockchain calls
└── store/                          ✅ Redux state
```

---

## 🔌 KEY API ENDPOINTS (Backend)

### Auth
```
POST   /api/auth/signup              - Register user
POST   /api/auth/login               - Login
POST   /api/auth/wallet-connect      - Connect MetaMask
GET    /api/auth/kyc-status          - Check KYC
```

### Projects
```
GET    /api/projects                 - List all (paginated)
GET    /api/projects/:id             - Get one
POST   /api/projects                 - Create (admin)
```

### Investments
```
POST   /api/investments/purchase     - Record investment
GET    /api/investments/history      - Get user's investments
GET    /api/investments/portfolio    - Get complete portfolio
```

### Interest
```
GET    /api/users/interest/accrual   - Get accrued amount
POST   /api/users/interest/claim     - Claim as tokens
```

### Transparency
```
GET    /api/transparency/overview    - Global stats
GET    /api/transparency/projects/:id - Fund tracking
GET    /api/transparency/audit-log   - Full audit trail
```

---

## 📊 SMART CONTRACT KEY FUNCTIONS

### InfrastructureBond (ERC-20 Token)
```solidity
mint(address to, uint256 amount)      // Mint tokens
burn(uint256 amount)                  // Burn tokens
lockFunds()                           // Lock for escrow
unlockFunds()                         // Release from escrow
calculateInterest(address, uint256)   // Calculate earnings
```

### BondIssuance
```solidity
createProject(...)                    // Create bond offering
investInProject(uint256, uint256)     // User invests
getProjectProgress(uint256)           // Get % funded
releaseFundsForMilestone(...)         // Release on milestone
```

### MilestoneManager
```solidity
createMilestone(...)                  // Create milestone
completeMilestone(...)                // Mark complete
getProjectMilestones(uint256)         // Get all milestones
getCompletionPercentage(uint256)      // Get % complete
```

### InterestCalculator
```solidity
calculateAccruedInterest(...)         // Calculate interest
claimInterest(uint256)                // User claims
getAccruedInterest(...)               // Get unclaimed amount
```

---

## 🧪 TESTING COMMANDS

```bash
# Smart Contracts
cd smart-contracts
npm run test                          # Run all tests
npm run test:coverage                 # Coverage report
npm run hardhat:node                  # Local testnet

# Backend
cd backend
npm run test                          # Jest tests
npm run test:coverage                 # Coverage
npm run test:integration              # Integration tests

# Frontend
cd frontend
npm run test                          # React tests
npm run test:coverage                 # Coverage
npm run build                         # Production build
```

---

## 🔒 Security Quick Checks

✅ **Smart Contracts:**
- Uses OpenZeppelin's AccessControl
- ReentrancyGuard on sensitive functions
- Pausable for emergency stops
- No direct value transfers (ERC-20 only)

✅ **Backend:**
- JWT authentication
- Input validation on all endpoints
- Rate limiting: 10 req/sec per IP
- SQL injection prevention (ORM)
- CORS whitelist configured

✅ **Frontend:**
- No private keys in code
- HTTPS only
- MetaMask integration (user controls keys)
- No localStorage of sensitive data

---

## 🐛 COMMON ISSUES & FIXES

### "Contract not found" error
```
→ Check .env has correct contract addresses
→ Verify contracts deployed to correct network
→ Run: npx hardhat verify --network mumbai <ADDRESS>
```

### "Insufficient balance" error
```
→ Make sure test account has testnet tokens
→ Get free MATIC from: https://faucet.polygon.technology/
→ Request test USDC from admin endpoint
```

### "Wallet not connected" error
```
→ Click "Connect Wallet" button
→ Check MetaMask is on Polygon Mumbai network
→ Approve connection in MetaMask popup
```

### "Database connection failed"
```
→ Check PostgreSQL is running
→ Verify DATABASE_URL in .env
→ Run: npx sequelize db:create
```

### "Port already in use"
```
→ Change port in .env
→ Or kill process: lsof -i :5000 | kill -9 <PID>
```

---

## 📊 DEMO DATA CHEAT SHEET

### Test Users
```
Admin:
  Email: admin@demo.local
  Pass:  Admin123!@#
  Wallet: Already setup

Investor1:
  Email: investor1@demo.local
  Pass:  Investor123!@#
  Wallet: 0x8ba1f109551bd432803012645ac136ddd64dba72

Investor2:
  Email: investor2@demo.local
  Pass:  Investor123!@#
  Wallet: 0x3cd751e6b0078be393132286c08f8546e19a4e37
```

### Demo Projects (Pre-loaded)
```
1. Delhi-Bangalore Highway    - ₹500Cr, 6.5%, Medium Risk
2. Smart City 5G Network      - ₹1000Cr, 7%, Medium Risk
3. Solar Power Plant          - ₹200Cr, 5.5%, Low Risk
4. Bangalore Metro Phase 2    - ₹750Cr, 6.8%, Medium Risk
5. Water Treatment Plant      - ₹300Cr, 6%, Medium Risk
... 10 more projects
```

### Quick Demo Flow
```
1. Login as investor1
2. View projects → Click "Highway"
3. Click "Invest Now"
4. Enter 10 tokens (₹1000)
5. Approve in MetaMask
6. Wait 30 seconds for confirmation
7. Go to Dashboard
8. See portfolio updated
9. See interest accruing
10. Click "Transparency" to see milestones
```

---

## 🎯 PRIORITY FEATURES FOR MVP

**Must Have:**
- ✅ User authentication
- ✅ Project listing
- ✅ Token investment (blockchain)
- ✅ Portfolio tracking
- ✅ Interest accrual & calculation
- ✅ Milestone/fund release logic
- ✅ Transparency dashboard

**Nice to Have:**
- 🔲 Secondary market (token transfer)
- 🔲 Advanced analytics
- 🔲 Mobile app
- 🔲 DAO governance
- 🔲 Real KYC integration

**Out of Scope (Production):**
- ❌ Real money handling
- ❌ Regulatory compliance
- ❌ Real legal framework
- ❌ Insurance products

---

## 📞 TECH SUPPORT QUICK REFS

### Testnet Faucets
- Polygon Mumbai MATIC: https://faucet.polygon.technology/
- Sepolia ETH: https://sepoliafaucet.com/

### Blockchain Explorers
- Mumbai: https://mumbai.polygonscan.com/
- Sepolia: https://sepolia.etherscan.io/

### Documentation
- Polygon Docs: https://docs.polygon.technology/
- Solidity: https://docs.soliditylang.org/
- Ethers.js: https://docs.ethers.org/
- React: https://react.dev/

### Communities
- Polygon Discord: https://discord.gg/polygon
- Ethereum Dev Forum: https://ethereum-magicians.org/
- Hardhat Docs: https://hardhat.org/docs/

---

## ⏱️ TYPICAL HACKATHON TIMELINE

### Day 1 (8 hours)
- ✅ Setup all 3 repos (30 min)
- ✅ Deploy smart contracts (1 hour)
- ✅ Create backend models & APIs (3 hours)
- ✅ Seed demo data (30 min)
- ✅ Basic frontend layout (3 hours)

### Day 2 (8 hours)
- ✅ Frontend components (4 hours)
- ✅ Web3.js integration (2 hours)
- ✅ Bug fixes & testing (2 hours)

### Day 3 (6 hours)
- ✅ Final polish & styling (2 hours)
- ✅ Demo prep & practice (2 hours)
- ✅ Documentation & presentation (2 hours)

**Total: ~24-30 hours for team of 3**

---

## 🏆 JUDGE IMPRESSION CHECKLIST

Quick things judges notice:
- ✅ Live demo works without crashes
- ✅ UI is clean and professional
- ✅ Problem statement is clear
- ✅ Solution actually solves the problem
- ✅ Team can explain the technical choices
- ✅ Code is on GitHub and public
- ✅ Presentation is compelling
- ✅ Real-world impact is evident

---

## 📝 FINAL SUBMISSION CHECKLIST

```
Repository:
  [ ] GitHub repo public
  [ ] README with setup instructions
  [ ] All source code pushed
  [ ] .env.example provided (no secrets)
  [ ] License file included

Documentation:
  [ ] Architecture diagram provided
  [ ] API documentation complete
  [ ] Smart contract comments thorough
  [ ] Deployment guide included

Demo:
  [ ] Demo runs without manual fixes
  [ ] Pre-loaded data works
  [ ] Blockchain explorer links valid
  [ ] Transaction hashes accessible

Presentation:
  [ ] Slide deck ready
  [ ] Demo script practiced
  [ ] 5-7 min pitch prepared
  [ ] Q&A prep done
  [ ] Team bios ready

Code Quality:
  [ ] No console errors
  [ ] No hardcoded secrets
  [ ] Dependencies listed
  [ ] Tests passing
  [ ] Code formatted consistently
```

---

## 🎉 YOU'RE READY TO BUILD!

This MVP is designed to be:
- **Fast**: Build in 24-40 hours
- **Complete**: Full feature set demonstrated
- **Real**: Actually uses blockchain
- **Impressive**: Shows serious potential
- **Scalable**: Architecture allows growth

Remember: The goal is to **impress judges** with a **working proof of concept** that solves a **real problem** in an **innovative way**.

Focus on:
1. Working features (not perfect code)
2. Clear problem statement
3. Real blockchain integration
4. Compelling demo
5. Professional presentation

**Let's build infrastructure's future! 🚀**

---

Created: January 30, 2026
Last Updated: January 30, 2026
Status: Ready for Launch ✅
