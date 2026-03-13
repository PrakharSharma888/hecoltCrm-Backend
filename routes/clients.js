const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const Activity = require("../models/Activity");

// GET /clients
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /clients
router.post("/", async (req, res) => {
  const {
    name,
    email,
    status,
    companyName,
    businessDescription,
    usp,
    targetLocations,
    targetAudience,
    servicesProviding,
    typeOfContent,
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const newClient = await Client.create({
      name,
      email,
      status: status || "Active",
      companyName,
      businessDescription,
      usp,
      targetLocations,
      targetAudience,
      servicesProviding,
      typeOfContent,
    });

    // Add system activity
    await Activity.create({
      user: "System",
      content: `New Client Onboarded: ${name}`,
      time: "Just now",
      isSystem: true,
    });

    res.status(201).json({
      message: "Client created successfully",
      client: newClient,
    });
  } catch (error) {
    console.error("Error in POST /clients:", error);
    res.status(500).json({ message: error.message || "Server error", error });
  }
});

module.exports = router;
