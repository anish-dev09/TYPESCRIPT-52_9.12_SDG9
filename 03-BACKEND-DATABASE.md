# PHASE 3-4: Backend API & Database Specification
## Complete Implementation Guide for INFRACHAIN-SDG9

---

## 📋 PHASE 3: Backend API Development (Node.js/Express)

### **Project Structure**

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js         # PostgreSQL connection
│   │   ├── blockchain.js       # Web3 provider config
│   │   └── constants.js        # App constants
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Investment.js
│   │   ├── Milestone.js
│   │   ├── InterestAccrual.js
│   │   └── AuditLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── investmentController.js
│   │   ├── userController.js
│   │   ├── transparencyController.js
│   │   └── milestoneController.js
│   ├── services/
│   │   ├── projectService.js
│   │   ├── investmentService.js
│   │   ├── interestService.js
│   │   ├── blockchainService.js
│   │   ├── authService.js
│   │   └── emailService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── validateInput.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── investments.js
│   │   ├── users.js
│   │   ├── transparency.js
│   │   └── milestones.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   └── app.js              # Express app setup
├── server.js               # Entry point
├── .env                    # Environment variables
├── package.json
├── package-lock.json
└── README.md
```

### **Core Dependencies**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "web3": "^4.0.0",
    "ethers": "^6.10.0",
    "jsonwebtoken": "^9.1.2",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.0",
    "express-rate-limit": "^7.1.5",
    "winston": "^3.11.0",
    "axios": "^1.6.5",
    "moment": "^2.29.4",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

---

## 🌐 API ENDPOINT SPECIFICATION

### **1. AUTHENTICATION ENDPOINTS**

#### **POST /api/auth/signup**
Register a new user

```json
Request:
{
  "email": "investor@example.com",
  "password": "securePassword123!",
  "fullName": "Rajesh Kumar"
}

Response (201):
{
  "success": true,
  "message": "Account created. Please verify your email.",
  "userId": "user-123",
  "kycStatus": "pending"
}
```

#### **POST /api/auth/login**
User login with email/password

```json
Request:
{
  "email": "investor@example.com",
  "password": "securePassword123!"
}

Response (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "investor@example.com",
    "fullName": "Rajesh Kumar",
    "kycStatus": "verified",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42470"
  }
}
```

#### **POST /api/auth/wallet-connect**
Connect MetaMask wallet to account

```json
Request:
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42470",
  "signature": "0x3d5...abc"
}

Response (200):
{
  "success": true,
  "message": "Wallet connected successfully",
  "user": {
    "id": "user-123",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42470"
  }
}
```

#### **POST /api/auth/kyc-submit**
Submit KYC documents for verification (mock)

```json
Request:
{
  "documentType": "aadhar",
  "documentHash": "QmXx...",
  "fullLegalName": "Rajesh Kumar"
}

Response (202):
{
  "success": true,
  "message": "KYC under review",
  "kycStatus": "pending",
  "estimatedTime": "24-48 hours"
}
```

#### **GET /api/auth/kyc-status**
Check KYC verification status

```
Response (200):
{
  "success": true,
  "kycStatus": "verified", // pending | approved | rejected
  "verificationDate": "2026-01-30T10:30:00Z",
  "approvalNote": ""
}
```

---

### **2. PROJECT ENDPOINTS**

#### **GET /api/projects**
List all infrastructure projects

```
Query Params:
- page (default: 1)
- limit (default: 20)
- status (active|completed|delayed)
- riskLevel (low|medium|high)
- sortBy (name|fundingRaised|interestRate|duration)

