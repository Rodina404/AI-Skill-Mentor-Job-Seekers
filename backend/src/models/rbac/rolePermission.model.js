const mongoose = require("mongoose");
const { Schema } = mongoose;

const RolePermissionSchema = new Schema(
  {
    roleId: { type: Schema.Types.ObjectId, ref: "Role", required: true, index: true },
    permissionId: { type: Schema.Types.ObjectId, ref: "Permission", required: true, index: true },

    // audit-ish metadata
    grantedBy: { type: Schema.Types.ObjectId, ref: "AdminProfile", default: null },
    grantedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, strict: "throw" }
);

// prevent duplicates
RolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

module.exports = mongoose.model("RolePermission", RolePermissionSchema);
