const mongoose = require("mongoose");

const clientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    joined: {
      type: String, // Keeping as string to match previous format "YYYY-MM-DD", or could use Date
      default: () => new Date().toISOString().split("T")[0],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Client", clientSchema);
