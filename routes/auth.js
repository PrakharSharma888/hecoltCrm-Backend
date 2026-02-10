const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Quick hack: Create default user if none exist, so login works immediately
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        avatar: "https://i.pravatar.cc/150?u=jane",
      });
    }

    const user = await User.findOne({ email, password });

    if (user) {
      // In a real app, do not return the password!
      const { password, ...userWithoutPassword } = user.toObject();
      res.status(200).json({
        user: userWithoutPassword,
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
