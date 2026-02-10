const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const User = require("../models/User");

// GET /tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignees", "name avatar email");

    // Add commentsCount to each task
    const tasksWithCount = tasks.map((task) => ({
      ...task.toObject(),
      commentsCount: task.comments.length,
    }));

    const todo = tasksWithCount.filter((t) => t.status === "todo");
    const inProgress = tasksWithCount.filter((t) => t.status === "inProgress");
    const underReview = tasksWithCount.filter(
      (t) => t.status === "underReview",
    );
    const completed = tasksWithCount.filter((t) => t.status === "completed");

    res.status(200).json({
      todo,
      inProgress,
      underReview,
      completed,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /tasks/:id - Get a single task with details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate("assignees", "name avatar email")
      .populate("comments.user", "name avatar");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /tasks
router.post("/", async (req, res) => {
  const { title, client, date, assigneeImg, status, assignees } = req.body;

  if (!title || !client) {
    return res.status(400).json({ message: "Title and Client are required" });
  }

  try {
    const newTask = await Task.create({
      title,
      client,
      date: date || "Today",
      assigneeImg: assigneeImg || "https://i.pravatar.cc/150?u=random",
      status: status || "todo",
      assignees: assignees || [],
      progress: 0,
    });

    // Also add an activity log
    await Activity.create({
      user: "Current User",
      action: "created task",
      target: title,
      status: newTask.status,
      time: "Just now",
      project: client,
      avatar: "https://i.pravatar.cc/150?u=jane",
      isSystem: false,
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /tasks/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find task by _id (standard Mongo) or id (if imported data)
    const updatedTask = await Task.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /tasks/:id/assign - Assign a user to a task
router.post("/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already assigned
    if (task.assignees.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User already assigned to this task" });
    }

    task.assignees.push(userId);
    await task.save();

    // Log activity
    await Activity.create({
      user: "Current User",
      action: "assigned user",
      target: task.title,
      status: task.status,
      time: "Just now",
      project: task.client,
      avatar: "https://i.pravatar.cc/150?u=current", // potentially fetch from req.user if auth existed
      isSystem: false,
    });

    const updatedTask = await Task.findById(id).populate(
      "assignees",
      "name avatar email",
    );
    res.json(updatedTask);
  } catch (error) {
    console.error("Assign user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /tasks/:id/assign/:userId - Remove a user from a task
router.delete("/:id/assign/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Remove user from assignees
    task.assignees = task.assignees.filter(
      (assigneeId) => assigneeId.toString() !== userId,
    );
    await task.save();

    // Log activity
    await Activity.create({
      user: "Current User",
      action: "removed user",
      target: task.title,
      status: task.status,
      time: "Just now",
      project: task.client,
      avatar: "https://i.pravatar.cc/150?u=current",
      isSystem: false,
    });

    const updatedTask = await Task.findById(id).populate(
      "assignees",
      "name avatar email",
    );
    res.json(updatedTask);
  } catch (error) {
    console.error("Unassign user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /tasks/:id/assignees - Update the entire list of assignees
router.put("/:id/assignees", async (req, res) => {
  try {
    const { id } = req.params;
    let { userIds } = req.body; // Array of user IDs

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: "userIds must be an array" });
    }

    // Ensure unique IDs
    userIds = [...new Set(userIds)];

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify all users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ message: "One or more users not found" });
    }

    task.assignees = userIds;
    await task.save();

    // Log activity
    await Activity.create({
      user: "Current User",
      action: "updated assignees",
      target: task.title,
      status: task.status,
      time: "Just now",
      project: task.client,
      avatar: "https://i.pravatar.cc/150?u=current",
      isSystem: false,
    });

    const updatedTask = await Task.findById(id).populate(
      "assignees",
      "name avatar email",
    );
    res.json(updatedTask);
  } catch (error) {
    console.error("Update assignees error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /tasks/:id/comments - Add a comment to a task
router.post("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ message: "User ID and text are required" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newComment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    task.comments.push(newComment);
    await task.save();

    // Log activity
    await Activity.create({
      user: user.name,
      action: "commented on",
      target: task.title,
      content: text,
      status: task.status,
      time: "Just now",
      project: task.client,
      avatar: user.avatar || "https://i.pravatar.cc/150?u=current",
      isSystem: false,
    });

    const updatedTask = await Task.findById(id)
      .populate("assignees", "name avatar email")
      .populate("comments.user", "name avatar");

    res.status(201).json(updatedTask);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /tasks/:id/comments - Get comments for a task
router.get("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate(
      "comments.user",
      "name avatar",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task.comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /tasks/:id/archive - Archive or unarchive a task
router.patch("/:id/archive", async (req, res) => {
  try {
    const { id } = req.params;
    const { archived } = req.body; // true to archive, false to unarchive

    if (typeof archived !== "boolean") {
      return res.status(400).json({ message: "archived must be a boolean" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.archived = archived;
    await task.save();

    // Log activity
    await Activity.create({
      user: "Current User",
      action: archived ? "archived task" : "unarchived task",
      target: task.title,
      status: task.status,
      time: "Just now",
      project: task.client,
      avatar: "https://i.pravatar.cc/150?u=current",
      isSystem: false,
    });

    const updatedTask = await Task.findById(id)
      .populate("assignees", "name avatar email")
      .populate("comments.user", "name avatar");

    res.json(updatedTask);
  } catch (error) {
    console.error("Archive task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Also add an activity log
    await Activity.create({
      user: "Current User",
      action: "deleted task",
      target: task.title,
      status: task.status,
      time: "Just now",
      project: task.client,
      avatar: "https://i.pravatar.cc/150?u=current",
      isSystem: false,
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /tasks/:id/review - Update review status of a task
router.patch("/:id/review", async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStatus } = req.body;

    if (
      !reviewStatus ||
      !["pending", "approved", "rejected"].includes(reviewStatus)
    ) {
      return res.status(400).json({
        message: "reviewStatus must be one of: pending, approved, rejected",
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.reviewStatus = reviewStatus;
    await task.save();

    // Log activity
    await Activity.create({
      user: "Current User",
      action: `marked task as ${reviewStatus}`,
      target: task.title,
      status: task.status,
      time: "Just now",
      project: task.client,
      avatar: "https://i.pravatar.cc/150?u=current",
      isSystem: false,
    });

    const updatedTask = await Task.findById(id)
      .populate("assignees", "name avatar email")
      .populate("comments.user", "name avatar");

    res.json(updatedTask);
  } catch (error) {
    console.error("Review task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
