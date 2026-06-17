#!/bin/sh
set -e

echo "Initializing SQLite database..."
until npx prisma db push --accept-data-loss; do
  echo "Database push failed, retrying in 5 seconds..."
  sleep 5
done

echo "Database schema pushed successfully."

# Seed database
echo "Seeding database..."
npx prisma db seed || echo "Database seeding failed or already completed."

echo "Starting nextjs application server..."
exec node server.js
