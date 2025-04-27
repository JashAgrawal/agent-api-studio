#!/bin/bash

# This script initializes a PostgreSQL database for the AI Agent Studio

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first."
    exit 1
fi

# Database configuration
DB_NAME="ai_agent_studio"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Create database
echo "Creating database $DB_NAME..."
createdb -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists"

# Set up Prisma
echo "Setting up Prisma..."
npx prisma generate
npx prisma migrate dev --name init

# Seed the database
echo "Seeding the database..."
npx prisma db seed

echo "Database setup complete!"
echo "You can now run 'pnpm dev' to start the application."
