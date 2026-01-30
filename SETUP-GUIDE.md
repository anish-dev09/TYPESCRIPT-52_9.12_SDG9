# INFRACHAIN Phase 3 Setup Guide

Complete step-by-step guide to set up PostgreSQL, run migrations, deploy contracts, and test the API.

---

## Step 1: Install PostgreSQL (Windows)

### Option A: Using Installer (Recommended)
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (latest version, currently 16.x)
3. During installation:
   - Port: **5432** (default)
   - Password: **Set a strong password** (remember it!)
   - Locale: Default
4. Add PostgreSQL to PATH (installer usually does this)

### Option B: Using Chocolatey
```powershell
choco install postgresql
```

### Verify Installation
```powershell
psql --version
# Should show: psql (PostgreSQL) 16.x
```

---

## Step 2: Create Database

### Method 1: Using psql Command Line
```powershell
# Open PowerShell and connect to PostgreSQL
psql -U postgres

# Inside psql prompt:
CREATE DATABASE infrachain_dev;
CREATE DATABASE infrachain_test;

# Verify databases created
\l

# Exit psql
\q
```

### Method 2: Using pgAdmin (GUI)
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to PostgreSQL server (use password you set)
3. Right-click "Databases" → Create → Database
4. Name: `infrachain_dev`
5. Click Save
6. Repeat for `infrachain_test`

### Method 3: Using PowerShell (One-liner)
```powershell
# Run this from PowerShell
psql -U postgres -c "CREATE DATABASE infrachain_dev;"
psql -U postgres -c "CREATE DATABASE infrachain_test;"
```

---

## Step 3: Update Backend .env File

Update `backend/.env` with your PostgreSQL password:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infrachain_dev
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE  # ← Change this!
DB_DIALECT=postgres
```

---

## Step 4: Install Sequelize CLI

```powershell
cd backend
npm install --save-dev sequelize-cli
```

---

## Step 5: Create Sequelize Config File

The migrations need a config file at the root level:

```powershell
# From backend directory
New-Item -Path ".sequelizerc" -ItemType File -Force
```

Add this content to `backend/.sequelizerc`:
```javascript
const path = require('path');

module.exports = {
  'config': path.resolve('src', 'config', 'database.js'),
  'models-path': path.resolve('src', 'models'),
  'migrations-path': path.resolve('src', 'migrations'),
  'seeders-path': path.resolve('src', 'seeders')
};
```

---

## Step 6: Run Database Migrations

```powershell
# Make sure you're in the backend directory
cd backend

# Run all migrations
npx sequelize-cli db:migrate

# If successful, you should see:
# ✓ 001-create-users.js migrated
# ✓ 002-create-projects.js migrated
# ✓ 003-create-investments.js migrated
# ✓ 004-create-milestones.js migrated
# ✓ 005-create-interests.js migrated
# ✓ 006-create-transactions.js migrated
# ✓ 007-create-notifications.js migrated
```

### Verify Tables Created
```powershell
psql -U postgres -d infrachain_dev -c "\dt"
# Should show all 7 tables + SequelizeMeta table
```

### If Migration Fails - Rollback and Retry
```powershell
# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all

# Then run migrations again
npx sequelize-cli db:migrate
```

---

## Step 7: Get Polygon Mumbai Testnet Setup

### 7.1 Get Mumbai MATIC (Test Tokens)

1. Go to Polygon Faucet: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Enter your wallet address
4. Click "Submit" - you'll receive 0.5 MATIC

**Alternative Faucets:**
- https://mumbaifaucet.com/
- https://faucet.quicknode.com/polygon/mumbai

### 7.2 Add Mumbai to MetaMask

Network Details:
- **Network Name:** Polygon Mumbai Testnet
- **RPC URL:** https://rpc-mumbai.maticvigil.com
- **Chain ID:** 80001
- **Currency Symbol:** MATIC
- **Block Explorer:** https://mumbai.polygonscan.com/

### 7.3 Get Alchemy API Key (Optional but Recommended)

1. Sign up at: https://www.alchemy.com/
2. Create new app:
   - Name: INFRACHAIN
   - Chain: Polygon
   - Network: Mumbai (Testnet)
3. Copy API Key
4. Use RPC URL: `https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY`

---

## Step 8: Deploy Smart Contracts to Mumbai

### 8.1 Update Hardhat Config

Update `contracts/hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001,
      gasPrice: 20000000000, // 20 gwei
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || ""
    }
  }
};
```

### 8.2 Update Contracts .env File

Create/update `contracts/.env`:

```env
# Your wallet private key (DO NOT SHARE!)
PRIVATE_KEY=your_metamask_private_key_here

