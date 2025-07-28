# Email Verification Setup Guide

This guide will help you set up email verification for the Ethical AI Governance Toolkit using Gmail authentication.

## Prerequisites

1. A Gmail account
2. Node.js and npm installed
3. MongoDB running locally or a MongoDB Atlas connection

## Authentication Methods

The system supports two Gmail authentication methods:

1. **OAuth2** (Recommended for production) - More secure and reliable
2. **App Password** (Simpler setup) - Good for development and testing

## Setup Steps

### Option 1: App Password (Simpler)

#### 1. Configure Gmail for App Passwords

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification" and enable it
3. Go to "Security" → "App passwords"
4. Generate a new app password for "Mail"
5. Copy the generated 16-character password

#### 2. Create Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Email Configuration (App Password)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ethical-ai-toolkit

# JWT Secret (generate a random string)
JWT_SECRET=your-secret-key-here

# Server Port
PORT=8082
```

### Option 2: OAuth2 (More Secure)

For OAuth2 setup, follow the detailed guide in `OAUTH2_SETUP.md`.

## Test the Setup

1. Start the server: `npm start`
2. Try signing up with a new email address
3. Check your email for the verification code
4. Enter the code in the verification form

## Troubleshooting

### Email Not Sending

1. **Check Gmail Settings**: Make sure 2-Step Verification is enabled
2. **Verify App Password**: Ensure you're using the correct 16-character app password
3. **Check Environment Variables**: Verify EMAIL_USER and EMAIL_PASS are set correctly
4. **Gmail Security**: Some Gmail accounts may require additional security settings

### Verification Code Issues

1. **Code Expiration**: Verification codes expire after 10 minutes
2. **Invalid Code**: Make sure you're entering the exact 6-digit code
3. **Resend Code**: Use the "Resend Code" button if the code doesn't arrive

### MongoDB Connection Issues

1. **Local MongoDB**: Ensure MongoDB is running on localhost:27017
2. **MongoDB Atlas**: Update MONGODB_URI with your Atlas connection string
3. **Network Issues**: Check firewall settings if using remote MongoDB

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique passwords for your email account
- Regularly rotate your app passwords
- Consider using OAuth2 for production deployments

## Production Deployment

For production deployment:

1. Use OAuth2 authentication (see OAUTH2_SETUP.md)
2. Set up proper DNS records for email deliverability
3. Use environment variables for all sensitive configuration
4. Implement rate limiting for email sending
5. Add monitoring and logging for email delivery

## Support

If you encounter issues:

1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Test email configuration with: `node test-email.js`
4. Check MongoDB connection and user creation 