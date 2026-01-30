# Phase 5 Testing Guide
## Authentication & User Management Feature Testing

This document provides comprehensive testing instructions for all Phase 5 features.

---

## Prerequisites
- Backend server running on `http://localhost:5000`
- PostgreSQL database running
- All dependencies installed (`bcrypt`, `jsonwebtoken`, `ethers`)

---

## 1. Email Authentication Testing

### 1.1 Email Signup
**Endpoint:** `POST /api/auth/signup`

**Test Case 1: Successful Registration**
```powershell
$body = @{
    email = "investor1@test.com"
    password = "password123"
    name = "Test Investor"
    role = "investor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "investor1@test.com",
    "name": "Test Investor",
    "role": "investor",
    "kycStatus": "pending",
    "totalInvested": 0,
    "totalTokens": 0,
    "isActive": true
  }
}
```

**Test Case 2: Duplicate Email**
```powershell
# Run same command again - should fail
```

**Expected Response:** `409 Conflict` - "User with this email already exists"

**Test Case 3: Missing Fields**
```powershell
$body = @{
    email = "test@test.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:** `400 Bad Request` - "Email, password, and name are required"

**Test Case 4: Short Password**
```powershell
$body = @{
    email = "short@test.com"
    password = "12345"
    name = "Short Pass"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:** `400 Bad Request` - "Password must be at least 6 characters long"

---

### 1.2 Email Login
**Endpoint:** `POST /api/auth/email-login`

**Test Case 1: Successful Login**
```powershell
$body = @{
    email = "investor1@test.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-login" -Method POST -Body $body -ContentType "application/json"

# Save token for later use
$token = $response.token
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "walletAddress": null,
    "email": "investor1@test.com",
    "name": "Test Investor",
    "role": "investor",
    "kycStatus": "pending",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test Case 2: Wrong Password**
```powershell
$body = @{
    email = "investor1@test.com"
    password = "wrongpassword"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-login" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:** `401 Unauthorized` - "Invalid email or password"

**Test Case 3: Non-existent Email**
```powershell
$body = @{
    email = "notfound@test.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-login" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:** `401 Unauthorized` - "Invalid email or password"

---

## 2. KYC Workflow Testing

### 2.1 Submit KYC Documents
**Endpoint:** `POST /api/kyc/submit`

**Test Case 1: Submit KYC (Authenticated User)**
```powershell
# First, login and get token
$loginBody = @{
    email = "investor1@test.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# Submit KYC
$kycBody = @{
    documentType = "passport"
    documentNumber = "AB123456"
    fullName = "Test Investor"
    dateOfBirth = "1990-01-01"
    address = "123 Main St, City, Country"
    country = "USA"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/submit" -Method POST -Body $kycBody -ContentType "application/json" -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "message": "KYC documents submitted successfully",
  "data": {
    "kycStatus": "pending",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test Case 2: Submit Without Auth**
```powershell
$kycBody = @{
    documentType = "passport"
    documentNumber = "AB123456"
    fullName = "Test Investor"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/submit" -Method POST -Body $kycBody -ContentType "application/json"
```

**Expected Response:** `401 Unauthorized`

---

### 2.2 Get KYC Status
**Endpoint:** `GET /api/kyc/status`

**Test Case: Get Own KYC Status**
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/status" -Method GET -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "kycStatus": "pending",
    "kycData": {
      "submittedAt": "2024-01-01T00:00:00.000Z",
      "status": "pending"
    }
  }
}
```

---

### 2.3 Admin KYC Verification (Admin Only)

**First, create an admin user:**
```powershell
$adminBody = @{
    email = "admin@infrachain.com"
    password = "admin123"
    name = "Admin User"
    role = "admin"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $adminBody -ContentType "application/json"
$adminToken = $adminResponse.token
```

**Test Case 1: Get Pending KYC Submissions**
```powershell
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/pending" -Method GET -Headers $adminHeaders
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "email": "investor1@test.com",
        "name": "Test Investor",
        "kycStatus": "pending",
        "kycDocuments": { ... }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Test Case 2: Approve KYC**
```powershell
# Get user ID from pending list
$userId = "user-uuid-here"

$verifyBody = @{
    status = "verified"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/verify/$userId" -Method POST -Body $verifyBody -ContentType "application/json" -Headers $adminHeaders
```

**Expected Response:**
```json
{
  "success": true,
  "message": "KYC approved successfully",
  "data": {
    "userId": "user-uuid",
    "kycStatus": "verified",
    "verifiedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test Case 3: Reject KYC**
```powershell
$rejectBody = @{
    status = "rejected"
    rejectionReason = "Documents not clear"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/verify/$userId" -Method POST -Body $rejectBody -ContentType "application/json" -Headers $adminHeaders
```

---

## 3. Admin Panel Testing

### 3.1 Get All Users (Admin Only)
**Endpoint:** `GET /api/admin/users`

**Test Case 1: List All Users**
```powershell
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" -Method GET -Headers $adminHeaders
```

**Test Case 2: Filter by Role**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users?role=investor" -Method GET -Headers $adminHeaders
```

**Test Case 3: Filter by KYC Status**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users?kycStatus=pending" -Method GET -Headers $adminHeaders
```

**Test Case 4: Search Users**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users?search=investor" -Method GET -Headers $adminHeaders
```

**Test Case 5: Non-Admin Access (Should Fail)**
```powershell
$investorHeaders = @{
    "Authorization" = "Bearer $token"  # Investor token
}

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" -Method GET -Headers $investorHeaders
```

**Expected Response:** `403 Forbidden` - "Access denied"

---

### 3.2 Update User Role (Admin Only)
**Endpoint:** `PUT /api/admin/users/:id/role`

**Test Case 1: Promote User to Project Manager**
```powershell
$roleBody = @{
    role = "project_manager"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/$userId/role" -Method PUT -Body $roleBody -ContentType "application/json" -Headers $adminHeaders
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "userId": "user-uuid",
    "newRole": "project_manager"
  }
}
```

**Test Case 2: Change to Auditor Role**
```powershell
$roleBody = @{
    role = "auditor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/$userId/role" -Method PUT -Body $roleBody -ContentType "application/json" -Headers $adminHeaders
```

---

### 3.3 Get Platform Statistics
**Endpoint:** `GET /api/admin/stats`

**Test Case 1: Admin Access**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stats" -Method GET -Headers $adminHeaders
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 2,
      "active": 2,
      "recentRegistrations": 2,
      "byRole": {
        "investor": 1,
        "admin": 1
      },
      "byKycStatus": {
        "pending": 1,
        "verified": 1
      }
    },
    "investments": {
      "totalInvested": "0.00",
      "totalTokensIssued": "0.00000000"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Test Case 2: Auditor Access (Should Work)**
```powershell
# First create auditor account
$auditorBody = @{
    email = "auditor@infrachain.com"
    password = "auditor123"
    name = "Auditor User"
    role = "auditor"
} | ConvertTo-Json

$auditorResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $auditorBody -ContentType "application/json"
$auditorToken = $auditorResponse.token

$auditorHeaders = @{
    "Authorization" = "Bearer $auditorToken"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stats" -Method GET -Headers $auditorHeaders
```

---

### 3.4 Deactivate User
**Endpoint:** `DELETE /api/admin/users/:id`

**Test Case 1: Deactivate User**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/$userId" -Method DELETE -Headers $adminHeaders
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "userId": "user-uuid",
    "isActive": false
  }
}
```

---

## 4. Role-Based Access Control (RBAC) Testing

### 4.1 Project Creation (Project Manager or Admin Only)
**Endpoint:** `POST /api/projects`

**Test Case 1: Investor Cannot Create Project (Should Fail)**
```powershell
$investorHeaders = @{
    "Authorization" = "Bearer $token"  # Investor token
}

$projectBody = @{
    name = "Test Project"
    description = "Test Description"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method POST -Body $projectBody -ContentType "application/json" -Headers $investorHeaders
```

**Expected Response:** `403 Forbidden` - "Access denied"

**Test Case 2: Project Manager Can Create Project**
```powershell
# First create project manager
$pmBody = @{
    email = "pm@infrachain.com"
    password = "pm123456"
    name = "Project Manager"
    role = "project_manager"
} | ConvertTo-Json

$pmResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $pmBody -ContentType "application/json"
$pmToken = $pmResponse.token

$pmHeaders = @{
    "Authorization" = "Bearer $pmToken"
}

# Now create project (should succeed)
Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method POST -Body $projectBody -ContentType "application/json" -Headers $pmHeaders
```

**Expected Response:** `201 Created` with project data

---

### 4.2 Milestone Management (Project Manager or Admin Only)
**Endpoint:** `POST /api/milestones/project/:projectId`

**Test Case: Investor Cannot Create Milestone (Should Fail)**
```powershell
$milestoneBody = @{
    title = "Test Milestone"
    description = "Test Description"
    targetDate = "2024-12-31"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/milestones/project/$projectId" -Method POST -Body $milestoneBody -ContentType "application/json" -Headers $investorHeaders
```

**Expected Response:** `403 Forbidden`

---

## 5. Database Verification

### 5.1 Verify User Model Updates
```sql
-- Connect to PostgreSQL
psql -U postgres -d infrachain_dev

-- Check user model structure
\d users;

-- Verify auditor role exists
SELECT DISTINCT role FROM users;

-- Check password field exists
SELECT id, email, password IS NOT NULL as has_password, role FROM users;

-- Verify KYC status
SELECT id, email, "kycStatus", role FROM users;
```

---

## 6. Integration Testing Checklist

- [ ] Email signup creates user with hashed password
- [ ] Email login verifies password and returns JWT
- [ ] Wallet login still works (backward compatibility)
- [ ] KYC submission updates user status to 'pending'
- [ ] Admin can view pending KYC submissions
- [ ] Admin can approve/reject KYC
- [ ] Admin can list all users with filters
- [ ] Admin can change user roles
- [ ] Admin can view platform statistics
- [ ] Auditor can view statistics but not manage users
- [ ] Admin can deactivate users
- [ ] Investor cannot access admin routes
- [ ] Project Manager can create projects
- [ ] Investor cannot create projects
- [ ] Role-based access is enforced on all protected routes

---

## 7. Error Scenarios to Test

### Authentication Errors
- [ ] Missing JWT token returns 401
- [ ] Invalid JWT token returns 401
- [ ] Expired JWT token returns 401
- [ ] Wrong password returns 401
- [ ] Inactive account cannot login

### Authorization Errors
- [ ] Investor accessing admin routes returns 403
- [ ] Investor creating projects returns 403
- [ ] Non-admin verifying KYC returns 403

### Validation Errors
- [ ] Short password returns 400
- [ ] Invalid email format returns 400
- [ ] Missing required fields returns 400
- [ ] Invalid role value returns 400

---

## 8. Performance Testing

### Load Testing (Optional)
```powershell
# Test multiple concurrent logins
1..10 | ForEach-Object -Parallel {
    $body = @{
        email = "investor1@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-login" -Method POST -Body $body -ContentType "application/json"
}
```

---

## Summary

All Phase 5 features have been implemented:

✅ **Email Authentication** - Signup and login with password hashing
✅ **KYC Workflow** - Submit, verify, and manage KYC documents
✅ **Admin Panel** - User management, role changes, platform statistics
✅ **Role-Based Access Control** - Proper enforcement on all routes
✅ **Auditor Role** - Added to user model and permissions
✅ **Database Schema** - Updated with password field and auditor role

**Next Steps:**
1. Run all tests in this document
2. Verify all test cases pass
3. Document any issues found
4. Proceed to Phase 6 once all tests pass
