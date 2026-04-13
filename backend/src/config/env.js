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

if (!env.mongoUri) throw new Error("Missing MONGO_URI in .env");
if (!env.jwtAccessSecret) throw new Error("Missing JWT_ACCESS_SECRET in .env");

module.exports = { env };
