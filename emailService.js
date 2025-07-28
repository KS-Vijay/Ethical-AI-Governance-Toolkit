import nodemailer from 'nodemailer';

// Gmail authentication configuration
let transporter;

// Initialize transporter with Gmail authentication
const initializeTransporter = async () => {
  if (transporter) return transporter;
  
  // Check if we have OAuth2 credentials
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: process.env.GMAIL_ACCESS_TOKEN
        }
      });
      
      // Test the connection
      await transporter.verify();
      console.log('✅ Gmail OAuth2 configured successfully');
      return transporter;
    } catch (error) {
      console.log('⚠️ Gmail OAuth2 failed, trying app password...');
    }
  }
  
  // Fallback to app password method
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      await transporter.verify();
      console.log('✅ Gmail app password configured successfully');
      return transporter;
    } catch (error) {
      console.log('⚠️ Gmail app password failed');
      throw new Error('No valid Gmail authentication method found. Please configure OAuth2 or app password.');
    }
  }
  
  throw new Error('No Gmail credentials found. Please configure EMAIL_USER and either OAuth2 credentials or EMAIL_PASS.');
};

// Generate a random 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const mailTransporter = await initializeTransporter();
    
    const mailOptions = {
      from: `"Ethical AI Toolkit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - Ethical AI Governance Toolkit',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Email Verification</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Ethical AI Governance Toolkit</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up! To complete your registration, please use the verification code below:
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #333; margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">
                ${verificationCode}
              </h3>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 14px;">
                Best regards,<br>
                The Ethical AI Governance Toolkit Team
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('📧 Sending verification email...');
    const result = await mailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    return false;
  }
}; 