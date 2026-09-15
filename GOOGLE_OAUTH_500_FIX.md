# Google OAuth 500 Error - Desktop Sign-In Diagnostic Guide

## Problem
Desktop users see "500. That's an error. There was an error. Please try again later." when clicking "Login with Google" button.

## Root Cause Analysis
The 500 error comes from Firebase/Google OAuth servers, indicating a configuration mismatch between your app and Google Cloud Console settings.

## Required Firebase/Google Cloud Console Setup

### Step 1: Verify OAuth 2.0 Credentials Exist
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project: **hackathon-team-formation**
3. Navigate to **APIs & Services** → **Credentials**
4. Look for "OAuth 2.0 Client IDs" section
5. You should see credentials labeled **"Web application"** or **"Web client"**

❌ **If missing:** Create new OAuth 2.0 Client ID for Web

### Step 2: Configure Authorized Redirect URIs
Your Web OAuth 2.0 Client ID MUST include these URIs:

**Local Development:**
- `http://localhost:5173/`
- `http://localhost:5173`
- `http://127.0.0.1:5173/`

**Production:**
- `https://www.thehackmates.xyz/`
- `https://thehackmates.xyz/`
- `https://www.thehackmates.xyz`

**How to update:**
1. Click on your **Web client ID** in the Credentials page
2. Scroll to **Authorized redirect URIs** section
3. Click **Add URI** for each missing URL above
4. Click **Save**

### Step 3: Verify OAuth Consent Screen is Configured
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Fill out required fields:
   - App name: `HackMates`
   - User support email: `hackmates.tech@gmail.com`
   - Developer contact: Your email
4. Add these **Scopes**:
   - `email`
   - `profile`
   - `openid`
5. Click **Save and Continue**
6. On "Test users" page, add test Google accounts (optional but recommended)

### Step 4: Verify Google Sign-In API is Enabled
1. Go to **APIs & Services** → **Enabled APIs & services**
2. Search for **"Google Identity Services"** or **"Identity Toolkit API"**
3. Both should be **Enabled** (green checkmark)

❌ **If disabled:** Click and press **Enable**

### Step 5: Verify Firebase Authentication Settings
1. Go to Firebase Console: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Select project **hackathon-team-formation**
3. Go to **Authentication** → **Sign-in method**
4. **Google** provider should be **Enabled**
5. Click on **Google** to expand and verify:
   - Status: **Enabled**
   - Web SDK configuration shows your API Key and Project ID

### Step 6: Check CORS Configuration (Optional - Firebase Handles This)
Firebase automatically handles CORS for authorized redirect URIs you configured in Step 2.

If issues persist after adding URIs, check that your API Key's restrictions allow web auth:
1. In Credentials page, find your API Key (not the OAuth Client ID)
2. Click to edit it
3. Under **API restrictions**, ensure `Identity Toolkit API` is allowed

## Testing the Fix

### Desktop Test (Chrome DevTools Console)
1. Open your app at `http://localhost:5173/auth`
2. Open **DevTools** (F12) → **Console** tab
3. Click "Login with Google"
4. **Look for these console messages:**
   - ✅ `Auth method decision: { isMobile: false, isInAppBrowser: false, ... }`
   - ✅ `Using popup method`
   - ✅ `Google sign-in successful: [email]` (success) OR
   - ❌ `Popup error details: { code: 'auth/...', message: '...' }` (if failed)

### What to Check in Console Errors
- **`auth/internal-error`** → OAuth 2.0 Client ID missing or misconfigured
- **`auth/network-request-failed`** → Redirect URI not in authorized list
- **`auth/popup-blocked`** → Browser blocked the popup (not your fault, user's popup blocker)
- **`auth/invalid-api-key`** → API Key restrictions too strict

## Production Deployment Checklist

Before deploying to production:
- [ ] Add `https://www.thehackmates.xyz` and `https://thehackmates.xyz` to authorized redirect URIs
- [ ] Test with real Google account on staging domain
- [ ] Verify OAuth consent screen shows professional branding
- [ ] Add production app URLs to Firebase Security Rules (if applicable)
- [ ] Monitor Firebase Console for authentication errors
- [ ] Set up email alerts for unusual sign-in activity

## Reference Links
- [Firebase Auth Troubleshooting](https://firebase.google.com/docs/auth/troubleshoot-auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)

## Environment Variables
Your current `.env` has:
```
VITE_FIREBASE_API_KEY=AIzaSyDM05tXh8rj_XjcDdYYBKnJmgHvSPteHXA
VITE_FIREBASE_AUTH_DOMAIN=hackathon-team-formation.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hackathon-team-formation
```

These are correct. The issue is in Google Cloud Console configuration, not your app code.

## Need Help?
If 500 error persists after completing all steps:
1. Check browser console (F12) for detailed error code
2. Visit [Firebase Status Dashboard](https://status.firebase.google.com/)
3. Contact: hackmates.tech@gmail.com with error code from console
