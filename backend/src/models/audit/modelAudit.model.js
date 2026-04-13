const mongoose = require("mongoose");
const { Schema } = mongoose;

const ModelAuditSchema = new Schema(
  {
    modelName: { type: String, required: true, maxlength: 120, index: true },
    modelVersion: { type: String, required: true, maxlength: 60, index: true },

    auditType: { type: String, required: true, enum: ["accuracy", "fairness", "bias", "performance"] },
    auditDate: { type: Date, default: Date.now, index: true },

    accuracy: { type: Number, min: 0, max: 100 },
    precisionScore: { type: Number, min: 0, max: 100 },
    recallScore: { type: Number, min: 0, max: 100 },

    biasMetrics: { type: Schema.Types.Mixed, default: null },
    fairnessScore: { type: Number, min: 0, max: 100 },

    auditFindings: { type: String, maxlength: 5000 },
    performanceMetrics: { type: Schema.Types.Mixed, default: null },

    approvedBy: { type: Schema.Types.ObjectId, ref: "AdminProfile", default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true, strict: "throw" }
);

ModelAuditSchema.index({ modelName: 1, modelVersion: 1, auditDate: -1 });

module.exports = mongoose.model("ModelAudit", ModelAuditSchema);
