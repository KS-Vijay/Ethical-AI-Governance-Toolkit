import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './User.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function verifyUser(email) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }
    
    console.log(`\n📋 Current status for: ${email}`);
    console.log(`✅ Verified: ${user.isVerified}`);
    
    if (user.isVerified) {
      console.log(`\n✅ User is already verified!`);
      return;
    }
    
    // Manually verify the user
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();
    
    console.log(`\n✅ User ${email} has been manually verified!`);
    console.log(`🔓 They can now login successfully.`);
    
  } catch (error) {
    console.error('❌ Error verifying user:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node verify-user.js <email>');
  console.log('Example: node verify-user.js user@example.com');
  process.exit(1);
}

verifyUser(email); 