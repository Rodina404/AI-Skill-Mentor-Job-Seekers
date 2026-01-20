const mongoose = require("mongoose");
const { Schema } = mongoose;

const AuthSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true, select: false },
    ipAddress: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: "throw" }
);

// TTL: auto-delete expired sessions
AuthSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AuthSession", AuthSessionSchema);
