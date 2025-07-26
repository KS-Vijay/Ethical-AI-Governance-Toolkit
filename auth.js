import express from 'express';
import bcrypt from 'bcryptjs';
import User from './User.js';

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      company,
    });

    await newUser.save();
    return res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
