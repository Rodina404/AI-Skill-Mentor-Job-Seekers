const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobSeekerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

    headline: { type: String, maxlength: 100, trim: true },
    location: { type: String, maxlength: 120, trim: true, index: true },
    targetRole: { type: String, maxlength: 120, trim: true, index: true },

    yearsOfExperience: { type: Number, min: 0, max: 60 },

    currentEmploymentStatus: {
      type: String,
      enum: ["employed", "unemployed", "freelance", "student"],
      default: "unemployed",
      index: true,
    },

    linkedinUrl: { type: String, maxlength: 512 },
    portfolioUrl: { type: String, maxlength: 512 },

    jobReadinessScore: { type: Number, default: 0, min: 0, max: 100, index: true },

    scoreBreakdown: {
      skillAlignment: { type: Number, min: 0, max: 100, default: 0 },
      experience: { type: Number, min: 0, max: 100, default: 0 },
      education: { type: Number, min: 0, max: 100, default: 0 },
    },

    lastScoreUpdate: { type: Date, default: null, index: true },

    preferredJobTypes: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((x) => ["full-time", "part-time", "contract", "remote"].includes(x)),
        message: "Invalid value in preferredJobTypes",
      },
    },
  },
  { timestamps: true, strict: "throw" }
);

JobSeekerProfileSchema.index({ lastScoreUpdate: -1 });

module.exports = mongoose.model("JobSeekerProfile", JobSeekerProfileSchema);