Response (200):
{
  "success": true,
  "projects": [
    {
      "id": "proj-001",
      "name": "Delhi-Bangalore Highway Expansion",
      "description": "4-lane highway construction...",
      "location": "Delhi-Karnataka",
      "totalFunding": 500000000,
      "fundsRaised": 125000000,
      "fundsReleased": 50000000,
      "interestRate": 650, // 6.5%
      "duration": 60, // months
      "riskLevel": "medium",
      "tokenPrice": 100, // ₹100 per token
      "tokensAvailable": 3750000, // (500Cr - 125Cr) / 100
      "investors": 2345,
      "contractAddress": "0xAbc...",
      "completionPercentage": 45,
      "expectedMaturityDate": "2031-01-30",
      "impact": {
        "jobsCreated": 5000,
        "livesImpacted": 150000,
        "emissionReduction": "25 tons CO2"
      },
      "status": "active",
      "imageUrl": "https://...",
      "createdAt": "2024-06-15"
    },
    // ... more projects
  ],
  "pagination": {
    "total": 250,
    "pages": 13,
    "currentPage": 1,
    "hasNextPage": true
  }
}
```

#### **GET /api/projects/:id**
Get detailed project information

```
Response (200):
{
  "success": true,
  "project": {
    "id": "proj-001",
    "name": "Delhi-Bangalore Highway Expansion",
    "description": "Detailed description...",
    "location": "Delhi-Karnataka",
    "governance": {
      "administrator": "Ministry of Road Transport & Highways",
      "contractorName": "Build India Ltd.",
      "contractorRating": 4.8,
      "legalRepresentative": "Shri Arvind Singh"
    },
    "financialDetails": {
      "totalFunding": 500000000,
      "fundingBreakdown": {
        "construction": 300000000,
        "equipment": 100000000,
        "administrative": 50000000,
        "contingency": 50000000
      },
      "fundsRaised": 125000000,
      "fundsReleased": 50000000,
      "fundsInEscrow": 75000000,
      "interestRate": 650
    },
    "milestones": [
      {
        "id": "m-001",
        "name": "Land Acquisition & Site Preparation",
        "description": "50km land acquisition and clearance",
        "targetDate": "2026-06-30",
        "status": "completed",
        "completionDate": "2026-06-28",
        "fundsToRelease": 50000000,
        "evidence": "https://ipfs.io/QmXx...",
        "completionPercentage": 100
      },
      {
        "id": "m-002",
        "name": "Phase 1 Construction",
        "targetDate": "2027-12-31",
        "status": "in-progress",
        "completionPercentage": 35,
        "fundsToRelease": 100000000
      },
      // ... more milestones
    ],
    "riskAssessment": {
      "politicalRisk": "low",
      "environmentalRisk": "medium",
      "executionRisk": "medium",
      "weatherRisk": "low",
      "overallRisk": "medium"
    },
    "impactMetrics": {
      "jobsCreated": 5000,
      "livesImpacted": 150000,
      "emissionReduction": "25 tons CO2 annually",
      "constructionLength": "254km",
      "benefittedCommunities": 450
    },
    "investorInfo": {
      "totalInvestors": 2345,
      "averageInvestment": 53201,
      "minInvestment": 100,
      "maxInvestment": 50000000,
      "topCountries": ["India", "USA", "UK"],
      "diversificationScore": 85
    },
    "status": "active",
    "createdAt": "2024-06-15",
    "lastUpdated": "2026-01-30"
  }
}
```

#### **POST /api/projects** (Admin only)
Create a new project

```json
Request:
{
  "name": "Smart City Infrastructure",
  "description": "5G network rollout across 50 cities",
  "location": "Pan-India",
  "totalFunding": 1000000000,
  "interestRate": 700, // 7%
  "duration": 84,
  "riskLevel": "medium",
  "contractorName": "Telecom Solutions Inc.",
  "administratorName": "Dept. of Telecommunications"
}

Response (201):
{
  "success": true,
  "projectId": "proj-002",
  "contractAddress": "0xDef...",
  "message": "Project created successfully"
}
```

---

### **3. INVESTMENT ENDPOINTS**

#### **POST /api/investments/purchase**
Record a token purchase (investment)

```json
Request:
{
  "projectId": "proj-001",
  "tokenQuantity": 1000,
  "totalAmount": 100000,
  "transactionHash": "0xabcd...",
  "transactionStatus": "pending"
}

