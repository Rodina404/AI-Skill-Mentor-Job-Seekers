const mongoose = require("mongoose");
const { Schema } = mongoose;

const SkillGapSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "JobSeekerProfile", required: true, index: true },
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true, index: true },

    gapLevel: { type: Number, required: true, min: 0, max: 100 },
    marketDemand: { type: Number, min: 0, max: 100 },
    userProficiency: { type: Number, min: 0, max: 100 },
    targetProficiency: { type: Number, min: 0, max: 100 },

    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium", index: true },

    detectedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    isResolved: { type: Boolean, default: false, index: true },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: false, strict: "throw" }
);

SkillGapSchema.index({ userId: 1, isResolved: 1, priority: 1 });
SkillGapSchema.index({ userId: 1, skillId: 1, isResolved: 1 });

module.exports = mongoose.model("SkillGap", SkillGapSchema);