# Polygon Mumbai RPC
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com

# Or use Alchemy (faster, more reliable)
# POLYGON_MUMBAI_RPC=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY

# PolygonScan API Key (for verification - optional)
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**How to Get Your Private Key from MetaMask:**
1. Open MetaMask
2. Click three dots → Account Details
3. Click "Export Private Key"
4. Enter password
5. Copy private key (starts with 0x...)
6. ⚠️ **NEVER share or commit this to Git!**

### 8.3 Deploy Contracts

```powershell
# Navigate to contracts directory
cd contracts

# Compile contracts first
npx hardhat compile

# Deploy to Mumbai
npx hardhat run scripts/deploy.js --network mumbai

# Expected output:
# Deploying InfrastructureBond...
# InfrastructureBond deployed to: 0xABC123...
# Deploying BondIssuance...
# BondIssuance deployed to: 0xDEF456...
# Deploying MilestoneManager...
# MilestoneManager deployed to: 0xGHI789...
# Deploying InterestCalculator...
# InterestCalculator deployed to: 0xJKL012...
```

### 8.4 Save Contract Addresses

**Copy the deployed addresses!** You'll need them for the next step.

---

## Step 9: Update Backend .env with Contract Addresses

Update `backend/.env`:

```env
# Smart Contract Addresses (from deployment)
BOND_TOKEN_ADDRESS=0xYOUR_INFRASTRUCTURE_BOND_ADDRESS
INFRASTRUCTURE_BOND_ADDRESS=0xYOUR_INFRASTRUCTURE_BOND_ADDRESS
BOND_ISSUANCE_ADDRESS=0xYOUR_BOND_ISSUANCE_ADDRESS
MILESTONE_MANAGER_ADDRESS=0xYOUR_MILESTONE_MANAGER_ADDRESS
INTEREST_CALCULATOR_ADDRESS=0xYOUR_INTEREST_CALCULATOR_ADDRESS

# Update RPC URL to match contracts deployment
BLOCKCHAIN_RPC_URL=https://rpc-mumbai.maticvigil.com
# Or use Alchemy:
# BLOCKCHAIN_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR-API-KEY
```

---

## Step 10: Test Backend API

### 10.1 Start Backend Server

```powershell
# From backend directory
cd backend
npm run dev

# Expected output:
# ✅ Database connected
# ✅ Database models synchronized
# ✅ Blockchain event listeners started
# 🚀 ========================================
#    INFRACHAIN Backend Server Running
# ========================================
# 📡 Port: 5000
# 🌍 Environment: development
# 🗄️  Database: Connected
# ⛓️  Blockchain: https://rpc-mumbai.maticvigil.com
# ========================================
```

### 10.2 Test Health Endpoint

**Using PowerShell:**
```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:5000/health | Select-Object -ExpandProperty Content

# Expected response:
# {"status":"OK","message":"INFRACHAIN API is running","timestamp":"2026-01-30T...","database":"connected","blockchain":"connected"}
```

**Using curl (if installed):**
```powershell
curl http://localhost:5000/health
```

**Using Browser:**
Open: http://localhost:5000/health

### 10.3 Test All Endpoints

#### Test Authentication

**Get Nonce:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/nonce?walletAddress=0xYourWalletAddress" | Select-Object -ExpandProperty Content
```

#### Test Projects

**Get All Projects:**
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/projects | Select-Object -ExpandProperty Content
```

#### Test Blockchain Integration

