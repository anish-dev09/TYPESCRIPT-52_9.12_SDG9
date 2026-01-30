# INFRACHAIN - Installation & Testing Guide
## Manual Setup Due to Network Issues

---

## ⚠️ Network Issue Detected

Your npm installation is experiencing network connectivity issues (ECONNRESET). This is common and can be fixed.

---

## 🔧 Fix Network Issues First

### Option 1: Change npm Registry (Recommended)
```powershell
# Try using a different npm registry
npm config set registry https://registry.npmjs.org/

# Or try with increased timeout
npm config set fetch-timeout 60000
npm config set fetch-retries 5
```

### Option 2: Check Your Internet Connection
- Ensure you have stable internet
- Disable VPN if active
- Check firewall/antivirus settings

### Option 3: Use Yarn Instead (Alternative)
```powershell
# Install yarn globally
npm install -g yarn

# Then use yarn instead of npm
yarn install
```

---

## 📦 Step-by-Step Installation

### 1. Contracts Folder
```powershell
cd c:\Users\PC-ASUS\Documents\INFRACHAIN-SDG9\contracts

# Try one of these:
npm install --legacy-peer-deps
# OR
yarn install
# OR
npm install --registry https://registry.npmmirror.com
```

**Expected Result:** `node_modules` folder created with ~500MB of packages

### 2. Backend Folder
```powershell
cd ..\backend

# Install dependencies
npm install --legacy-peer-deps
# OR
yarn install
```

**Expected Result:** `node_modules` folder created

### 3. Frontend Folder
```powershell
cd ..\frontend

# Install dependencies
npm install --legacy-peer-deps
# OR
yarn install
```

**Expected Result:** `node_modules` folder created with Next.js packages

---

## ✅ Test Your Setup

### Test 1: Backend Server
```powershell
# Navigate to backend
cd c:\Users\PC-ASUS\Documents\INFRACHAIN-SDG9\backend

# Copy environment file
copy .env.example .env

# Start the server
npm run dev
```

**Expected Output:**
```
🚀 INFRACHAIN Backend running on port 5000
📊 Environment: development
🔗 Health check: http://localhost:5000/health
```

**Test in browser:** Open http://localhost:5000/health
**Should see:** `{"status":"OK","message":"INFRACHAIN API is running","timestamp":"..."}`

### Test 2: Frontend App
```powershell
# In a NEW terminal window
cd c:\Users\PC-ASUS\Documents\INFRACHAIN-SDG9\frontend

# Copy environment file
copy .env.example .env.local

# Start the dev server
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
- wait compiling...
```

**Test in browser:** Open http://localhost:3000
**Should see:** Beautiful INFRACHAIN landing page with:
- "INFRACHAIN" title
- "Tokenized Infrastructure Bonds" subtitle
- 3 feature cards (Fractional Ownership, Transparent Tracking, Earn Returns)

### Test 3: Contracts Setup (Dry Run)
```powershell
cd c:\Users\PC-ASUS\Documents\INFRACHAIN-SDG9\contracts

# Copy environment file
copy .env.example .env

# Check Hardhat is working (after npm install succeeds)
npx hardhat --version
```

**Expected Output:** `2.19.0` or similar

---

## 🐛 Troubleshooting

### Issue: "npm install" keeps failing
**Solutions:**
1. Clear npm cache: `npm cache clean --force`
2. Delete `node_modules` and `package-lock.json`
3. Try: `npm install --legacy-peer-deps --verbose`
4. Switch to yarn: `yarn install`
5. Use different registry: `npm config set registry https://registry.npmmirror.com`

### Issue: Port 5000 or 3000 already in use
**Solution:**
```powershell
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### Issue: "Cannot find module..."
**Solution:** The npm install didn't complete. Retry with `--legacy-peer-deps` flag.

### Issue: Database connection error
**Solution:** We'll set up the database in Phase 4. For now, the backend will run without DB.

---

## 📋 Verification Checklist

Before moving to Phase 2, verify:

- [ ] Network issue resolved (can download packages)
- [ ] Contracts folder: `node_modules` exists (~500MB)
- [ ] Backend folder: `node_modules` exists
- [ ] Frontend folder: `node_modules` exists
- [ ] Backend starts: `npm run dev` works in backend/
- [ ] Frontend starts: `npm run dev` works in frontend/
- [ ] Health check works: http://localhost:5000/health returns JSON
- [ ] Landing page loads: http://localhost:3000 shows INFRACHAIN page

---

## ⏭️ What Happens Next

Once all installations succeed and both servers run:

### Phase 1 Status: ✅ COMPLETE
- Repository structure created
- Configuration files ready
- Both servers can start

### Phase 2: Smart Contracts (Next)
When you type "START PHASE 2", I will create:
1. `InfrastructureBond.sol` - ERC-20 token contract
2. `BondIssuance.sol` - Investment logic
3. `MilestoneManager.sol` - Fund release logic
4. `InterestCalculator.sol` - Earnings distribution
5. Hardhat tests for all contracts
6. Deployment scripts

---

## 💡 Quick Commands Reference

### Start Backend (Terminal 1)
```powershell
cd c:\Users\PC-ASUS\Documents\INFRACHAIN-SDG9\backend
npm run dev
```

### Start Frontend (Terminal 2)
```powershell
cd c:\Users\PC-ASUS\Documents\INFRACHAIN-SDG9\frontend
npm run dev
```

### Test Health Check
```powershell
curl http://localhost:5000/health
```

---

## 🎯 Current Status

**What's Working:**
- ✅ All folders created
- ✅ All config files in place
- ✅ `package.json` files ready
- ✅ Backend `app.js` with health check
- ✅ Frontend landing page
- ✅ Environment templates

**What Needs Network:**
- ⚠️ npm install (retry with fixes above)

**Next Command After Setup:**
```
"The setup is complete and both servers are running. Ready for Phase 2."
```

Then I'll start implementing smart contracts!

---

**Last Updated:** January 30, 2026
**Status:** Phase 1 Complete (pending npm install retry)
