# Deployment Guide (Railway)

This guide will help you deploy the Freedom Fighters backend + frontend to Railway.

## Prerequisites

1. GitHub account (code should be pushed to a repository)
2. MongoDB Atlas account (free tier)
3. Account on your chosen hosting platform

## Step 1: Set Up MongoDB Atlas (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (M0 - Free tier)
4. Wait for cluster to be created (~3-5 minutes)
5. Click "Connect" → "Connect your application"
6. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
7. Replace `<password>` with your database user password
8. Add database name: `mongodb+srv://...@cluster.mongodb.net/freedom-fighters`
9. Go to "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0) for testing

**Save this connection string** - you'll need it for environment variables.

## Step 2: Deploy to Railway (two services)

**Setup:**
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `ff-master-control` repository
5. Create **two services** from the same repo:
   - Backend service (root directory `/`)
   - Frontend service (root directory `/frontend`)

### Backend service (repo root)
**Service settings:**
- **Root directory:** `/`
- **Build command:** `npm ci && npm run build`
- **Start command:** `npm run start:prod`

**Variables (Service → Variables):**
- `MONGODB_URI` = your MongoDB Atlas connection string
- `JWT_SECRET` = generate a random string (e.g., use `openssl rand -base64 32`)
- `JWT_EXPIRES_IN` = `24h`
- `PORT` = Railway sets this automatically, but you can leave it
- (Optional) `NODE_ENV` = `production`
- (Recommended) `CORS_ORIGINS` = `https://<frontend-domain>` (comma-separated list)

**Deploy:**
- Railway auto-deploys on git push
- Get your URL from the "Settings" → "Domains" section

**Cost:** Free tier includes $5/month credit (usually enough for small apps)

---

### Frontend service (`/frontend`)
**Service settings:**
- **Root directory:** `/frontend`
- **Build command:** `npm ci && npm run build`
- **Start command:** `npm run preview -- --host 0.0.0.0 --port $PORT`

**Variables (must be set for Vite builds):**
- `VITE_API_URL` = `https://<backend-domain>/graphql`

**Important note about codegen:**
The frontend `build` runs GraphQL codegen only if `../src/schema.gql` exists. On Railway (frontend service rooted at `/frontend`), the backend schema file is not present, so codegen is skipped and the committed generated client code is used.

## Step 3: Test Your Deployment

1. Once deployed, visit `https://your-app-url/graphql`
2. You should see the GraphQL Playground
3. Test the login mutation:

```graphql
mutation {
  login(input: { username: "admin", password: "password" }) {
    access_token
    user {
      username
      role
    }
  }
}
```

**Note:** You'll need to create a user first. See "Creating Your First Admin User" below.

## Step 4: Create Your First Admin User

Since user creation requires admin access, you'll need to create an admin user manually. You have two options:

### Option A: Use MongoDB Compass (Easiest)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your MongoDB Atlas connection string
3. Navigate to `freedom-fighters` database → `users` collection
4. Insert a document:

```json
{
  "username": "admin",
  "password": "$2b$10$YourHashedPasswordHere",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**To hash a password:**
- Use Node.js: `node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourpassword', 10).then(console.log)"`
- Or use an online bcrypt generator (for testing only)

### Option B: Create a Seed Script (Recommended)

Create `scripts/seed-admin.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  
  try {
    await usersService.create({
      username: 'admin',
      password: 'changeme123',
      role: 'admin',
    });
    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
  
  await app.close();
}

bootstrap();
```

Run locally with MongoDB connection, then use the created user.

## Step 5: Update CORS (If Needed)

If your PWA frontend is on a different domain, update CORS in `src/main.ts`:

```typescript
app.enableCors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true,
});
```

## Troubleshooting

**Build fails:**
- Check that all dependencies are in `package.json`
- Ensure Node.js version is 18+ (platforms usually auto-detect)

**Database connection fails:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string is correct
- Ensure database user password is correct

**GraphQL playground not accessible:**
- Check the URL includes `/graphql` path
- Verify the service is running (check logs)

**401 Unauthorized:**
- Verify JWT_SECRET is set
- Check token is being sent in Authorization header: `Bearer <token>`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/freedom-fighters` |
| `JWT_SECRET` | Secret for JWT signing | Random 32+ character string |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `PORT` | Server port (auto-set by platform) | `3000` |
| `NODE_ENV` | Environment | `production` |

## Next Steps

1. Test all GraphQL queries/mutations
2. Create test teams (name + 4-digit PIN) and use the returned Team GUID to log in
3. Create missions
4. Test mission completion flow
5. Test store credit adjustments
6. Set up your React PWA frontend to connect to this backend

## Event reset (recommended each year)

Because teams are ephemeral and the Team schema requires `teamGuid` + `pinHash`, the safest approach is to **delete all teams before the event** and let kids create new ones during the event.

To delete all teams from the database:

```bash
CONFIRM=true npm run reset:teams
```

Or, from the Admin UI, use the “Delete All Teams” action (admin-only).

## Support

For platform-specific issues:
- Railway: [Docs](https://docs.railway.app/)
 

