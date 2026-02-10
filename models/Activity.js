const mongoose = require("mongoose");

const activitySchema = mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
    },
    action: {
      type: String,
    },
    content: {
      type: String,
    },
    target: {
      type: String,
    },
    status: {
      type: String,
    },
    time: {
      type: String,
      default: "Just now", // Ideally this would be relative time calculated from createdAt
    },
    project: {
      type: String,
    },
    avatar: {
      type: String,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Activity", activitySchema);
