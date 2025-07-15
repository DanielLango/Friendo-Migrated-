# OAuth Setup Guide for Friendo App

This guide explains how to set up real OAuth authentication for Google and Facebook in the Friendo app.

## Current Status
The app currently uses **mock authentication** for demonstration purposes. To enable real OAuth, follow the steps below.

## Google OAuth Setup

### 1. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

### 2. Configure OAuth Client
- **Application type**: Choose based on your platform:
  - For iOS: iOS application
  - For Android: Android application
  - For Web: Web application

### 3. Bundle ID/Package Name
- **iOS**: Use the bundle identifier from `app.json` (`dev.kiki.userapp.6378f569`)
- **Android**: Use the package name from `app.json` (`dev.kiki.userapp.gdhipfgj`)

### 4. Redirect URIs
Add these redirect URIs:
```
friendconnect://oauth
exp://127.0.0.1:19000/--/oauth (for Expo Go)
```

### 5. Update Code
Replace in `utils/authUtils.ts`:
```typescript
const GOOGLE_CLIENT_ID = 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'YOUR_ACTUAL_CLIENT_SECRET'; // Only for web
```

## Facebook OAuth Setup

### 1. Facebook Developers Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing one
3. Add "Facebook Login" product to your app

### 2. Configure Facebook Login
- **Valid OAuth Redirect URIs**: 
  ```
  friendconnect://oauth
  exp://127.0.0.1:19000/--/oauth
  ```

### 3. Bundle ID/Package Name
- **iOS Bundle ID**: `dev.kiki.userapp.6378f569`
- **Android Package Name**: `dev.kiki.userapp.gdhipfgj`
- **Android Key Hash**: Generate using your keystore

### 4. Update Code
Replace in `utils/authUtils.ts`:
```typescript
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';
const FACEBOOK_APP_SECRET = 'YOUR_FACEBOOK_APP_SECRET';
```

## Environment Variables
Create a `.env.local` file (if not exists) and add:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## Testing
1. Test in Expo Go first with development credentials
2. Test on real devices with production credentials
3. Ensure redirect URIs match your app's scheme

## Security Notes
- Never commit client secrets to version control
- Use environment variables for sensitive data
- Implement proper token validation on your backend
- Consider using PKCE for additional security

## Troubleshooting
- **404 Error**: Check redirect URI configuration
- **Invalid Client**: Verify client ID and bundle ID match
- **Scope Issues**: Ensure requested scopes are approved
- **Network Issues**: Check internet connection and API quotas