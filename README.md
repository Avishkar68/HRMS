# HRMS Platform

Human Resource Management System with role-based access (Super Admin, Admin, Manager, Employee).

## External configs you need

### Backend (`backend/`)

1. Copy `backend/.env.example` to `backend/.env`
2. Set in `.env`:
   - **MONGO_URI** – MongoDB connection string (e.g. `mongodb://localhost:27017/hrms`)
   - **JWT_SECRET** – Secret for JWT signing (use a long random string in production)
   - **PORT** (optional) – Default `3000`

3. Create a Super Admin user (one-time):
   ```bash
   cd backend && node scripts/createSuperAdmin.js
   ```
   Default: `superadmin@hrms.com` / `superadmin123`

### Frontend (`frontend/`)

1. Optional: copy `frontend/.env.example` to `frontend/.env`
2. Set **VITE_API_URL** only if your API runs elsewhere (default: `http://localhost:3000`)

## Run locally

```bash
# Terminal 1 – backend
cd backend && npm install && npm start

# Terminal 2 – frontend
cd frontend && npm install && npm run dev
```

- Backend: http://localhost:3000  
- Frontend: http://localhost:5173 (or the port Vite prints)

## Roles

- **Super Admin** – Create companies and their first admin
- **Admin** – Create users (managers/employees), manage leave types, view attendance & leaves
- **Manager** – View team attendance, approve/reject leave
- **Employee** – Mark attendance, apply leave, view profile & payslips
