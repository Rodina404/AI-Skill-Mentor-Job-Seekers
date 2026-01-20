const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI-Mentor Backend is running!");
});

// Add your routes and error handling middleware here later
require("dotenv").config();
const { connectDB } = require("./src/config/db");

connectDB()
  .then(() => app.listen(3000, () => console.log("API running on 3000")))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

module.exports = app;