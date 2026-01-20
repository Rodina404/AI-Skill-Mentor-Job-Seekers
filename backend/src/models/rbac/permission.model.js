const mongoose = require("mongoose");
const { Schema } = mongoose;

const PermissionSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 80,
      index: true,
      // Example: JOB_POSTING:WRITE
      match: /^[A-Z0-9_]+:[A-Z0-9_]+$/,
    },
    description: { type: String, maxlength: 300 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, strict: "throw" }
);

module.exports = mongoose.model("Permission", PermissionSchema);
