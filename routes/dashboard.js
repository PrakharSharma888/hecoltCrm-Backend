const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Task = require("../models/Task");
const Activity = require("../models/Activity");

// GET /dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    const clients = await Client.countDocuments();
    const activeTasks = await Task.countDocuments({
      status: { $ne: "completed" },
    });
    const pendingDeadlines = await Task.countDocuments({
      date: { $regex: "Oct" },
    }); // Keeping the regex logic for now as 'date' is string

    res.status(200).json({
      clients,
      activeTasks,
      pendingDeadlines,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /dashboard/activity
router.get("/activity", async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
