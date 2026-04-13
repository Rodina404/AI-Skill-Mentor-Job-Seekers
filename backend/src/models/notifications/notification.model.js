const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    type: {
      type: String,
      required: true,
      enum: ["system", "recommendation", "application", "security"],
      index: true,
    },

    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 2000 },

    // optional deep-link
    entityType: { type: String, maxlength: 80, default: null },
    entityId: { type: Schema.Types.ObjectId, default: null },

    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, strict: "throw" }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
