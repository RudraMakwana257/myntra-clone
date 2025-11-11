# Myntra Clone - Deployment Guide

## Environment Setup

### Required Environment Variables

Create a `.env` file in the `myntra/` directory:

```env
EXPO_PUBLIC_API_BASE_URL=https://myntra-clone-fdcv.onrender.com
# or for local development:
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

### Available Environment Variables

- `EXPO_PUBLIC_API_BASE_URL`: Base URL for your backend API

## Local Development

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start the Frontend**:
   ```bash
   cd myntra
   npm install
   npx expo start
   ```

## Web Deployment (Vercel)

### Prerequisites
- Vercel account
- Environment variables configured

### Deployment Steps

1. **Build for Web**:
   ```bash
   cd myntra
   npx expo export --platform web
   ```

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard**:
   - Go to your project in Vercel
   - Settings → Environment Variables
   - Add `EXPO_PUBLIC_API_BASE_URL` with your backend URL

### Alternative: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure build settings:
   - **Build Command**: `cd myntra && npm ci && npx expo export --platform web`
   - **Output Directory**: `myntra/dist`
   - **Install Command**: `cd myntra && npm ci`

## Mobile Deployment

### Android
```bash
cd myntra
npx expo build:android
```

### iOS
```bash
cd myntra
npx expo build:ios
```

## Environment Configuration

The application uses Expo's environment variable system:

- Variables must be prefixed with `EXPO_PUBLIC_`
- They are embedded at build time
- Accessible via `process.env.EXPO_PUBLIC_*`
- Defined in `myntra/constants/env.ts`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **Environment Variables Not Loading**: Verify they are prefixed with `EXPO_PUBLIC_`
3. **Build Failures**: Check that all dependencies are installed correctly

### Vercel Specific
- The `vercel.json` file is already configured for Expo web static export
- Routes are set up to handle SPA routing properly
- Build output is directed to `myntra/dist/`

## Monitoring

- Check Vercel deployment logs for build issues
- Monitor backend API availability
- Test all functionality after deployment