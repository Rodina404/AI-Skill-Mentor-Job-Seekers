const mongoose = require("mongoose");
const { Schema } = mongoose;

const SkillSchema = new Schema(
  {
    skillName: { type: String, required: true, unique: true, trim: true, maxlength: 120, index: true },
    category: { type: String, required: true, trim: true, maxlength: 80, index: true },
    description: { type: String, maxlength: 500 },

    // helpful for analytics; optional
    marketDemand: { type: Number, min: 0, max: 100 },
    trendingScore: { type: Number, min: 0, max: 100 },

    aliases: { type: [String], default: [] }, // abbreviations/synonyms
    relatedSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
  },
  { timestamps: true, strict: "throw" }
);

SkillSchema.index({ category: 1, skillName: 1 });

module.exports = mongoose.model("Skill", SkillSchema);