Response (201):
{
  "success": true,
  "investmentId": "inv-12345",
  "projectId": "proj-001",
  "tokensReceived": 1000,
  "amountInvested": 100000,
  "investmentDate": "2026-01-30T10:30:00Z",
  "status": "confirmed",
  "nextSteps": "Check your portfolio to track earnings",
  "transactionHash": "0xabcd..."
}
```

#### **GET /api/investments/history**
Get user's investment history

```
Query Params:
- page (default: 1)
- limit (default: 20)
- sortBy (date|amount|status)

Response (200):
{
  "success": true,
  "investments": [
    {
      "id": "inv-12345",
      "projectId": "proj-001",
      "projectName": "Delhi-Bangalore Highway Expansion",
      "tokensInvested": 1000,
      "amountInvested": 100000,
      "investmentDate": "2026-01-30",
      "transactionHash": "0xabcd...",
      "status": "confirmed",
      "currentValue": 102500, // With interest
      "interestEarned": 2500,
      "interestRate": 6.5,
      "daysHeld": 15
    },
    // ... more investments
  ],
  "pagination": { ... }
}
```

#### **GET /api/investments/portfolio**
Get user's complete portfolio summary

```
Response (200):
{
  "success": true,
  "portfolio": {
    "totalInvested": 500000,
    "totalCurrentValue": 525000,
    "totalGain": 25000,
    "gainPercentage": 5.0,
    "totalTokensHeld": 5000,
    "monthlyInterestEarned": 3250,
    "holdingsByProject": [
      {
        "projectId": "proj-001",
        "projectName": "Delhi-Bangalore Highway Expansion",
        "tokensHeld": 3000,
        "investmentValue": 300000,
        "currentValue": 315000,
        "interestEarned": 15000,
        "interestRate": 6.5,
        "monthlyEarnings": 1687.50,
        "percentage": 60
      },
      // ... more projects
    ],
    "diversification": {
      "highRisk": 10,
      "mediumRisk": 60,
      "lowRisk": 30
    },
    "performance": {
      "thisMonth": 3250,
      "thisYear": 26000,
      "allTime": 45000
    }
  }
}
```

#### **GET /api/investments/:investmentId**
Get details of a specific investment

```
Response (200):
{
  "success": true,
  "investment": {
    "id": "inv-12345",
    "projectId": "proj-001",
    "projectName": "Delhi-Bangalore Highway Expansion",
    "investorId": "user-123",
    "investorName": "Rajesh Kumar",
    "amountInvested": 100000,
    "tokensReceived": 1000,
    "investmentDate": "2026-01-30",
    "duration": 60,
    "maturityDate": "2031-01-30",
    "interestRate": 6.5,
    "status": "active",
    "breakdown": {
      "principalAmount": 100000,
      "accruedInterest": 2500,
      "paidInterest": 0,
      "currentValue": 102500
    },
    "earningsProjection": {
      "totalExpectedReturn": 139500,
      "expectedMaturityValue": 139500,
      "estimatedMonthlyEarnings": 3250,
      "estimatedYearlyEarnings": 39000
    },
    "transactionDetails": {
      "transactionHash": "0xabcd...",
      "blockNumber": 123456,
      "gasUsed": "250000",
      "timestamp": "2026-01-30T10:30:00Z"
    },
    "smartContractState": {
      "tokenBalance": 1000,
      "escrowStatus": "locked",
      "fundReleaseEligibility": "pending_milestone"
    }
  }
}
```

---

### **4. USER PORTFOLIO ENDPOINTS**

#### **GET /api/users/profile**
Get user profile and KYC status

```
Response (200):
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "investor@example.com",
    "fullName": "Rajesh Kumar",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42470",
    "phoneNumber": "+91-98765-43210",
    "country": "India",
    "state": "Karnataka",
    "kycStatus": "verified",
    "kycVerificationDate": "2026-01-15",
    "investorType": "retail", // retail | institutional
    "totalInvestments": 500000,
    "totalReturns": 25000,
    "memberSince": "2024-06-15",
    "lastLogin": "2026-01-30T08:00:00Z",
    "preferences": {
      "emailNotifications": true,
      "smsAlerts": false,
      "riskTolerance": "medium",
      "preferredProjects": ["transportation", "renewable_energy"]
    }
  }
}
```

#### **PUT /api/users/profile**
Update user profile

```json
Request:
{
  "phoneNumber": "+91-98765-43210",
  "preferences": {
    "emailNotifications": true,
    "riskTolerance": "medium"
  }
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### **GET /api/users/dashboard**
Complete dashboard with all user data

```
Response (200):
{
  "success": true,
  "dashboard": {
    "summary": {
      "totalInvested": 500000,
      "totalCurrentValue": 525000,
      "totalGain": 25000,
      "gainPercentage": 5.0,
      "activeInvestments": 3,
      "monthlyInterest": 3250,
      "lastUpdated": "2026-01-30T10:30:00Z"
    },
    "performanceChart": [
      { "date": "2026-01-01", "value": 500000 },
      { "date": "2026-01-10", "value": 512500 },
      { "date": "2026-01-20", "value": 520000 },
      { "date": "2026-01-30", "value": 525000 }
    ],
    "investments": [
      // ... investment details
    ],
    "recentTransactions": [
      {
        "id": "tx-001",
        "type": "investment",
        "description": "Invested in Highway Project",
        "amount": 100000,
        "date": "2026-01-25",
        "status": "completed"
      },
      // ... more transactions
    ],
    "notifications": [
      {
        "id": "notif-001",
        "type": "milestone_completed",
        "message": "Highway Project completed Phase 1",
        "date": "2026-01-28",
        "read": false
      }
    ]
  }
}
```

---

### **5. TRANSPARENCY ENDPOINTS**

#### **GET /api/transparency/overview**
Global transparency dashboard

```
Response (200):
{
  "success": true,
  "transparency": {
    "totalFundsRaised": 12500000000, // ₹125 Cr
    "totalFundsReleased": 5000000000, // ₹50 Cr
    "fundsInEscrow": 7500000000,
    "totalInvestors": 125000,
    "totalInvestments": 250000,
    "activeProjects": 35,
    "completedProjects": 12,
    "totalImpact": {
      "jobsCreated": 450000,
      "livesImpacted": 15000000,
      "emissionReduction": "1250 tons CO2",
      "infrastructureBuilt": "2500 km roads, 50 power plants, 100 schools"
    }
  }
}
```

#### **GET /api/transparency/projects/:projectId**
Project-specific transparency report

```
Response (200):
{
  "success": true,
  "report": {
    "projectId": "proj-001",
    "projectName": "Delhi-Bangalore Highway Expansion",
    "fundFlow": {
      "totalRaised": 500000000,
      "released": 50000000,
      "locked": 450000000,
      "timeline": [
        {
          "date": "2024-06-15",
          "amount": 0,
          "description": "Project started"
        },
        {
          "date": "2025-01-15",
          "amount": 250000000,
          "description": "Phase 1 funding received",
          "milestone": "Land Acquisition Complete"
        },
        // ... more releases
      ]
    },
    "milestonesTracking": [
      {
        "name": "Land Acquisition",
        "targetDate": "2026-06-30",
        "status": "completed",
        "completionDate": "2026-06-28",
        "completionPercentage": 100,
        "fundsReleased": 50000000,
        "evidence": "https://ipfs.io/QmXx...",
        "documentation": "Land acquisition deed, ownership transfer"
      },
      // ... more milestones
    ],
    "fundUtilization": {
      "budgeted": {
        "construction": 300000000,
        "equipment": 100000000,
        "administrative": 50000000,
        "contingency": 50000000
      },
      "spent": {
        "construction": 35000000,
        "equipment": 10000000,
        "administrative": 5000000,
        "contingency": 0
      },
      "percentageSpent": 20
    },
    "auditTrail": [
      {
        "date": "2026-01-30T10:30:00Z",
        "action": "Funds Released",
        "amount": 10000000,
        "milestone": "Phase 1 Preparation",
        "approvedBy": "Admin User",
        "transactionHash": "0xabc..."
      },
      // ... more entries
    ]
  }
}
```

#### **GET /api/transparency/audit-log**
Complete audit log for compliance

```
Query Params:
- startDate
- endDate
- action (fund_release|milestone_complete|investment|interest_payout)
- userId

Response (200):
{
  "success": true,
  "auditLog": [
    {
      "id": "log-001",
      "timestamp": "2026-01-30T10:30:00Z",
      "userId": "user-123",
      "action": "investment",
      "resourceType": "investment",
      "resourceId": "inv-12345",
      "details": {
        "projectId": "proj-001",
        "amount": 100000,
        "tokens": 1000
      },
      "oldValues": null,
      "newValues": {
        "status": "confirmed",
        "transactionHash": "0xabc..."
      },
      "status": "success",
      "ipAddress": "203.0.113.42"
    },
    // ... more logs
  ],
  "summary": {
    "totalActions": 5000,
    "investmentsRecorded": 2500,
    "fundsReleased": 5000000000,
    "interestDistributed": 125000000
  }
}
```

---

### **6. MILESTONE ENDPOINTS**

#### **GET /api/projects/:projectId/milestones**
Get all milestones for a project

```
Response (200):
{
  "success": true,
  "milestones": [
    {
      "id": "m-001",
      "projectId": "proj-001",
      "name": "Land Acquisition & Site Preparation",
      "description": "50km land acquisition and clearance",
      "targetDate": "2026-06-30",
      "status": "completed",
      "completionDate": "2026-06-28",
      "completionPercentage": 100,
      "fundsToRelease": 50000000,
      "evidence": "https://ipfs.io/QmXx...",
      "documentation": {
        "landDeed": "https://ipfs.io/...",
        "surveyReport": "https://ipfs.io/...",
        "completionCertificate": "https://ipfs.io/..."
      },
      "daysAhead": 2,
      "fundStatus": "released"
    },
    // ... more milestones
  ],
  "summary": {
    "total": 6,
    "completed": 1,
    "inProgress": 2,
    "pending": 3,
    "completionPercentage": 16.67,
    "fundsReleasedSoFar": 50000000,
    "totalFundsPending": 450000000
  }
}
```

#### **POST /api/projects/:projectId/milestones/:milestoneId/complete** (Admin)
Mark a milestone as completed

```json
Request:
{
  "evidenceUrl": "https://ipfs.io/QmXx...",
  "completionNotes": "Phase 1 construction completed on schedule",
  "proofDocuments": [
    "https://ipfs.io/...",
    "https://ipfs.io/..."
  ]
}

Response (200):
{
  "success": true,
  "message": "Milestone completed",
  "milestone": {
    "id": "m-001",
    "status": "completed",
    "completionDate": "2026-01-30T10:30:00Z",
    "fundsReleased": 50000000,
    "transactionHash": "0xabc..."
  },
  "fundReleaseDetails": {
    "amount": 50000000,
    "releaseDate": "2026-01-30T10:30:00Z",
    "status": "completed"
  }
}
```

---

### **7. INTEREST ENDPOINTS**

#### **GET /api/users/interest/accrual**
Get user's interest accrual details

```
Response (200):
{
  "success": true,
  "interest": {
    "totalAccrued": 15000,
    "totalPaid": 0,
    "nextPaymentDate": "2026-02-28",
    "byProject": [
      {
        "projectId": "proj-001",
        "projectName": "Highway Project",
        "tokensHeld": 3000,
        "interestRate": 6.5,
        "accruedAmount": 10000,
        "expectedMonthlyPayout": 1687.50,
        "payoutSchedule": "monthly"
      },
      // ... more projects
    ],
    "projectedAnnualEarnings": 39000
  }
}
```

#### **POST /api/users/interest/claim**
Claim accrued interest (receive as tokens)

```json
Request:
{
  "projectId": "proj-001"
}

Response (200):
{
  "success": true,
  "message": "Interest claimed successfully",
  "claimDetails": {
    "projectId": "proj-001",
    "amountClaimed": 5000,
    "tokensReceived": 5000,
    "claimDate": "2026-01-30T10:30:00Z",
    "newBalance": 8000, // tokens held
    "transactionHash": "0xdef..."
  }
}
```

#### **GET /api/users/interest/history**
Get interest payment history

```
Response (200):
{
  "success": true,
  "paymentHistory": [
    {
      "id": "int-001",
      "projectId": "proj-001",
      "claimDate": "2026-01-30",
      "amount": 5000,
      "tokensReceived": 5000,
      "transactionHash": "0xdef...",
      "status": "completed"
    },
    // ... more payments
  ]
}
```

---

## 📊 PHASE 4: Database Schema & ORM Models

### **Database: PostgreSQL**

### **1. Users Table**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    phone_number VARCHAR(20),
    country VARCHAR(100),
    state VARCHAR(100),
    kyc_status ENUM('pending', 'approved', 'rejected', 'verified') DEFAULT 'pending',
    kyc_verification_date TIMESTAMP,
    investor_type ENUM('retail', 'institutional') DEFAULT 'retail',
    role ENUM('investor', 'admin', 'auditor') DEFAULT 'investor',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_kyc_status (kyc_status)
);
```

### **2. Projects Table**

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    total_funding_target BIGINT NOT NULL,
    current_funds_raised BIGINT DEFAULT 0,
    funds_released BIGINT DEFAULT 0,
    funds_in_escrow BIGINT DEFAULT 0,
    interest_rate_annual DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    risk_level ENUM('low', 'medium', 'high') NOT NULL,
    contract_address VARCHAR(42) UNIQUE,
    bond_token_address VARCHAR(42),
    status ENUM('active', 'completed', 'delayed', 'cancelled') DEFAULT 'active',
    administrator_name VARCHAR(255),
    contractor_name VARCHAR(255),
    contractor_rating DECIMAL(3, 1),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_risk_level (risk_level),
    INDEX idx_created_at (created_at)
);
```

