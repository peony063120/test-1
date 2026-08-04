$ErrorActionPreference = 'Stop'

if (Get-Command docker -ErrorAction SilentlyContinue) {
  Write-Host 'Starting PostgreSQL via Docker Compose...'
  Set-Location ..
  docker compose up -d postgres
} else {
  Write-Host 'Docker was not found. Please install Docker Desktop or start PostgreSQL manually.'
  exit 1
}
