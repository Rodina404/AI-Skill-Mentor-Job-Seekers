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

module.exports = app;