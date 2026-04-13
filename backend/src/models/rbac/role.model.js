const mongoose = require("mongoose");
const { Schema } = mongoose;

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
      index: true,
    },
    description: { type: String, maxlength: 300 },
    isSystem: { type: Boolean, default: true }, // system roles vs custom roles
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, strict: "throw" }
);

module.exports = mongoose.model("Role", RoleSchema);
