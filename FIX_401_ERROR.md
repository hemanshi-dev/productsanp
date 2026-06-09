# Fix: Error 401: invalid_client - No Registered Origin

## The Problem
You're seeing: "Access blocked: Authorization Error - no registered origin" and "Error 401: invalid_client"

This happens when your localhost URL is not registered in Google Cloud Console.

## Quick Fix Steps

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create one if needed)

### Step 2: Navigate to OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID (the one starting with `454487274561-...`)
3. Click on it to edit

### Step 3: Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add these URLs (one per line):

```
http://localhost:5173
http://localhost
http://127.0.0.1:5173
```

**Important:** 
- Do NOT include trailing slashes
- Use `http://` not `https://` for localhost
- Make sure port `5173` matches your Vite dev server port

### Step 4: Add Authorized Redirect URIs (if needed)
In the **Authorized redirect URIs** section, add:

```
http://localhost:5173
http://localhost
```

### Step 5: Save Changes
Click **Save** at the bottom

### Step 6: Wait a Few Minutes
Google's changes can take 1-5 minutes to propagate. Wait a bit before testing again.

### Step 7: Clear Browser Cache
- Clear your browser cache or use an incognito/private window
- Restart your dev server: `npm run dev`

## Verify Your Setup

### Check Your Client ID
Make sure your `.env` file has the correct Client ID:
```env
VITE_GOOGLE_CLIENT_ID=454487274561-g12odnrupfj9hieku5eervd22h4p0mar.apps.googleusercontent.com
```

### Check Your Dev Server Port
Make sure your Vite dev server is running on port 5173. If it's on a different port, add that port to the Authorized JavaScript origins.

## Common Issues

### Issue 1: Wrong Port
- **Problem:** Your dev server is on a different port (e.g., 5174, 3000)
- **Solution:** Check what port Vite is using and add that exact port to Authorized JavaScript origins

### Issue 2: HTTPS vs HTTP
- **Problem:** You added `https://localhost:5173` instead of `http://`
- **Solution:** For localhost, always use `http://` not `https://`

### Issue 3: Trailing Slash
- **Problem:** You added `http://localhost:5173/` with a trailing slash
- **Solution:** Remove the trailing slash: `http://localhost:5173`

### Issue 4: Wrong Client ID
- **Problem:** The Client ID in `.env` doesn't match Google Cloud Console
- **Solution:** Copy the exact Client ID from Google Cloud Console → Credentials

### Issue 5: OAuth Consent Screen Not Configured
- **Problem:** OAuth consent screen is not set up
- **Solution:** 
  1. Go to **APIs & Services** → **OAuth consent screen**
  2. Fill in required fields (App name, email, etc.)
  3. Save and continue through all steps

## Still Not Working?

1. **Double-check the Client ID** in `.env` matches Google Cloud Console exactly
2. **Check browser console** for any additional error messages
3. **Try incognito mode** to rule out browser cache issues
4. **Wait 5 minutes** after making changes in Google Cloud Console
5. **Restart dev server** after changing `.env` file

## Need Help?

If you're still getting the error after following these steps:
1. Take a screenshot of your Google Cloud Console → Credentials page
2. Check the exact error message in the browser console
3. Verify your `.env` file has the correct Client ID

