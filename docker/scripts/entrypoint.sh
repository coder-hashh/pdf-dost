#!/bin/sh
set -e

echo "Initializing database schema..."
until node node_modules/prisma/build/index.js db push --accept-data-loss; do
  echo "Database push failed, retrying in 5 seconds..."
  sleep 5
done

echo "Database schema pushed successfully."

# Seed database
echo "Seeding database..."
node node_modules/prisma/build/index.js db seed || echo "Database seeding failed or already completed."

echo "Starting nextjs application server..."
exec node server.js
