const mongoose = require("mongoose");

const clientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    companyName: {
      type: String,
    },
    businessDescription: {
      type: String,
    },
    usp: {
      type: String,
    },
    targetLocations: {
      type: String,
    },
    targetAudience: {
      type: String,
    },
    servicesProviding: {
      type: [String],
    },
    typeOfContent: {
      type: String,
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
