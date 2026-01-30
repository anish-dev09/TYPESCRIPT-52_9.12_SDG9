# INFRACHAIN Setup Instructions
## Quick Start Guide for Development

---

## ✅ Phase 1 Complete - Repository Structure Created!

All folders and configuration files are now in place. Follow these steps to start development.

---

## 📋 Prerequisites

Before starting, install:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Step-by-Step Setup

### 1. Smart Contracts Setup

```powershell
# Navigate to contracts folder
cd contracts

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and add your wallet private key
# Get free testnet MATIC from: https://faucet.polygon.technology/

# Compile contracts (after Phase 2 implementation)
npm run compile

# Run tests (after Phase 2 implementation)
npm test

# Deploy to Mumbai testnet (after Phase 2 implementation)
npm run deploy:mumbai
```

### 2. Backend Setup

```powershell
# Navigate to backend folder
cd ..\backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your database credentials

# Create PostgreSQL database
# Open psql or pgAdmin and run:
# CREATE DATABASE infrachain_dev;

# Run migrations (after Phase 4 implementation)
npm run migrate

# Seed database with demo data (after Phase 4 implementation)
npm run seed

# Start development server
npm run dev

# Server should be running on http://localhost:5000
# Test with: curl http://localhost:5000/health
```

### 3. Frontend Setup

```powershell
# Navigate to frontend folder
cd ..\frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env.local

# Edit .env.local with your contract addresses (after deployment)

# Start development server
npm run dev

# Frontend should be running on http://localhost:3000
```

---

## 🧪 Test Your Setup

### Test Backend
```powershell
# From backend folder
curl http://localhost:5000/health

# Should return:
# {"status":"OK","message":"INFRACHAIN API is running","timestamp":"..."}
```

### Test Frontend
```
1. Open browser: http://localhost:3000
2. You should see the INFRACHAIN landing page
3. No errors in browser console
```

### Test Blockchain Connection (After Phase 2)
```powershell
# From contracts folder
npx hardhat node

# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

---

## 📁 What's Been Created

```
INFRACHAIN-SDG9/
├── contracts/              ✅ Hardhat project configured
│   ├── package.json        ✅ Dependencies defined
│   ├── hardhat.config.js   ✅ Networks configured (Mumbai, Sepolia)
│   ├── .env.example        ✅ Environment template
│   ├── scripts/            ✅ Ready for deploy scripts
│   └── test/               ✅ Ready for tests
│
├── backend/                ✅ Express API configured
│   ├── package.json        ✅ Dependencies defined
│   ├── src/
│   │   ├── app.js          ✅ Server running with health check
│   │   ├── controllers/    ✅ Ready for API logic
│   │   ├── models/         ✅ Ready for database models
│   │   ├── routes/         ✅ Ready for API routes
│   │   ├── services/       ✅ Ready for business logic
│   │   └── middleware/     ✅ Ready for auth/validation
│   ├── migrations/         ✅ Ready for DB migrations
│   ├── seeders/            ✅ Ready for demo data
│   └── .env.example        ✅ Environment template
│
├── frontend/               ✅ Next.js app configured
│   ├── package.json        ✅ Dependencies defined
│   ├── next.config.js      ✅ Next.js configured
│   ├── tsconfig.json       ✅ TypeScript configured
│   ├── tailwind.config.js  ✅ Tailwind CSS configured
│   ├── pages/
│   │   ├── _app.tsx        ✅ App wrapper with Toaster
│   │   └── index.tsx       ✅ Landing page with demo content
│   ├── components/         ✅ Ready for UI components
│   ├── services/           ✅ Ready for API/Web3 services
│   ├── store/              ✅ Ready for state management
│   ├── styles/
│   │   └── globals.css     ✅ Tailwind imports
│   └── .env.example        ✅ Environment template
│
└── docs/                   ✅ All planning docs exist
    ├── 00-MASTER-PLAN.md
    ├── PHASE-1-ARCHITECTURE.md
    └── QUICK-START.md
```

---

## 🎯 What's Next?

### Ready for Phase 2: Smart Contracts
When you say **"START PHASE 2"**, I will:
1. Implement `InfrastructureBond.sol` (ERC-20 token)
2. Implement `BondIssuance.sol` (investment logic)
3. Implement `MilestoneManager.sol` (fund release)
4. Implement `InterestCalculator.sol` (earnings)
5. Write Hardhat tests
6. Create deployment scripts

### Development Workflow
```
Phase 1 ✅ COMPLETE → Phase 2 (Smart Contracts)
   ↓
Phase 3 (Backend APIs) → Phase 4 (Database)
   ↓
Phase 5 (Auth) → Phase 6 (Frontend Setup)
   ↓
Phase 7 (UI Components) → Phase 8 (Integration)
   ↓
Phase 9 (Transparency) → Phase 10 (Demo & Testing)
```

---

## 🔧 Useful Commands

### Contracts
```powershell
npm run compile      # Compile Solidity contracts
npm test            # Run contract tests
npm run deploy:mumbai # Deploy to testnet
npx hardhat node    # Start local blockchain
```

### Backend
```powershell
npm run dev         # Start with auto-reload
npm run migrate     # Run database migrations
npm run seed        # Load demo data
npm test           # Run API tests
```

### Frontend
```powershell
npm run dev         # Start dev server
npm run build       # Build for production
npm run lint        # Check code quality
npm run type-check  # Check TypeScript
```

---

## ❓ Common Issues

**Issue:** `npm install` fails
- **Fix:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Issue:** Database connection error
- **Fix:** Ensure PostgreSQL is running and credentials in `.env` are correct

**Issue:** MetaMask not connecting
- **Fix:** Ensure you're on Mumbai testnet (Chain ID: 80001)

**Issue:** Port already in use
- **Fix:** Kill the process: `npx kill-port 3000` or `npx kill-port 5000`

---

## 📞 Get Help

- Review: `PHASE-1-ARCHITECTURE.md` for system design
- Review: `00-MASTER-PLAN.md` for overall roadmap
- Check: `.env.example` files for configuration templates

---

## ✅ Verification Checklist

Before moving to Phase 2, verify:

- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] All three `package.json` files exist
- [ ] All `.env.example` files copied to `.env`
- [ ] Backend starts without errors (`npm run dev` in backend/)
- [ ] Frontend starts and shows landing page (`npm run dev` in frontend/)
- [ ] All folders created correctly

---

**Status:** 🟢 Phase 1 Repository Setup COMPLETE!

**Next Command:** Type **"START PHASE 2"** to begin smart contract development.
