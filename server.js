import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import User from "./User.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password, company } = req.body;

  if (!name || !email || !password || !company) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    const newUser = new User({ name, email, password, company });
    await newUser.save();

    return res.status(201).json({ message: "Signup successful!" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error." });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        name: user.name,
        company: user.company,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
// API Key Generator
app.post("/generate-api-key", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // If already generated
    if (user.apiKey) return res.status(200).json({ apiKey: user.apiKey });

    // Else generate
    const apiKey = uuidv4();
    user.apiKey = apiKey;
    await user.save();

    return res.status(200).json({ apiKey });
  } catch (err) {
    console.error("API Key error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Start Server
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
