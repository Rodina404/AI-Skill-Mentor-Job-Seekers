const mongoose = require("mongoose");
const { Schema } = mongoose;

const CandidateMatchSchema = new Schema(
  {
    jobPostingId: { type: Schema.Types.ObjectId, ref: "JobPosting", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "JobSeekerProfile", required: true, index: true },

    matchScore: { type: Number, required: true, min: 0, max: 100, index: true },
    skillMatchScore: { type: Number, required: true, min: 0, max: 100 },
    experienceMatchScore: { type: Number, required: true, min: 0, max: 100 },
    educationMatchScore: { type: Number, required: true, min: 0, max: 100 },

    matchedSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    missingSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
    matchReason: { type: String, maxlength: 2000 },

    calculatedAt: { type: Date, default: Date.now, index: true },

    // TTL optional (guide mentions 7 days example)
    expiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, strict: "throw" }
);

CandidateMatchSchema.index({ jobPostingId: 1, userId: 1 }, { unique: true });

// TTL only when expiresAt is set
CandidateMatchSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, partialFilterExpression: { expiresAt: { $type: "date" } } }
);

module.exports = mongoose.model("CandidateMatch", CandidateMatchSchema);
