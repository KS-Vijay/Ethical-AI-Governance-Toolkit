import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getRefreshToken() {
  console.log('🔐 Gmail OAuth2 Setup Helper\n');
  
  // Get user input
  const clientId = await question('Enter your Gmail Client ID: ');
  const clientSecret = await question('Enter your Gmail Client Secret: ');
  const authCode = await question('Enter the authorization code from the OAuth URL: ');
  
  console.log('\n🔄 Getting refresh token...\n');
  
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('❌ Error:', data.error);
      console.error('Description:', data.error_description);
      return;
    }
    
    console.log('✅ Success! Here are your tokens:\n');
    console.log('📧 Refresh Token:', data.refresh_token);
    console.log('🔑 Access Token:', data.access_token);
    console.log('\n📝 Add these to your .env file:');
    console.log(`GMAIL_REFRESH_TOKEN=${data.refresh_token}`);
    console.log(`GMAIL_ACCESS_TOKEN=${data.access_token}`);
    
  } catch (error) {
    console.error('❌ Error getting tokens:', error.message);
  }
  
  rl.close();
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

getRefreshToken(); 