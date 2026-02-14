# Postman Testing Guide

## Quick Setup

### 1. Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop **`Work-Order-API.postman_collection.json`**
4. Click **Import**

### 2. Import Environment

1. Click **Import** again
2. Drag and drop **`Work-Order-API.postman_environment.json`**
3. Click **Import**
4. Select **"Work Order API - Local"** from the environment dropdown (top right)

---

## Testing Flow

### Step 1: Health Check
- Open: **Health → Health Check**
- Click **Send**
- Should return: `{"status":"ok"}`

### Step 2: Login
- Open: **Authentication → Login as Admin**
- Click **Send**
- ✅ **Token is automatically saved!** The script extracts `accessToken` and saves it to the environment variable

### Step 3: List Work Orders
- Open: **Work Orders → List All Work Orders**
- Click **Send**
- Should see 2 work orders created by the seed script

### Step 4: Create New Work Order
- Open: **Work Orders → Create Work Order**
- Modify the body if needed
- Click **Send**
- Note the `id` in the response

### Step 5: Change Status (Test Workflow)
- Open: **Work Order Status → Change Status to APPROVED**
- Update the URL if needed (change `/1/status` to match your work order ID)
- Click **Send**
- Then try: **Change Status to IN_PROGRESS**
- Then try: **Change Status to COMPLETED**

### Step 6: View Audit Logs
- Open: **Audit Logs → Get Work Order Logs**
- Click **Send**
- See all actions performed on the work order

---

## Available Endpoints

### 🔓 Public (No Auth)
- `GET /health` - Health check

### 🔐 Authentication
- `POST /auth/login` - Login (Admin/Manager/Operator)

### 📋 Work Orders
- `GET /work-orders` - List all (with filters)
- `GET /work-orders/:id` - Get single
- `POST /work-orders` - Create (Admin/Manager)
- `PATCH /work-orders/:id` - Update (Admin/Manager)
- `DELETE /work-orders/:id` - Delete (Admin/Manager)
- `PATCH /work-orders/:id/status` - Change status

### 📊 Audit
- `GET /work-orders/:id/logs` - Get logs
- `GET /work-order-logs?workOrderId=:id` - Alternative

### 👤 Users
- `POST /users` - Create user (Admin only)

---

## Test Users

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `Admin123!` | ADMIN |
| `manager@example.com` | `Manager123!` | MANAGER |
| `operator@example.com` | `Operator123!` | OPERATOR |

---

## Testing RBAC (Role-Based Access)

### Test as Operator (Limited Access)

1. **Login as Operator**
   - Use: **Authentication → Login as Operator**
   - Token is auto-saved

2. **Try to list work orders**
   - **Work Orders → List All Work Orders**
   - ✅ Should only see work orders assigned to this operator

3. **Try to create work order**
   - **Work Orders → Create Work Order**
   - ❌ Should fail with `403 Forbidden`

4. **Try to view logs**
   - **Audit Logs → Get Work Order Logs**
   - ❌ Should fail with `403 Forbidden`

### Test as Manager

1. **Login as Manager**
   - Use: **Authentication → Login as Manager**

2. **Create work order**
   - ✅ Should work

3. **View all work orders**
   - ✅ Should see all work orders

4. **View logs**
   - ✅ Should work

5. **Try to create user**
   - **Users → Create User**
   - ❌ Should fail with `403 Forbidden` (Admin only)

---

## Status Workflow Rules

Valid transitions:
- `PENDING` → `APPROVED` or `REJECTED`
- `APPROVED` → `IN_PROGRESS`
- `IN_PROGRESS` → `COMPLETED` or `REJECTED`
- `COMPLETED` / `REJECTED` → **No further changes**

### Test Invalid Transition

1. Create a work order (status = `PENDING`)
2. Try: **Change Status to COMPLETED** (skip APPROVED)
3. ❌ Should fail: `"Invalid status transition from PENDING to COMPLETED"`

---

## Query Parameters for Filtering

Use **Work Orders → List Work Orders with Filters** and modify params:

| Parameter | Values | Example |
|-----------|--------|---------|
| `status` | PENDING, APPROVED, IN_PROGRESS, COMPLETED, REJECTED | `?status=PENDING` |
| `priority` | LOW, MEDIUM, HIGH | `?priority=HIGH` |
| `search` | Any text | `?search=network` |
| `page` | Number | `?page=1` |
| `limit` | 1-100 | `?limit=20` |
| `assignedToUserId` | User ID | `?assignedToUserId=3` |
| `createdByUserId` | User ID | `?createdByUserId=2` |
| `fromDueDate` | ISO date | `?fromDueDate=2026-02-01` |
| `toDueDate` | ISO date | `?toDueDate=2026-02-28` |

Combine multiple: `?status=PENDING&priority=HIGH&page=1&limit=10`

---

## Tips

1. **Auto Token Management**: Login requests automatically save the token. No need to copy/paste!

2. **Environment Variables**: 
   - `{{baseUrl}}` = `http://localhost:8080`
   - `{{authToken}}` = Your current JWT token

3. **Switch Users**: Just use different login requests. Token updates automatically.

4. **View Environment**: Click the eye icon (👁️) next to environment dropdown to see current token

5. **Troubleshooting**:
   - **401 Unauthorized**: Login again (token might be expired)
   - **403 Forbidden**: Check your role permissions
   - **404 Not Found**: Check the work order ID exists
   - **400 Bad Request**: Check request body format

---

## Next Steps

After testing with Postman:
1. Test all CRUD operations
2. Test different user roles (Admin, Manager, Operator)
3. Test status workflow transitions
4. Test filtering and pagination
5. Verify audit logs are created

Happy testing! 🚀
