# Freedom Fighters Frontend

React PWA frontend for Freedom Fighters event management system.

## Setup Instructions

### 1. Install Dependencies (if not already done)
```bash
cd frontend
npm install
```

### 2. Initialize shadcn/ui
```bash
npx shadcn@latest init
```
When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### 3. Install shadcn/ui Components
```bash
npx shadcn@latest add button input card dialog toast badge avatar table form label select textarea
```

### 4. Set Up Environment Variables
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=https://ff-master-control-production.up.railway.app/graphql
```

### 5. Generate GraphQL Types
```bash
npm run codegen
```
This reads the GraphQL schema from `../src/schema.gql` and generates TypeScript types.

### 6. Start Development Server
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run codegen` - Generate GraphQL types
- `npm run codegen:watch` - Watch and regenerate GraphQL types

## Project Structure

```
frontend/
├── src/
│   ├── features/          # Feature-based organization
│   │   ├── auth/         # Authentication
│   │   ├── teams/        # Team management
│   │   ├── missions/     # Mission management
│   │   ├── store/        # Store/credits
│   │   └── dashboard/    # Main dashboard
│   ├── lib/              # Utilities and shared code
│   │   ├── graphql/      # GraphQL client and queries
│   │   └── utils.ts      # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── components/       # Shared components (shadcn/ui)
│   └── test/             # Test setup
├── public/               # Static assets
└── dist/                 # Build output
```

## Features

- ✅ React 19 with TypeScript
- ✅ TanStack Query for data fetching
- ✅ GraphQL Code Generator for type-safe queries
- ✅ Tailwind CSS + shadcn/ui for styling
- ✅ PWA support with Vite PWA plugin
- ✅ NFC reading support (Android)
- ✅ Vitest for testing
- ✅ Authentication with JWT

## Next Steps

1. Complete shadcn/ui setup (run commands above)
2. Generate GraphQL types (`npm run codegen`)
3. Build out feature components (teams, missions, store)
4. Test NFC reading on Android device
5. Deploy to Vercel
