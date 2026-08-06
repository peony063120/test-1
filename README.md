# Product Management System

A full-stack product, inventory, purchase, sales, and role-based access management system built with:

- Backend: NestJS, Prisma, PostgreSQL, Redis
- Frontend: React, Vite, MUI
- Roles: `ADMIN`, `MANAGER`, `WAREHOUSE_STAFF`, `SALES_STAFF`

This README explains how to run the project locally, which files matter, and how to recover from the most common setup issues such as registration failures or API connectivity problems.

## Repository Layout

- `backend/`: NestJS API, Prisma schema, seed data, and tests
- `frontend/`: React + Vite UI
- `docs/`: functional requirements, use cases, API design, security notes, and architecture docs
- `docker-compose.yml`: local infrastructure for fast setup

## Prerequisites

You will need:

- Node.js 20+
- npm 10+
- Docker Desktop if you want to start the supporting services quickly

## Fastest Way to Run: Docker

From the repository root:

```powershell
docker compose up -d --build
```

After the services are up:

- Backend API: http://localhost:3000/api/v1
- Swagger UI: http://localhost:3000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- RabbitMQ UI: http://localhost:15672
- Elasticsearch: http://localhost:9200

To stop everything:

```powershell
docker compose down
```

Notes:

- Docker Compose starts the backend and infrastructure services, not the frontend dev server.
- Run the frontend separately with `npm run dev` inside `frontend`.

## Recommended Local Setup

### 1. Start the infrastructure

If you do not want to run everything through Docker, you can start just the dependencies:

```powershell
docker compose up -d postgres redis rabbitmq elasticsearch
```

### 2. Configure the backend

The backend environment file is:

- `backend/.env`

If it does not exist yet:

```powershell
cd backend
Copy-Item .env.example .env
```

The default values in `backend/.env.example` are suitable for local Docker-based development.

### 3. Initialize the database

Run these commands from the `backend` folder:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

This step is important. If you skip `prisma:seed`, the app may still start, but:

- the default `admin` account will not exist
- some roles and permissions may be missing
- several authorization flows will be incomplete

### 4. Start the backend

```powershell
npm run start:dev
```

Backend defaults:

- http://localhost:3000
- API prefix: `/api/v1`
- Swagger: http://localhost:3000/docs

### 5. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend defaults:

- http://localhost:5173

## Login and Registration

### Default seeded account

After `npm run prisma:seed`, the following account is available:

- username: `admin`
- password: `admin123`

### Login

The login page accepts:

- username
- email

After login, the app redirects based on the user role:

- `ADMIN` -> admin dashboard
- `WAREHOUSE_STAFF` -> warehouse / intake screen
- `SALES_STAFF` -> POS / sales screen
- `MANAGER` -> reporting dashboard

### Registration

Public registration supports these roles:

- `SALES_STAFF`
- `WAREHOUSE_STAFF`
- `MANAGER`

`ADMIN` is intentionally not available through public registration.

If you just changed code or recreated the database, run `npm run prisma:seed` again so the default roles and permissions are present.

Important notes:

- Newly registered accounts receive the selected base role immediately
- The backend will bootstrap missing roles and permissions when needed
- Seeding remains the most reliable way to ensure the local database is complete

## Roles and Capabilities

### Admin

- Overview dashboard
- User management
- Role and permission management
- System settings
- Audit logs
- Full access to the data model

### Warehouse Staff

- Create purchase intake flows
- Update inventory
- Manage suppliers
- Cannot change selling prices
- Cannot delete products
- Does not see manager-only revenue reports

### Sales Staff

- POS interface
- Manual barcode input and camera scanning
- Create sales orders
- Print invoices
- Cannot receive goods
- Cannot edit product prices

### Manager

- KPI dashboard
- Inventory reports
- Inventory movement reports
- Read-only access for most workflows

## Barcode and Camera Workflows

The `SALES_STAFF` POS screen includes:

- manual barcode input
- camera scan button
- product lookup by barcode
- add-to-cart flow
- sales order creation
- invoice printing

If the camera does not start:

- check whether the browser granted camera permission
- make sure the site is served from a valid origin for `getUserMedia`
- manual barcode input still works as a fallback

## Important Environment Variables

Backend file:

- `backend/.env`

Example values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/product_management
JWT_SECRET=supersecretkey
JWT_REFRESH_SECRET=superrefreshsecretkey
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://localhost:5672
ELASTICSEARCH_URL=http://localhost:9200
PORT=3000
```

Frontend can also use:

- `VITE_API_URL`

If not set, the frontend defaults to `/api/v1`.

If the frontend runs on `5173` and the backend on `3000`, set:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Common Commands

### Backend

```powershell
cd backend
npm run build
npm run test
```

### Frontend

```powershell
cd frontend
npm run build
```

### Root

```powershell
npm run build
npm test
```

Notes:

- Root `npm run build` is currently the backend build script
- Frontend builds must be run from the `frontend` folder

## Troubleshooting

### 1. Registration fails

Check these in order:

1. Is the backend running?
2. Is PostgreSQL running?
3. Does `backend/.env` exist?
4. Have you run `npm run prisma:migrate`?
5. Have you run `npm run prisma:seed`?

To reseed local data quickly:

```powershell
cd backend
npm run prisma:seed
```

### 2. Login works, but you keep getting 401 responses

Try this sequence:

1. Clear the tokens from `localStorage`
2. Log in again
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
