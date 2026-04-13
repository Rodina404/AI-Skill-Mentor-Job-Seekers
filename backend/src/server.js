const { app } = require("./app");
const { connectDB } = require("./config/db");
const { env } = require("./config/env");

async function bootstrap() {
  await connectDB();
  app.listen(env.port, () => console.log(`🚀 Server running on port ${env.port}`));
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
