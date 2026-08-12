const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

const matchingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_MATCHING_MAX, 10) || 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many candidate matching requests. Please try again later.",
    },
  },
});

const resumeUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_RESUME_URL_MAX, 10) || 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many resume URL requests. Please try again later.",
    },
  },
});

module.exports = { authLimiter, matchingLimiter, resumeUrlLimiter };
