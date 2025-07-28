# Gmail OAuth2 Setup Guide

This guide will help you set up Gmail OAuth2 authentication for the email verification system. OAuth2 is more secure and reliable than app passwords.

## Prerequisites

1. A Gmail account
2. Google Cloud Console access
3. Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth2 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Desktop application" as the application type
4. Give it a name (e.g., "Ethical AI Toolkit Email")
5. Click "Create"
6. Download the JSON file with your credentials

## Step 3: Get Authorization Code

1. Open your browser and go to this URL (replace with your client ID):
```
https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://mail.google.com/&response_type=code
```

2. Authorize the application
3. Copy the authorization code from the page

## Step 4: Get Refresh Token

Create a file called `get-refresh-token.js`:

```javascript
import fetch from 'node-fetch';

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const AUTHORIZATION_CODE = 'YOUR_AUTHORIZATION_CODE';

async function getRefreshToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: AUTHORIZATION_CODE,
      grant_type: 'authorization_code',
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    }),
  });

  const data = await response.json();
  console.log('Refresh Token:', data.refresh_token);
  console.log('Access Token:', data.access_token);
}

getRefreshToken();
```

Run this script to get your refresh token:
```bash
node get-refresh-token.js
```

## Step 5: Update Environment Variables

Update your `.env` file with the OAuth2 credentials:

```env
# Email Configuration (OAuth2)
EMAIL_USER=your-gmail@gmail.com
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_ACCESS_TOKEN=your-access-token

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ethical-ai-toolkit

# JWT Secret
JWT_SECRET=your-secret-key-here

# Server Port
PORT=8082
```

## Step 6: Test the Setup

Run the test script to verify OAuth2 is working:

```bash
node test-email.js
```

## Alternative: Automated OAuth2 Setup

For easier setup, you can use the Google OAuth2 Playground:

1. Go to [Google OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Click the settings icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret
5. Close settings
6. Select "Gmail API v1" → "https://mail.google.com/"
7. Click "Authorize APIs"
8. Click "Exchange authorization code for tokens"
9. Copy the refresh token

## Troubleshooting

### Common Issues:

1. **"Invalid client" error**: Make sure your client ID and secret are correct
2. **"Invalid authorization code"**: The code expires quickly, generate a new one
3. **"Access denied"**: Make sure you've enabled the Gmail API
4. **"Invalid scope"**: Use the exact scope: `https://mail.google.com/`

### Security Notes:

- Never commit your `.env` file to version control
- Keep your refresh token secure
- Rotate your credentials regularly
- Use environment-specific configurations

## Benefits of OAuth2

- **More Secure**: No need to store app passwords
- **More Reliable**: Less likely to be blocked by Google
- **Better Control**: Can revoke access without changing passwords
- **Production Ready**: Recommended for production applications

## Fallback Strategy

The email service is designed with a fallback strategy:

1. **OAuth2** (most secure) → 
2. **App Password** (if OAuth2 fails)

This ensures your application uses only Gmail authentication methods, maintaining security and reliability. 