const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSkillSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "JobSeekerProfile", required: true, index: true },
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true, index: true },

    proficiencyLevel: { type: String, required: true, enum: ["beginner", "intermediate", "advanced", "expert"] },
    yearsOfExperience: { type: Number, min: 0, max: 60, default: 0 },
    endorsements: { type: Number, min: 0, default: 0 },
    isVerified: { type: Boolean, default: false },

    source: { type: String, enum: ["manual", "resume_extraction", "assessment"], default: "manual", index: true },
  },
  { timestamps: true, strict: "throw" }
);

UserSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

module.exports = mongoose.model("UserSkill", UserSkillSchema);
