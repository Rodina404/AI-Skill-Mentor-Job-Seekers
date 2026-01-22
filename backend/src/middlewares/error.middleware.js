const { ApiError } = require("../utils/apiError");

function errorHandler(err, req, res, _next) {
  // Always log full error (so you see it in terminal)
  console.error("❌ ERROR:", {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Mongoose validation error
  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, v.message])
      ),
    });
  }

  // Mongo duplicate key (unique)
  if (err && (err.code === 11000 || err.code === 11001)) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
      details: err.keyValue || err.keyPattern,
    });
  }

  // Our custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Default fallback
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    details: err?.message || "Unknown error",
  });
}

module.exports = { errorHandler };
