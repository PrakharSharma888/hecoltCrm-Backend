const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb+srv://prakharentp2002_db_user:jinXvfyeH7WrGk7r@hecoltcrm.fbfkuhy.mongodb.net/?appName=hecoltCrm",
      {},
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
