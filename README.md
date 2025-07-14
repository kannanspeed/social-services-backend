# Social Services Backend - Render Deployment

## Overview
This is the backend API for the Social Services Booking App, designed to work with both web and mobile (React Native) clients.

## Features
- **User Management**: Registration and authentication for customers
- **Worker Management**: Registration and authentication for service providers
- **Job Management**: Create, accept, track, and complete service requests
- **Real-time Updates**: Job status tracking and notifications
- **OTP Verification**: Secure job start verification
- **Rating System**: Customer feedback and worker ratings
- **Mobile-Optimized**: Enhanced CORS support for React Native apps

## Services Supported
- Body Guard
- Confidence Coach
- Fake Relationship
- Party Booster
- Look Rich Package
- Make Ex Jealous Package

## API Endpoints

### Authentication
- `POST /api/login` - User/Worker login
- `POST /api/users` - Register new user
- `POST /api/workers` - Register new worker

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `GET /api/jobs/worker/:workerId` - Get jobs for worker
- `GET /api/jobs/customer/:customerId` - Get jobs for customer
- `POST /api/jobs/:id/accept` - Accept job
- `POST /api/jobs/:id/arrive` - Worker arrives (generates OTP)
- `POST /api/jobs/:id/start` - Start work (verify OTP)
- `POST /api/jobs/:id/complete` - Complete work
- `POST /api/jobs/:id/rate` - Rate worker

### Utilities
- `GET /api/health` - Health check
- `DELETE /api/clear` - Clear all data (testing only)

## Deployment to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account

### Step 2: Deploy Backend
1. In Render dashboard, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `social-services-backend`
   - **Root Directory**: `render-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Environment Variables
No additional environment variables needed for basic setup.

### Step 4: Test Deployment
Once deployed, test the health endpoint:
```
https://your-service-name.onrender.com/api/health
```

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
npm install
npm start
```

The server will run on `http://localhost:3001`

### Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Data Storage
- Data is stored in JSON files in the `./data/` directory
- Files: `users.json`, `workers.json`, `jobs.json`
- For production, consider migrating to a database

## CORS Configuration
The backend is configured to work with:
- Web applications (localhost, GitHub Pages, Vercel)
- Mobile applications (React Native/Expo)
- All common development environments

## Mobile App Integration
The mobile app should update its API base URL to point to your Render deployment:

```typescript
// In mobile app's apiService.ts
const API_BASE_URL = 'https://your-service-name.onrender.com';
```

## Architecture
```
Mobile App (React Native) ←→ Render Backend (Express.js) ←→ JSON Files
Web App (Next.js)         ←→ Render Backend (Express.js) ←→ JSON Files
```

## Support
For issues or questions, check the API health endpoint and server logs in Render dashboard. 