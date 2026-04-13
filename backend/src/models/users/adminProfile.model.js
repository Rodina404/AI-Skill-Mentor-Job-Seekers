const mongoose = require("mongoose");
const { Schema } = mongoose;

const AdminProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    adminLevel: { type: String, required: true, enum: ["super_admin", "admin", "moderator"], index: true },
    permissions: { type: [String], default: [] }, // optional if you use RBAC elsewhere
    department: { type: String, maxlength: 120 },
    lastAccessedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: "throw" }
);

module.exports = mongoose.model("AdminProfile", AdminProfileSchema);