### **3. Investments Table**

```sql
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tokens_purchased BIGINT NOT NULL,
    amount_invested DECIMAL(18, 2) NOT NULL,
    token_price DECIMAL(10, 2) NOT NULL DEFAULT 100,
    tx_hash VARCHAR(66),
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    invested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    INDEX idx_tx_hash (tx_hash),
    UNIQUE(user_id, project_id) -- One investment per user per project
);
```

### **4. Milestones Table**

```sql
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    fund_release_amount DECIMAL(18, 2) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'delayed', 'failed') DEFAULT 'pending',
    completed_date TIMESTAMP,
    completion_percentage INT DEFAULT 0,
    evidence_url TEXT,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_id (project_id),
    INDEX idx_status (status),
    INDEX idx_target_date (target_date)
);
```

### **5. Fund Releases Table**

```sql
CREATE TABLE fund_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount_released DECIMAL(18, 2) NOT NULL,
    tx_hash VARCHAR(66),
    released_by_admin UUID REFERENCES users(id),
    released_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_milestone_id (milestone_id),
    INDEX idx_project_id (project_id),
    INDEX idx_tx_hash (tx_hash)
);
```

### **6. Interest Accruals Table**

```sql
CREATE TABLE interest_accruals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tokens_held BIGINT NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    accrued_amount DECIMAL(18, 2) DEFAULT 0,
    paid_amount DECIMAL(18, 2) DEFAULT 0,
    last_accrual_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_payment_date TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_project_id (project_id),
    UNIQUE(user_id, project_id)
);
```

