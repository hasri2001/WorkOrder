# Work Order Management System – Frontend

Vue 3 frontend application with role-based UI, work order management, and real-time status updates.

## Features

- **Secure Authentication**: JWT-based login with role detection
- **Role-Based UI**: Different capabilities for Admin, Manager, and Operator roles
- **Work Order Management**: Create, edit, delete, and update work orders
- **Status Workflow**: Visual status change with workflow validation
- **Audit Logs**: View complete history of work order changes
- **Responsive Design**: Works on desktop and tablet devices
- **Loading & Error States**: User-friendly feedback for all operations

## Tech Stack

- **Vue 3** (Composition API)
- **Vite** (Build tool)
- **Vue Router** (Routing)
- **Pinia** (State management)
- **Axios** (HTTP client)

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set environment variables**
   Copy `.env.example` to `.env` and update if needed:
   ```bash
   VITE_API_URL=http://localhost:8080
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Application will run on `http://localhost:3000` (configured in `vite.config.js`)

4. **Build for production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── WorkOrderTable.vue
│   ├── WorkOrderFilters.vue
│   ├── WorkOrderModal.vue
│   ├── StatusModal.vue
│   └── LogsModal.vue
├── views/              # Page components
│   ├── LoginView.vue
│   └── DashboardView.vue
├── stores/             # Pinia state management
│   ├── auth.js
│   └── workOrder.js
├── services/           # API service layer
│   └── api.js
├── router/             # Vue Router configuration
│   └── index.js
├── App.vue             # Root component
└── main.js             # Application entry point
```

## Demo Accounts

- **Admin**: `admin@example.com` / `Admin123!`
- **Manager**: `manager@example.com` / `Manager123!`
- **Operator**: `operator@example.com` / `Operator123!`

## Role Capabilities

| Action | Admin | Manager | Operator |
|--------|-------|---------|----------|
| View Work Orders | ✅ (All) | ✅ (All) | ✅ (Assigned only) |
| Create Work Order | ✅ | ✅ | ❌ |
| Edit Work Order | ✅ | ✅ | ❌ |
| Delete Work Order | ✅ | ✅ | ❌ |
| Change Status | ✅ | ✅ | ✅ (Assigned only) |
| View Audit Logs | ✅ | ✅ | ❌ |

## Features Implemented

### Authentication & Authorization
- JWT token storage in localStorage
- Automatic token injection in API requests
- Route guards for protected pages
- Role-based component rendering

### Work Order Management
- Paginated work order list
- Advanced filtering (status, priority, search)
- Create/Edit modal with validation
- Status change with workflow enforcement
- Delete with confirmation

### UI/UX
- Status color coding (Pending, Approved, In Progress, Completed, Rejected)
- Priority badges (Low, Medium, High)
- Loading spinners during API calls
- Error messages for failed operations
- Responsive layout

### Audit Trail
- View complete work order history
- Timeline visualization of changes
- Status transition tracking
- User attribution for all actions
