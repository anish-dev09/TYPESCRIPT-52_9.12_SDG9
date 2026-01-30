# INFRACHAIN-SDG9 Testing Guide

## 🧪 Comprehensive Testing Documentation

This guide covers all testing procedures for the INFRACHAIN-SDG9 platform.

---

## 📋 Table of Contents

1. [Smart Contract Tests](#smart-contract-tests)
2. [Backend API Tests](#backend-api-tests)
3. [Frontend Component Tests](#frontend-component-tests)
4. [End-to-End Tests](#end-to-end-tests)
5. [Performance Tests](#performance-tests)
6. [Test Coverage Reports](#test-coverage-reports)

---

## 🔗 Smart Contract Tests

### Setup

```bash
cd blockchain
npm install
```

### Running Tests

```bash
# Run all smart contract tests
npx hardhat test

# Run specific test file
npx hardhat test test/InfrastructureBond.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run with coverage
npx hardhat coverage
```

### Test Coverage

**InfrastructureBond.sol:**
- ✅ Deployment and initialization
- ✅ Token purchase functionality
- ✅ Token transfers (standard and approved)
- ✅ Interest calculation
- ✅ Admin functions (pause, price update, withdraw)
- ✅ Token burning
- ✅ Event emissions
- ✅ Edge cases and error handling

**MilestoneManager.sol:**
- ✅ Milestone creation
- ✅ Milestone completion
- ✅ Fund release mechanisms
- ✅ Role management (project manager, auditor)
- ✅ Query functions (pending, completed milestones)
- ✅ Emergency functions
- ✅ Multiple milestone handling

### Expected Results

```
InfrastructureBond
  Deployment
    ✓ Should set the right owner
    ✓ Should assign the total supply of tokens to the owner
    ✓ Should set the correct token price
    ✓ Should have correct name and symbol

  Token Purchase
    ✓ Should allow users to purchase tokens
    ✓ Should reject purchase with insufficient payment
    ✓ Should reject purchase exceeding available supply
    ✓ Should emit TokensPurchased event
    ✓ Should refund excess payment

  [... 35+ more tests ...]

MilestoneManager
  Deployment
    ✓ Should set the right owner
    ✓ Should set the correct project ID
    ✓ Should initialize with zero milestones

  [... 40+ more tests ...]

Total Tests: 75+
Passing: 75+
Duration: ~15 seconds
```

### Troubleshooting

**Issue: Tests fail with "Contract not found"**
```bash
# Solution: Recompile contracts
npx hardhat clean
npx hardhat compile
npx hardhat test
```

**Issue: Out of gas errors**
```bash
# Solution: Increase gas limit in hardhat.config.js
module.exports = {
  networks: {
    hardhat: {
      gasLimit: 12000000
    }
  }
};
```

---

## 🖥️ Backend API Tests

### Setup

```bash
cd backend
npm install
npm install --save-dev mocha chai supertest
```

### Running Tests

```bash
# Run all API integration tests
npm test

# Run specific test file
npm test -- test/api.integration.test.js

# Run with coverage
npm run test:coverage

# Run with verbose output
npm test -- --reporter spec
```

### Test Coverage

**Authentication API:**
- ✅ User registration
- ✅ User login
- ✅ Wallet connection
- ✅ Invalid credentials handling

**Projects API:**
- ✅ Create project (admin)
- ✅ Get all projects with filters
- ✅ Get single project details
- ✅ Update project status
- ✅ Authorization checks

**Investments API:**
- ✅ Create investment
- ✅ Get user investments
- ✅ Calculate interest earned
- ✅ Validation (minimum amount, project existence)

**Portfolio API:**
- ✅ Get portfolio summary
- ✅ Investment history
- ✅ Diversification insights
- ✅ Returns calculation

**Transparency API:**
- ✅ Platform statistics
- ✅ Fund tracking data
- ✅ Impact metrics
- ✅ Milestone status

**Milestones API:**
- ✅ Create milestone
- ✅ Complete milestone
- ✅ Get project milestones
- ✅ Role-based access control

### Running Tests Against Live Server

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run tests
TEST_MODE=integration npm test
```

### Expected Results

```
INFRACHAIN API Integration Tests
  Authentication API
    ✓ should register a new user (250ms)
    ✓ should login an existing user (180ms)
    ✓ should reject login with invalid credentials (120ms)
    ✓ should connect wallet address (150ms)

  Projects API
    ✓ should create a new project (admin only) (200ms)
    ✓ should get all projects (150ms)
    ✓ should get projects with filters (180ms)
    ✓ should get single project details (120ms)
    ✓ should update project status (admin only) (160ms)
    ✓ should reject project creation without authentication (80ms)

  [... 45+ more tests ...]

Total Tests: 55+
Passing: 55+
Duration: ~8 seconds
```

### Test Database Setup

```bash
# Create test database
createdb infrachain_test

# Run migrations
npm run migrate:test

# Seed test data
npm run seed:test
```

---

## 💻 Frontend Component Tests

### Setup

```bash
cd frontend
npm install
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Running Tests

```bash
# Run all component tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```

### Creating Component Tests

Example test for `ProjectCard.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import ProjectCard from '@/components/ProjectCard';

describe('ProjectCard', () => {
  const mockProject = {
    id: 'proj-001',
    name: 'Mumbai Coastal Road',
    category: 'Transportation',
    totalFunding: 50000000000,
    currentFunding: 35000000000,
    interestRate: 8.5,
    riskLevel: 'medium',
  };

  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Mumbai Coastal Road')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('8.5%')).toBeInTheDocument();
  });

  it('calculates funding progress correctly', () => {
    render(<ProjectCard project={mockProject} />);
    
    // 35000/50000 = 70%
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('displays risk level badge', () => {
    render(<ProjectCard project={mockProject} />);
    
    const badge = screen.getByText('medium');
    expect(badge).toHaveClass('bg-yellow-100');
  });
});
```

### Test Coverage Goals

**Target: 80%+ coverage for critical components**

Priority Components:
- ✅ ProjectCard
- ✅ InvestmentFlow
- ✅ PortfolioWidget
- ✅ FundTracker
- ✅ MilestoneProgressTracker
- ✅ ImpactMetrics
- ✅ InvestorAnalytics

---

## 🔄 End-to-End Tests

### Setup (Playwright)

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

### Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test
npx playwright test tests/e2e/investment-flow.spec.ts

# Debug mode
npx playwright test --debug
```

### E2E Test Scenarios

**Scenario 1: Complete Investment Flow**
```typescript
// tests/e2e/investment-flow.spec.ts
import { test, expect } from '@playwright/test';

test('user can complete full investment flow', async ({ page }) => {
  // Navigate to projects page
  await page.goto('http://localhost:3000/projects');

  // Click on a project
  await page.click('text=Mumbai Coastal Road');

  // Click invest button
  await page.click('text=Invest Now');

  // Enter investment amount
  await page.fill('input[name="amount"]', '50000');

  // Mock wallet connection
  await page.click('text=Connect Wallet');
  await page.waitForSelector('text=Wallet Connected');

  // Confirm purchase
  await page.click('text=Confirm Purchase');

  // Verify success message
  await expect(page.locator('text=Investment Successful')).toBeVisible();

  // Verify dashboard update
  await page.goto('http://localhost:3000/dashboard');
  await expect(page.locator('text=₹50,000')).toBeVisible();
});
```

**Scenario 2: Transparency Dashboard Navigation**
```typescript
test('user can navigate transparency features', async ({ page }) => {
  await page.goto('http://localhost:3000/transparency');

  // Select a project
  await page.selectOption('select[name="project"]', 'proj-001');

  // Verify fund tracker displays
  await expect(page.locator('text=Fund Tracker')).toBeVisible();

  // Verify milestone timeline
  await expect(page.locator('text=Milestone Progress')).toBeVisible();

  // Verify impact metrics
  await expect(page.locator('text=Impact Metrics')).toBeVisible();
});
```

---

## 📊 Performance Tests

### Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run tests/performance/load-test.yml

# Run with custom target
artillery run --target http://your-api.com tests/performance/load-test.yml
```

### Sample Load Test Configuration

```yaml
# tests/performance/load-test.yml
config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Get Projects"
    flow:
      - get:
          url: "/api/projects"

  - name: "Create Investment"
    flow:
      - post:
          url: "/api/investments"
          json:
            projectId: "proj-001"
            amount: 50000
            tokens: 500
```

### Expected Performance Metrics

```
Summary Report:
  Average Response Time: < 200ms
  95th Percentile: < 500ms
  99th Percentile: < 1000ms
  Success Rate: > 99%
  Requests per Second: 100+
```

---

## 📈 Test Coverage Reports

### Generate Coverage Reports

```bash
# Smart Contracts
cd blockchain
npx hardhat coverage
open coverage/index.html

# Backend
cd backend
npm run test:coverage
open coverage/index.html

# Frontend
cd frontend
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Coverage Goals

```
Target Coverage Metrics:
├── Smart Contracts: 90%+
│   ├── Statements: 95%
│   ├── Branches: 90%
│   ├── Functions: 95%
│   └── Lines: 95%
│
├── Backend API: 80%+
│   ├── Routes: 90%
│   ├── Controllers: 85%
│   ├── Services: 80%
│   └── Utilities: 75%
│
└── Frontend: 70%+
    ├── Components: 75%
    ├── Pages: 70%
    ├── Services: 85%
    └── Utilities: 80%
```

---

## 🐛 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  smart-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd blockchain && npm install
      - run: cd blockchain && npx hardhat test

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All smart contract tests passing (75+ tests)
- [ ] All API integration tests passing (55+ tests)
- [ ] Frontend component tests passing
- [ ] E2E tests covering critical paths
- [ ] Performance tests showing acceptable load handling
- [ ] Security audit completed
- [ ] Coverage reports generated and reviewed
- [ ] No critical/high vulnerabilities in dependencies
- [ ] Environment variables configured correctly
- [ ] Database migrations tested

---

## 📞 Support

If tests are failing:
1. Check error messages carefully
2. Verify environment setup (Node version, dependencies)
3. Clear caches: `rm -rf node_modules && npm install`
4. Check for port conflicts
5. Review test database setup

---

**Happy Testing!** 🧪

---

**Document Version:** 1.0  
**Last Updated:** January 31, 2026  
**Maintainer:** INFRACHAIN-SDG9 Team
