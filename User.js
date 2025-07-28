import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  company: { type: String, required: true },
  password: { type: String, required: true },
  apiKey: { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  verificationCodeExpires: { type: Date, default: null },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