**Get Token Balance:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/blockchain/balance/0xYourWalletAddress" | Select-Object -ExpandProperty Content
```

**Get Current Block:**
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/blockchain/block | Select-Object -ExpandProperty Content
```

---

## Step 11: Create Test Data (Optional)

### 11.1 Create a Test User

Use Postman or curl:

```powershell
# First, get nonce
$walletAddress = "0xYourWalletAddress"
$nonce = (Invoke-WebRequest -Uri "http://localhost:5000/api/auth/nonce?walletAddress=$walletAddress" | ConvertFrom-Json).nonce

# Then sign message with MetaMask and send to /api/auth/login
# This requires MetaMask signature - easier with Postman/Frontend
```

### 11.2 Install Postman for API Testing

1. Download: https://www.postman.com/downloads/
2. Import INFRACHAIN endpoints
3. Test authentication flow with MetaMask signatures

---

## Troubleshooting

### Database Connection Issues

**Error:** "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL service not running
- Fix: Open Services (services.msc) → Start "postgresql-x64-16"

**Error:** "password authentication failed"
- Wrong password in .env
- Fix: Update `DB_PASSWORD` in backend/.env

**Error:** "database 'infrachain_dev' does not exist"
- Database not created
- Fix: Run `psql -U postgres -c "CREATE DATABASE infrachain_dev;"`

### Migration Issues

**Error:** "SequelizeConnectionError"
- Database not running or wrong credentials
- Fix: Check PostgreSQL service and .env file

**Error:** "relation already exists"
- Tables already created
- Fix: Drop database and recreate, or use `db:migrate:undo:all`

### Contract Deployment Issues

**Error:** "insufficient funds"
- Not enough MATIC in wallet
- Fix: Get more from faucet

**Error:** "nonce too low"
- Transaction conflict
- Fix: Reset account in MetaMask (Settings → Advanced → Reset Account)

**Error:** "Invalid JSON RPC"
- Wrong RPC URL or network issue
- Fix: Try alternative RPC URL or Alchemy

### API Server Issues

**Error:** "Cannot find module '../contracts/InfrastructureBond.json'"
- Contract ABIs not copied
- Fix: Re-run the copy commands from Phase 3 setup

**Error:** "Missing required environment variable"
- .env not configured properly
- Fix: Double-check all required variables in backend/.env

---

## Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `infrachain_dev` created
- [ ] All 7 migrations completed successfully
- [ ] Tables visible in database (8 tables including SequelizeMeta)
- [ ] Mumbai MATIC obtained (check balance in MetaMask)
- [ ] Smart contracts deployed to Mumbai
- [ ] All 4 contract addresses copied
- [ ] Backend .env updated with contract addresses
- [ ] Backend server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Can fetch projects from API
- [ ] Can query blockchain data

---

## Quick Commands Reference

```powershell
# Database
psql -U postgres -c "CREATE DATABASE infrachain_dev;"
psql -U postgres -d infrachain_dev -c "\dt"

# Migrations
cd backend
npx sequelize-cli db:migrate
npx sequelize-cli db:migrate:undo:all

# Contracts
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai

# Backend
cd backend
npm run dev

# Testing
Invoke-WebRequest -Uri http://localhost:5000/health
Invoke-WebRequest -Uri http://localhost:5000/api/projects
```

---

## Next Steps After Setup

1. **Create Seed Data** - Add sample projects and users
2. **Test Investment Flow** - Record test investments
3. **Test Milestone Flow** - Create and complete milestones
4. **Frontend Integration** - Connect Next.js frontend (Phase 4-5)
5. **Deploy to Production** - Once testing is complete

---

## Support Resources

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Sequelize Docs:** https://sequelize.org/docs/v6/
- **Hardhat Docs:** https://hardhat.org/docs
- **Polygon Mumbai:** https://mumbai.polygonscan.com/
- **Ethers.js Docs:** https://docs.ethers.org/v6/

---

**Setup Complete!** Your backend should now be fully operational with database, blockchain integration, and API endpoints. 🎉
