# Google OAuth Setup Guide

## Fixing 403 Forbidden Error

The 403 error occurs when your Google OAuth credentials are not properly configured in Google Cloud Console. Follow these steps:

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)

### Step 2: Enable Google Identity Services API

1. Go to **APIs & Services** > **Library**
2. Search for "Google Identity Services API"
3. Click on it and press **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in the required information:
   - **App name**: ProductSnap AI
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. Add scopes (if needed):
   - `email`
   - `profile`
   - `openid`
6. Click **Save and Continue**
7. Add test users (if app is in testing mode):
   - Add your email address
8. Click **Save and Continue**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: ProductSnap AI Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost
     http://localhost/shuchiaistudio
     ```
   - **Authorized redirect URIs** (if needed):
     ```
     http://localhost:5173
     http://localhost/shuchiaistudio
     ```
5. Click **Create**
6. Copy the **Client ID** (not the Client Secret for frontend)

### Step 5: Update Your .env File

Update your `.env` file with the Client ID:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### Step 6: Restart Dev Server

After updating `.env`, restart your Vite dev server:

```bash
npm run dev
```

### Common Issues:

1. **403 Forbidden**: 
   - Make sure "Google Identity Services API" is enabled
   - Check that your localhost URL is in "Authorized JavaScript origins"
   - Verify the Client ID is correct

2. **Popup Blocked**:
   - Allow popups in your browser
   - Check browser console for errors

3. **Invalid Client**:
   - Double-check the Client ID in `.env`
   - Make sure you're using the Web application Client ID (not iOS/Android)

### Testing in Production:

When deploying to production, add your production domain to:
- **Authorized JavaScript origins**
- **Authorized redirect URIs**

Example:
```
https://yourdomain.com
```

