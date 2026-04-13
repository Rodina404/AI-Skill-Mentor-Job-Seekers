const mongoose = require("mongoose");
const { Schema } = mongoose;

const LoginAttemptSchema = new Schema(
  {
    emailAttempted: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    ipAddress: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 },
    status: { type: String, enum: ["success", "fail", "locked"], required: true, index: true },
    reason: {
      type: String,
      enum: ["wrong_password", "no_user", "blocked", "unverified_email"],
      required: true,
    },
    attemptedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false, strict: "throw" }
);

module.exports = mongoose.model("LoginAttempt", LoginAttemptSchema);
