#!/bin/sh
set -e

echo "Waiting for postgres database connection..."
# Wait for postgres to be ready
until npx prisma db push --accept-data-loss; do
  echo "Database push failed, retrying in 5 seconds..."
  sleep 5
done

echo "Database schema pushed successfully."

# Seed database
echo "Seeding database..."
npx tsx scripts/seed.ts || echo "Database seeding failed or already completed."

echo "Starting nextjs application server..."
exec node server.js
