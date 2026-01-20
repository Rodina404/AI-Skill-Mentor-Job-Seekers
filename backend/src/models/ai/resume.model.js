const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResumeSchema = new Schema(
  {
    // per guide: RESUME.userId references JOB_SEEKER_PROFILE.userId (same ObjectId value)
    userId: { type: Schema.Types.ObjectId, ref: "JobSeekerProfile", required: true, index: true },

    fileName: { type: String, required: true, maxlength: 255 },
    fileUrl: { type: String, required: true, maxlength: 1024 },

    // SRS: ≤ 5MB
    fileSize: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 },
    fileFormat: { type: String, required: true, enum: ["pdf", "docx"] },

    uploadedAt: { type: Date, default: Date.now, index: true },

    isAnalyzed: { type: Boolean, default: false, index: true },
    analysisStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },

    extractedSkills: { type: [String], default: [] },

    extractedEducation: {
      type: [
        {
          degree: { type: String, maxlength: 120 },
          field: { type: String, maxlength: 120 },
          institution: { type: String, maxlength: 180 },
          year: { type: String, maxlength: 10 },
        },
      ],
      default: [],
    },

    extractedExperience: {
      type: [
        {
          jobTitle: { type: String, maxlength: 150 },
          company: { type: String, maxlength: 150 },
          duration: { type: String, maxlength: 80 },
          description: { type: String, maxlength: 2000 },
        },
      ],
      default: [],
    },

    extractedContact: {
      email: { type: String, maxlength: 254 },
      phone: { type: String, maxlength: 30 },
      location: { type: String, maxlength: 120 },
    },

    confidenceScore: { type: Number, min: 0, max: 100 },

    isCurrent: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, strict: "throw" }
);

ResumeSchema.index({ userId: 1, uploadedAt: -1 });

module.exports = mongoose.model("Resume", ResumeSchema);