### **7. Audit Logs Table**

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    status ENUM('success', 'failure') DEFAULT 'success',
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_timestamp (timestamp)
);
```

---

### **ORM Models (Sequelize)**

#### **User Model**

```javascript
// models/User.js
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    walletAddress: {
      type: DataTypes.STRING(42),
      unique: true,
    },
    phoneNumber: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    kycStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'verified'),
      defaultValue: 'pending',
    },
    kycVerificationDate: DataTypes.DATE,
    investorType: {
      type: DataTypes.ENUM('retail', 'institutional'),
      defaultValue: 'retail',
    },
    role: {
      type: DataTypes.ENUM('investor', 'admin', 'auditor'),
      defaultValue: 'investor',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: DataTypes.DATE,
  }, {
    timestamps: true,
    tableName: 'users',
    indexes: [
      { fields: ['email'] },
      { fields: ['walletAddress'] },
      { fields: ['kycStatus'] },
    ],
  });

  // Associations
  User.associate = (models) => {
    User.hasMany(models.Investment, { foreignKey: 'userId' });
    User.hasMany(models.InterestAccrual, { foreignKey: 'userId' });
    User.hasMany(models.AuditLog, { foreignKey: 'userId' });
  };

  return User;
};
```

#### **Project Model**

```javascript
// models/Project.js
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    location: DataTypes.STRING,
    totalFundingTarget: DataTypes.BIGINT,
    currentFundsRaised: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    fundsReleased: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    fundsInEscrow: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    interestRateAnnual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    durationMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
    },
    contractAddress: {
      type: DataTypes.STRING(42),
      unique: true,
    },
    bondTokenAddress: DataTypes.STRING(42),
    status: {
      type: DataTypes.ENUM('active', 'completed', 'delayed', 'cancelled'),
      defaultValue: 'active',
    },
    administratorName: DataTypes.STRING,
    contractorName: DataTypes.STRING,
    contractorRating: DataTypes.DECIMAL(3, 1),
    imageUrl: DataTypes.TEXT,
  }, {
    timestamps: true,
    tableName: 'projects',
    indexes: [
      { fields: ['status'] },
      { fields: ['riskLevel'] },
      { fields: ['createdAt'] },
    ],
  });

  // Associations
  Project.associate = (models) => {
    Project.hasMany(models.Investment, { foreignKey: 'projectId' });
    Project.hasMany(models.Milestone, { foreignKey: 'projectId' });
    Project.hasMany(models.InterestAccrual, { foreignKey: 'projectId' });
    Project.hasMany(models.FundRelease, { foreignKey: 'projectId' });
  };

  return Project;
};
```

#### **Investment Model**

```javascript
// models/Investment.js
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Investment = sequelize.define('Investment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tokensPurchased: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    amountInvested: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    tokenPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 100,
    },
    txHash: DataTypes.STRING(66),
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
      defaultValue: 'pending',
    },
  }, {
    timestamps: true,
    tableName: 'investments',
    indexes: [
      { fields: ['userId'] },
      { fields: ['projectId'] },
      { fields: ['txHash'] },
      { fields: ['userId', 'projectId'], unique: true },
    ],
  });

  // Associations
  Investment.associate = (models) => {
    Investment.belongsTo(models.User, { foreignKey: 'userId' });
    Investment.belongsTo(models.Project, { foreignKey: 'projectId' });
  };

  return Investment;
};
```

---

## ✅ Completion Checklist for Phases 3-4

- [ ] Express.js server setup complete
- [ ] All API endpoints implemented
- [ ] Database schema created in PostgreSQL
- [ ] All ORM models defined
- [ ] Relationships configured correctly
- [ ] Seed data created (10-15 projects)
- [ ] API routes tested (manual + automated)
- [ ] Authentication working (JWT + Web3)
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Logging system setup
- [ ] Database migrations working
- [ ] API documentation complete

---

**Next Phase:** Phase 5 - Frontend Development
**Estimated Duration:** 8-10 hours (combined)
**Dependencies:** Smart contracts deployed + Backend API running

Created: January 30, 2026
Status: Complete ✅
