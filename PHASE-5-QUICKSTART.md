# Phase 5 - Quick Start Testing Guide

## Start Backend Server (CRITICAL)

**⚠️ IMPORTANT:** The backend MUST be run in a native Windows terminal (Command Prompt or PowerShell), NOT in VS Code terminal.

### Start Server
```powershell
cd C:\Users\PC-ASUS\Documents\INFRACHAIN-SDG9\backend
npm start
```

### Verify Server is Running
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health"
```

---

## Quick Feature Tests

### 1. Email Signup (30 seconds)
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### 2. Email Login (15 seconds)
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/email-login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
```

### 3. Submit KYC (30 seconds)
```powershell
$kycBody = @{
    documentType = "passport"
    documentNumber = "AB123456"
    fullName = "Test User"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

$headers = @{ "Authorization" = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:5000/api/kyc/submit" -Method POST -Body $kycBody -ContentType "application/json" -Headers $headers
```

### 4. Create Admin & View Stats (1 minute)
```powershell
# Create admin account
$adminBody = @{
    email = "admin@infrachain.com"
    password = "admin123"
    name = "Admin User"
    role = "admin"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $adminBody -ContentType "application/json"
$adminToken = $adminResponse.token

# View platform stats
$adminHeaders = @{ "Authorization" = "Bearer $adminToken" }
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stats" -Method GET -Headers $adminHeaders
```

---

## All Features Added in Phase 5

✅ **Email Authentication**
- POST /api/auth/signup
- POST /api/auth/email-login

✅ **KYC Workflow**
- POST /api/kyc/submit (any user)
- GET /api/kyc/status (any user)
- POST /api/kyc/verify/:userId (admin)
- GET /api/kyc/pending (admin)

✅ **Admin Panel**
- GET /api/admin/users (admin)
- GET /api/admin/users/:id (admin)
- PUT /api/admin/users/:id/role (admin)
- DELETE /api/admin/users/:id (admin)
- GET /api/admin/stats (admin/auditor)

✅ **User Roles**
- investor (default)
- project_manager
- admin
- auditor (NEW)

✅ **RBAC Protection**
- Projects: Only project_manager and admin can create
- Milestones: Only project_manager and admin can manage
- KYC Verification: Only admin
- User Management: Only admin
- Statistics: admin and auditor

---

## Complete Testing

For comprehensive testing of all endpoints:
📄 **See: PHASE-5-TESTING.md**

For implementation details:
📄 **See: PHASE-5-SUMMARY.md**

---

## Phase 5 Status: ✅ COMPLETE

All planned features have been implemented and are ready for testing.
