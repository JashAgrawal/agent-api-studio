#!/bin/bash

# This script helps set up the AI Agent Studio with PostgreSQL and Prisma

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed."
    echo "Would you like to install PostgreSQL? (y/n)"
    read -r install_postgres
    
    if [[ $install_postgres == "y" || $install_postgres == "Y" ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            echo "Installing PostgreSQL using Homebrew..."
            if ! command -v brew &> /dev/null; then
                echo "Homebrew is not installed. Please install Homebrew first."
                echo "Visit https://brew.sh/ for installation instructions."
                exit 1
            fi
            brew install postgresql
            brew services start postgresql
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            echo "Installing PostgreSQL using apt..."
            sudo apt update
            sudo apt install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        else
            echo "Unsupported operating system. Please install PostgreSQL manually."
            exit 1
        fi
    else
        echo "PostgreSQL is required. Please install it manually and run this script again."
        exit 1
    fi
fi

# Database configuration
DB_NAME="ai_agent_studio"
DB_USER="postgres"
DB_PASSWORD="postgres"

# Create database
echo "Creating database $DB_NAME..."
createdb -U $DB_USER $DB_NAME 2>/dev/null || echo "Database already exists or could not be created"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Prompt for Google API key
    echo "Please enter your Google Gemini API key:"
    read -r google_api_key
    
    # Update the .env file with the API key
    sed -i.bak "s/your-google-api-key/$google_api_key/g" .env
    rm -f .env.bak
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Set up Prisma
echo "Setting up Prisma..."
pnpm prisma generate
pnpm prisma migrate dev --name init

# Seed the database
echo "Seeding the database..."
pnpm prisma db seed

echo "Setup complete!"
echo "You can now run 'pnpm dev' to start the application."
