# ff-master-control
NestJS GraphQL backend for Freedom Fighters event management system.

## Overview

Backend system for managing teams, missions, credits, and team-based mission completions for the Freedom Fighters youth group event.

## Features

- GraphQL API with code-first schema generation
- MongoDB database with Mongoose
- JWT authentication with role-based authorization
- Role-based access control (admin, mission-leader, store)
- Team GUID + 4-digit PIN team login (kid-friendly)
- Mission completion tracking with credit awards
- Store credit management
- Admin override capabilities

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret.

4. Start the development server:
```bash
npm run start:dev
```

The GraphQL playground will be available at `http://localhost:3000/graphql`.

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time (e.g., "24h")

## GraphQL API

The API provides queries and mutations for:
- Authentication (login)
- User management (admin only)
- Team management (team creation, team GUID lookup, team login)
- Mission management (list missions, complete missions, override completions)
- Store operations (credit adjustments)
- Configuration management (required missions for final challenge)

## Deployment

For deployment to Railway, see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick start:
1. Set up MongoDB Atlas (free tier)
2. Push code to GitHub
3. Deploy to Railway
4. Configure environment variables
5. Test your GraphQL endpoint
