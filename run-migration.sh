#!/bin/bash

# Migration script to run Drizzle migrations on Neon
# This will apply the pending migrations to your database

echo "Running Drizzle migrations..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Please set it in your .env.local file"
  exit 1
fi

# Run migrations with drizzle-kit
npx drizzle-kit migrate --config drizzle.config.ts

echo ""
echo "Migration completed!"
