const mongoose = require("mongoose");
const { Schema } = mongoose;

const LearningProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "JobSeekerProfile", required: true, index: true },
    courseRecommendationId: { type: Schema.Types.ObjectId, ref: "CourseRecommendation", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    skillId: { type: Schema.Types.ObjectId, ref: "Skill", required: true, index: true },

    enrollmentDate: { type: Date, default: Date.now },
    completionPercentage: { type: Number, default: 0, min: 0, max: 100 },

    status: { type: String, enum: ["in_progress", "completed", "dropped", "paused"], default: "in_progress", index: true },

    certificateUrl: { type: String, maxlength: 1024 },
    completionDate: { type: Date, default: null },

    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: true, strict: "throw" }
);

LearningProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("LearningProgress", LearningProgressSchema);
