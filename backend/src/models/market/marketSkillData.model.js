const mongoose = require("mongoose");
const { Schema } = mongoose;

const MarketSkillDataSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true, unique: true, index: true },

    demandScore: { type: Number, required: true, min: 0, max: 100, index: true },
    trendingScore: { type: Number, min: 0, max: 100 },

    averageSalary: { type: Number, min: 0 },
    jobOpenings: { type: Number, min: 0 },
    growthRate: { type: Number }, // can be negative

    dataSource: { type: String, maxlength: 120 },
    lastUpdatedAt: { type: Date, default: Date.now, index: true },
    nextUpdateAt: { type: Date, default: null },
  },
  { timestamps: true, strict: "throw" }
);

module.exports = mongoose.model("MarketSkillData", MarketSkillDataSchema);
