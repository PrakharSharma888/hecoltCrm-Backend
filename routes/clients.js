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

// DELETE /clients/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Add system activity
    await Activity.create({
      user: "System",
      content: `Client Deleted: ${client.name}`,
      time: "Just now",
      isSystem: true,
    });

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /clients/:id:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /clients/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedClient = await Client.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Add system activity if status changed
    if (updates.status) {
      await Activity.create({
        user: "System",
        content: `Client ${updatedClient.name} status updated to ${updates.status}`,
        time: "Just now",
        isSystem: true,
      });
    } else {
      await Activity.create({
        user: "System",
        content: `Client Details Updated: ${updatedClient.name}`,
        time: "Just now",
        isSystem: true,
      });
    }

    res.json(updatedClient);
  } catch (error) {
    console.error("Error in PATCH /clients/:id:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
