# Product Management System

A full-stack product, inventory, purchase, sales, and role-based access management system built with:

- Backend: NestJS, Prisma, PostgreSQL, Redis
- Frontend: React, Vite, MUI
- Roles: `ADMIN`, `MANAGER`, `WAREHOUSE_STAFF`, `SALES_STAFF`

## Quick Start (Local Development)

### 1. Start infrastructure services

```powershell
docker compose up -d postgres redis
```

### 2. Setup backend

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Then start the backend dev server:

```powershell
npm run start:dev
```

Backend runs at: **http://localhost:3000**
Swagger docs: **http://localhost:3000/docs**

### 3. Setup frontend

Open a second terminal:

```powershell
cd frontend
npm install
npx vite --host 127.0.0.1
```

Frontend runs at: **http://127.0.0.1:3001**

## Test Accounts

After seeding, 4 accounts are available — one for each role:

| Role | Username | Password | Redirect After Login |
|---|---|---|---|
| **ADMIN** | `admin` | `admin123` | `/admin` |
| **MANAGER** | `manager` | `admin123` | `/manager` |
| **WAREHOUSE_STAFF** | `warehouse` | `admin123` | `/warehouse` |
| **SALES_STAFF** | `sales` | `admin123` | `/sales/pos` |

> All accounts share password `admin123`. Each role has a different sidebar and permissions — use different accounts to test role-based access.

## How to Use

### Login

1. Open browser at **http://127.0.0.1:3001/login**
2. Enter username (e.g. `admin`) and password (`admin123`)
3. Click **Đăng nhập**

The app redirects you to the role's default page automatically.

### Switch between roles

1. Click **Đăng xuất** in the sidebar
2. Login with a different account

### What each role sees

**ADMIN** — Full control
- Admin Dashboard, User Management, Role Management
- System Settings, Audit Logs
- All warehouse, sales, product, and report features

**WAREHOUSE_STAFF** — Warehouse operations
- Quick intake with barcode scanner
- Purchase orders, inventory, suppliers
- Stock transaction history

**SALES_STAFF** — Point of sale
- POS screen with camera barcode scan
- Sales orders
- Cannot access warehouse or admin features

**MANAGER** — Reporting & oversight
- KPI dashboard, inventory reports
- Read-only access to products, purchases, sales, suppliers
- Cannot create/edit/delete data

### System Settings

After login as `admin`, go to **Cấu hình hệ thống** in the sidebar. You can:

- View all system settings grouped by category (General, Company, Warehouse)
- Edit any setting inline — just type and click away to save
- Add new settings with key, value, and data type (Text/Number/Boolean)
- Delete settings

### Barcode Scanner

On the POS screen (`/sales/pos`) or warehouse intake (`/warehouse/intake`):

- Click the camera icon to scan a barcode
- Or type the barcode manually and press Enter
- The system looks up the product by barcode at `/api/v1/products/barcode/:barcode`

## Repository Layout

```
backend/          NestJS API, Prisma schema, seed, tests
frontend/         React + Vite UI
docs/             Functional requirements, use cases, ERD, API design
prisma/           Prisma schema (root copy)
docker-compose.yml
```

## Common Commands

### Backend (from `backend/`)

```powershell
npm run start:dev       # Start dev server with hot reload
npm run build           # Production build
npm test -- --runInBand # Run all tests (same as CI)
npm run prisma:seed     # Re-seed database
```

### Frontend (from `frontend/`)

```powershell
npx vite --host 127.0.0.1  # Start dev server
npm run build               # Type-check + production build
```

## Troubleshooting

### "Cấu hình hệ thống" page is empty

Run the seed again:

```powershell
cd backend
npm run prisma:seed
```

### Registration / login fails

1. Is the backend running on port 3000?
2. Is PostgreSQL running? (`docker compose up -d postgres`)
3. Did you run `npm run prisma:migrate` and `npm run prisma:seed`?

### 401 errors after login

Clear browser localStorage and log in again.

### Camera not working

- Allow camera permission in browser
- Manual barcode input works as fallback
- Must be served from `127.0.0.1` or `localhost` (HTTPS not required for local dev)
3. Verify `JWT_SECRET` and `JWT_REFRESH_SECRET`
4. Confirm the frontend and backend are using the same API prefix

### 3. The frontend cannot reach the API

Check that:

- backend is running at `http://localhost:3000`
- the frontend is configured with the correct `VITE_API_URL`
- backend CORS allows the frontend origin

### 4. Swagger works, but some endpoints return Forbidden

This usually means:

- the current account has the wrong role
- the database is missing permissions or role mappings
- the schema or seed data was changed and not re-applied

Fix:

```powershell
cd backend
npm run prisma:seed
```

## Key API Endpoints

Base URL:

- `http://localhost:3000/api/v1`

Core endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /products`
- `GET /products/barcode/:barcode`

See Swagger for the full list.

## Verified Status

The following checks have already passed:

- backend build
- frontend build
- auth integration flow

If registration fails locally, the most likely causes are incomplete migration/seed steps or a database that is not running.
