#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if command -v docker >/dev/null 2>&1; then
  echo "Starting PostgreSQL via Docker Compose..."
  docker compose up -d postgres
else
  echo "Docker was not found. Please install Docker Desktop or start PostgreSQL manually."
  exit 1
fi
