# AI Agent Studio

A platform for creating, managing, and deploying custom AI agents with PostgreSQL database and Google Gemini integration.

## Features

- Create and manage custom AI agents with specific system instructions
- Configure agent parameters like temperature and max tokens
- Chat with your agents through a user-friendly interface
- Access agents via RESTful API endpoints
- Store conversation history in PostgreSQL database
- Powered by Google Gemini AI

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Google Gemini API key

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-agent-studio
   ```

2. Run the automated setup script:
   ```bash
   ./scripts/setup.sh
   ```
   This script will:
   - Check if PostgreSQL is installed and help install it if needed
   - Create a PostgreSQL database
   - Set up environment variables
   - Install dependencies
   - Run Prisma migrations
   - Seed the database with sample data

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Manual Setup

If you prefer to set up manually:

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` if needed
   - Add your Google Gemini API key to `GOOGLE_API_KEY`

3. Initialize the database:
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev --name init
   pnpm prisma db seed
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses Prisma with PostgreSQL and includes the following models:

- **Agent**: Defines AI agents with system instructions and configuration
- **Conversation**: Stores conversations with agents
- **Message**: Individual messages within conversations

## API Endpoints

- `POST /api/agents`: Create a new agent
- `GET /api/agents`: List all agents
- `POST /api/agents/:id/generate`: Generate content with an agent

## Development

- Run Prisma Studio to manage database:
  ```bash
  pnpm prisma:studio
  ```

- Create a new migration after schema changes:
  ```bash
  pnpm prisma:migrate
  ```

## License

MIT
