# Backend API Testing Guide

## Prerequisites

1. **PostgreSQL running** on `localhost:5432` with database `work_orders` created
2. **Node.js** installed (v18+)

## Setup Steps

### 1. Create PostgreSQL Database

```powershell
# Using psql (if you have PostgreSQL installed locally)
psql -U postgres
CREATE DATABASE work_orders;
\q
```

Or use pgAdmin/any PostgreSQL client to create the database.

### 2. Enable Auto-Schema Creation (for testing)

Temporarily enable `synchronize: true` in `src/app.module.ts`:

Find this line (around line 33):
```typescript
synchronize: false,
```

Change to:
```typescript
synchronize: true,  // AUTO-CREATE TABLES (dev only!)
```

**IMPORTANT**: Set this back to `false` before production!

### 3. Install Dependencies & Start Server

```powershell
cd Backend
npm install
npm run start:dev
```

Server will start on `http://localhost:8080`

### 4. Seed Database

In a new terminal:
```powershell
cd Backend
npm run seed
```

This creates:
- **Admin**: `admin@example.com` / `Admin123!`
- **Manager**: `manager@example.com` / `Manager123!`
- **Operator**: `operator@example.com` / `Operator123!`
- 2 sample work orders

---

## API Endpoints & Testing

### 1. Health Check

```powershell
curl http://localhost:8080/health
```

**Expected Response:**
```json
{"status":"ok"}
```

---

### 2. Login (Get JWT Token)

#### Login as Admin
```powershell
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123!\"}"
```

#### Login as Manager
```powershell
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d "{\"email\":\"manager@example.com\",\"password\":\"Manager123!\"}"
```

#### Login as Operator
```powershell
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d "{\"email\":\"operator@example.com\",\"password\":\"Operator123!\"}"
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

**Copy the `accessToken` value** - you'll need it for authenticated requests!

---

### 3. List Work Orders

Replace `YOUR_TOKEN_HERE` with the actual token from login:

```powershell
curl http://localhost:8080/work-orders -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**With filters & pagination:**
```powershell
# Filter by status
curl "http://localhost:8080/work-orders?status=PENDING" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Filter by priority
curl "http://localhost:8080/work-orders?priority=HIGH" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search by title
curl "http://localhost:8080/work-orders?search=network" -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Pagination
curl "http://localhost:8080/work-orders?page=1&limit=10" -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Fix network issue",
      "description": "Investigate and resolve intermittent network outages.",
      "status": "PENDING",
      "priority": "HIGH",
      "dueDate": null,
      "createdAt": "2026-02-11T...",
      "updatedAt": "2026-02-11T...",
      "assignedTo": {
        "id": 3,
        "name": "Operator User",
        "email": "operator@example.com"
      },
      "createdBy": {
        "id": 2,
        "name": "Manager User",
        "email": "manager@example.com"
      }
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 20
}
```

---

### 4. Get Single Work Order

```powershell
curl http://localhost:8080/work-orders/1 -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. Create Work Order (Admin/Manager only)

```powershell
curl -X POST http://localhost:8080/work-orders -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"title\":\"Upgrade server RAM\",\"description\":\"Increase RAM from 16GB to 32GB on production server\",\"priority\":\"HIGH\",\"assignedToUserId\":3,\"dueDate\":\"2026-02-15\"}"
```

**Request Body:**
```json
{
  "title": "Upgrade server RAM",
  "description": "Increase RAM from 16GB to 32GB on production server",
  "priority": "HIGH",
  "assignedToUserId": 3,
  "dueDate": "2026-02-15"
}
```

**Expected Response:** Work order object with ID

---

### 6. Update Work Order (Admin/Manager only)

```powershell
curl -X PATCH http://localhost:8080/work-orders/1 -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"title\":\"Fix network issue - UPDATED\",\"priority\":\"MEDIUM\"}"
```

---

### 7. Change Work Order Status (with workflow validation)

```powershell
# Approve pending work order (Admin/Manager only)
curl -X PATCH http://localhost:8080/work-orders/1/status -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"newStatus\":\"APPROVED\"}"

# Start work (Admin/Manager/Operator on assigned orders)
curl -X PATCH http://localhost:8080/work-orders/1/status -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"newStatus\":\"IN_PROGRESS\"}"

# Complete work
curl -X PATCH http://localhost:8080/work-orders/1/status -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"newStatus\":\"COMPLETED\"}"
```

**Valid transitions:**
- `PENDING` → `APPROVED` or `REJECTED`
- `APPROVED` → `IN_PROGRESS`
- `IN_PROGRESS` → `COMPLETED` or `REJECTED`
- `COMPLETED` / `REJECTED` → No further changes

---

### 8. Get Work Order Audit Logs (Admin/Manager only)

```powershell
curl http://localhost:8080/work-orders/1/logs -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Or via the audit endpoint:**
```powershell
curl "http://localhost:8080/work-order-logs?workOrderId=1" -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "action": "CREATE",
    "fromStatus": null,
    "toStatus": null,
    "timestamp": "2026-02-11T...",
    "performedBy": {
      "id": 2,
      "name": "Manager User",
      "email": "manager@example.com"
    }
  },
  {
    "id": 2,
    "action": "STATUS_CHANGE",
    "fromStatus": "PENDING",
    "toStatus": "APPROVED",
    "timestamp": "2026-02-11T...",
    "performedBy": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
]
```

---

### 9. Delete Work Order (Admin/Manager only)

```powershell
curl -X DELETE http://localhost:8080/work-orders/2 -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 10. Create User (Admin only)

```powershell
curl -X POST http://localhost:8080/users -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "Content-Type: application/json" -d "{\"name\":\"New Operator\",\"email\":\"newop@example.com\",\"password\":\"NewOp123!\",\"role\":\"OPERATOR\"}"
```

---

## Testing RBAC (Role-Based Access Control)

### Test as Operator (restricted access)

1. Login as operator to get token
2. Try to create work order (should fail - Forbidden):
```powershell
curl -X POST http://localhost:8080/work-orders -H "Authorization: Bearer OPERATOR_TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"description\":\"Test\",\"priority\":\"LOW\"}"
```

3. List work orders (should only see assigned ones):
```powershell
curl http://localhost:8080/work-orders -H "Authorization: Bearer OPERATOR_TOKEN"
```

4. Try to view logs (should fail - Forbidden):
```powershell
curl http://localhost:8080/work-orders/1/logs -H "Authorization: Bearer OPERATOR_TOKEN"
```

---

## Expected Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error or invalid status transition
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found

---

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check credentials in `.env` match your database
- Ensure database `work_orders` exists

### "User not found" on login
- Run seed script: `npm run seed`

### Schema/table errors
- Set `synchronize: true` in `app.module.ts` (line ~33)
- Restart server

### Port already in use
- Change `PORT=3000` in `.env` to another port (e.g., `3001`)
- Restart server
