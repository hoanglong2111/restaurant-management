# 🔐 OAuth Setup Guide

This guide will help you set up Google and Facebook OAuth authentication for the Restaurant Management System.

## Prerequisites

- Restaurant Management System installed and running
- Google Cloud Console account
- Facebook Developers account

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: **External**
   - App name: `Restaurant Management System`
   - User support email: Your email
   - Developer contact: Your email
6. Application type: **Web application**
7. Name: `Restaurant Management OAuth`
8. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-production-domain.com/api/auth/google/callback` (production)
9. Click **Create**
10. Copy the **Client ID** and **Client Secret**

### 2. Add to Environment Variables

In `.env` file (backend):
```env
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

In `client/.env` file (frontend - optional, for display only):
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select use case: **Consumer**
4. App Display Name: `Restaurant Management`
5. App Contact Email: Your email
6. Click **Create App**

### 2. Configure Facebook Login

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** as platform
4. Site URL: `http://localhost:3000` (development)
5. Go to **Facebook Login** → **Settings**
6. Add Valid OAuth Redirect URIs:
   - `http://localhost:5000/api/auth/facebook/callback` (development)
   - `https://your-production-domain.com/api/auth/facebook/callback` (production)
7. Save changes

### 3. Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy **App ID** and **App Secret**

### 4. Add to Environment Variables

In `.env` file (backend):
```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

In `client/.env` file (frontend - optional):
```env
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
```

---

## Testing OAuth Flow

### 1. Development Testing

1. Start backend: `npm run dev` (from root directory)
2. Start frontend: `cd client && npm start`
3. Navigate to `http://localhost:3000/login`
4. Click **Continue with Google** or **Continue with Facebook**
5. You should be redirected to OAuth provider
6. After authentication, you'll be redirected back to the application

### 2. OAuth Flow Diagram

```
User clicks "Login with Google/Facebook"
           ↓
Frontend redirects to Backend OAuth route
           ↓
Backend redirects to OAuth Provider (Google/Facebook)
           ↓
User authenticates with provider
           ↓
Provider redirects back to callback URL
           ↓
Backend receives user data, creates/updates user
           ↓
Backend generates JWT tokens
           ↓
Backend redirects to Frontend with tokens
           ↓
Frontend stores tokens and fetches user profile
           ↓
User is logged in!
```

---

## Production Deployment

### 1. Update OAuth URLs

Update your `.env` file with production URLs:

```env
# Backend .env
GOOGLE_CALLBACK_URL=https://your-api-domain.com/api/auth/google/callback
FACEBOOK_CALLBACK_URL=https://your-api-domain.com/api/auth/facebook/callback
CLIENT_URL=https://your-frontend-domain.com

# Frontend .env
REACT_APP_API_URL=https://your-api-domain.com
```

### 2. Update OAuth Provider Settings

**Google Cloud Console:**
- Add production callback URL to Authorized redirect URIs
- Add production domain to Authorized JavaScript origins

**Facebook Developers:**
- Add production callback URL to Valid OAuth Redirect URIs
- Add production domain to App Domains
- Set Privacy Policy URL
- Set Terms of Service URL
- Switch app to **Live** mode

---

## Troubleshooting

### "redirect_uri_mismatch" Error

- Ensure the callback URL in your OAuth provider settings EXACTLY matches the one in your `.env`
- Include the protocol (http:// or https://)
- Check for trailing slashes

### "invalid_client" Error

- Verify Client ID and Client Secret are correct
- Check for extra spaces or quotes in `.env` file
- Restart the backend server after changing `.env`

### OAuth Works Locally But Not in Production

- Ensure production callback URLs are added to OAuth provider settings
- Check that CORS is configured correctly in `server.js`
- Verify SSL certificate is valid (OAuth providers require HTTPS in production)

### User Created But Not Logged In

- Check browser console for errors
- Verify JWT_SECRET and JWT_REFRESH_SECRET are set in `.env`
- Check that frontend is receiving tokens in URL parameters

---

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use environment-specific configs** - Different settings for dev/staging/production
3. **Rotate secrets regularly** - Change OAuth secrets every 3-6 months
4. **Enable 2FA** - On your Google and Facebook developer accounts
5. **Monitor OAuth usage** - Check for suspicious activity in provider dashboards
6. **HTTPS in production** - OAuth providers require secure connections
7. **Keep dependencies updated** - Run `npm audit fix` regularly

---

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Passport.js Documentation](http://www.passportjs.org/)

---

## Support

If you encounter issues:

1. Check the backend logs for error messages
2. Verify all environment variables are set correctly
3. Test OAuth flow step by step using browser developer tools
4. Consult provider documentation for specific error codes
