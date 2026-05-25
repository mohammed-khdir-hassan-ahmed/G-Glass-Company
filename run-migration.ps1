# Migration script to run Drizzle migrations on Neon
# This will apply the pending migrations to your database

Write-Host "Running Drizzle migrations..." -ForegroundColor Green
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
  Write-Host "Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
  Write-Host "Please set it in your .env.local file"
  exit 1
}

# Run migrations with drizzle-kit
Write-Host "Connecting to database and running migrations..." -ForegroundColor Cyan
npx drizzle-kit migrate --config drizzle.config.ts

Write-Host ""
Write-Host "Migration completed successfully!" -ForegroundColor Green
