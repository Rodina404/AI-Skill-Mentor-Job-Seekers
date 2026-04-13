const mongoose = require("mongoose");
const { Schema } = mongoose;

const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    action: { type: String, required: true, maxlength: 120, index: true },
    entityType: { type: String, required: true, maxlength: 80, index: true },
    entityId: { type: Schema.Types.ObjectId, default: null },

    // store diffs, not full PII dumps
    oldValues: { type: Schema.Types.Mixed, default: null },
    newValues: { type: Schema.Types.Mixed, default: null },

    ipAddress: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 },

    status: { type: String, enum: ["success", "failure", "warning"], default: "success" },
    errorMessage: { type: String, maxlength: 2000 },

    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false, strict: "throw" }
);

AuditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
