const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /users - Fetch all users
router.get("/", async (req, res) => {
  try {
    // Fetch all users but exclude the password field
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
