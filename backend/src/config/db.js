const mongoose = require("mongoose");
const { env } = require("./env");

async function connectDB() {
  try {
    mongoose.set("strictQuery", true);

    console.log("🟡 Connecting to:", env.mongoUri);
    await mongoose.connect(env.mongoUri);

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
module.exports = { connectDB };
