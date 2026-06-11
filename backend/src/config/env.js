require("dotenv").config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
};

if (!env.mongoUri) {
  console.warn("⚠️ Warning: MONGO_URI is not set in .env. MongoDB features will be disabled.");
}
if (!env.jwtAccessSecret) {
  console.warn("⚠️ Warning: JWT_ACCESS_SECRET is not set in .env. Defaulting or JWT auth may fail.");
}

module.exports = { env };
