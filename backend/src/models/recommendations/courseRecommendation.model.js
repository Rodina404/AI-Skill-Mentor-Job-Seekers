const mongoose = require("mongoose");
const { Schema } = mongoose;

const CourseRecommendationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "JobSeekerProfile", required: true, index: true },
    skillGapId: { type: Schema.Types.ObjectId, ref: "SkillGap", default: null },
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true, index: true },

    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },

    relevanceScore: { type: Number, required: true, min: 0, max: 100, index: true },
    matchingReason: { type: String, maxlength: 1000 },

    userStatus: { type: String, enum: ["pending", "enrolled", "completed", "dropped"], default: "pending", index: true },

    recommendedAt: { type: Date, default: Date.now, index: true },

    // cache (24h)
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true, strict: "throw" }
);

// TTL: expire exactly at expiresAt
CourseRecommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// prevents duplicate recommendation for same user+gap+course (optional)
CourseRecommendationSchema.index({ userId: 1, skillGapId: 1, courseId: 1 }, { unique: true, partialFilterExpression: { skillGapId: { $type: "objectId" } } });

module.exports = mongoose.model("CourseRecommendation", CourseRecommendationSchema);
