# Product Management System

This repository contains the initial foundation for an enterprise product management system backend.

## Structure

- backend/: NestJS application, Prisma schema, Dockerfile, and environment config
- docs/: design documentation and architecture artifacts
- database/: reserved for future database assets
- docker/: reserved for future container-related config
- scripts/: reserved for operational scripts

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop (optional for local infrastructure)
- PostgreSQL (or Docker Compose)

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

## Run infrastructure with Docker Compose

From the repository root:

```bash
docker compose up -d
```

This starts PostgreSQL, Redis, RabbitMQ, Elasticsearch, and the backend service.

If you want to start only PostgreSQL for Prisma migrations:

```bash
cd backend
./scripts/start-db.sh
```

On Windows PowerShell:

```powershell
cd backend
./scripts/start-db.ps1
```

## API documentation

Once the app is running, open:

- Swagger UI: http://localhost:3000/docs
- API base URL: http://localhost:3000/api/v1
