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
npx vite
```

Frontend runs at: **http://localhost:3001**

> The dev server is bound to `0.0.0.0` (all network interfaces). You can also access it from other devices on the same WiFi — see [Mobile / LAN Testing](#mobile--lan-testing) below.

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

## Mobile / LAN Testing

To test on a phone or tablet connected to the same WiFi:

### 1. Find your computer's LAN IP

```powershell
ipconfig | findstr "IPv4"
```

Example output: `192.168.1.5`

### 2. Create frontend `.env` for mobile

`frontend/.env`:

```env
VITE_API_URL=http://192.168.1.5:3000/api/v1
```

Replace `192.168.1.5` with your actual LAN IP.  
This tells the frontend to call the backend directly instead of using Vite's dev proxy (which only works on the computer running Vite).

### 3. Start both servers

Backend (terminal 1):
```powershell
cd backend
npm run start:dev
```

Frontend (terminal 2):
```powershell
cd frontend
npx vite
```

### 4. Open on phone

Browse to: `http://192.168.1.5:3001` (use your LAN IP)

Login with any test account. The backend CORS is configured to accept LAN origins automatically.

> If the phone still can't connect, check your firewall allows port 3000 (backend) and 3001 (frontend) on the local network.

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
