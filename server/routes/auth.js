import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import protect from "../middleware/protect.js";

const router = express.Router();

// Helper to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // token expires in 7 days
  });
};

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    console.log("Register hit, body:", req.body);
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.log("Error caught:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Use our custom matchPassword method from the model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me — protected route, returns logged in user's data
router.get("/me", protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;