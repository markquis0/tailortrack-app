# TailorTrack Web App

A Next.js web application for tracking suit measurements and preferences. Users can start using the app immediately without registration - an anonymous account is automatically created on first visit.

## Features

- **Anonymous User Support**: No forced registration - users can start tracking measurements immediately
- **Profile Management**: Optional profile personalization with name and email
- **Measurements Tracking**: Comprehensive measurement entry and storage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **localStorage** for token persistence

## Getting Started

### Prerequisites

- **Node.js 20+** (specified in `.nvmrc` and `package.json` engines)
- **npm 10+**
- Backend API running on `http://localhost:5000` (or update `.env.local`)

### Installation

```bash
# If using nvm, automatically use the correct Node.js version
nvm use

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Runtime Environment

The app is configured to use **Node.js 20.x**:

- `.nvmrc` - Specifies Node.js 20 for nvm users
- `.node-version` - Specifies Node.js 20 for other version managers
- `package.json` - Includes `engines` field requiring Node.js >=20.0.0

### Deployment

The app can be deployed to:
- **Vercel** (recommended) - See `vercel.json` for configuration
- **Railway, Render, or similar** - Uses Node.js 20.x runtime
- **Docker** - Use Node.js 20 base image

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable in your deployment platform to point to your backend API.

## Project Structure

```
web/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Dashboard (home page)
│   ├── measurements/       # Measurements entry page
│   └── account/            # Account/profile page
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── SectionHeader.tsx
├── hooks/
│   └── useAuth.tsx         # Authentication hook with anonymous user support
├── lib/
│   └── storage.ts         # localStorage adapter
└── services/
    └── api.ts              # API client
```

## How It Works

1. **First Visit**: When a user first visits the app, an anonymous account is automatically created via the `/auth/anonymous` endpoint
2. **Token Storage**: The JWT token and user data are stored in `localStorage`
3. **Measurements**: Users can immediately start entering and saving measurements
4. **Profile Update**: Users can optionally add their name and email, which converts the anonymous account to a personalized one

## API Integration

The web app uses the same backend API as the mobile app:
- `/auth/anonymous` - Create anonymous user
- `/auth/update-profile` - Update user profile
- `/measurements/me` - Get/update measurements for anonymous users
- `/measurements/:clientId` - Get/update measurements for authenticated users

## Notes

- The app automatically creates an anonymous user on first load if no token exists
- All authentication state is managed through the `useAuth` hook
- Measurements are automatically saved and synced with the backend
