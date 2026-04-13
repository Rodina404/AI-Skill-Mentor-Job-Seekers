const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResumeSchema = new Schema(
  {
    // IMPORTANT: Your controller uses req.user.id (User._id).
    // So this should reference User, not JobSeekerProfile unless you really pass profileId.
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // File metadata
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    fileName: { type: String, required: true, trim: true, maxlength: 255 }, // stored name in uploads folder
    fileUrl: { type: String, required: true, maxlength: 1024 }, // can be local path now, later cloud URL
    fileSize: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 }, // bytes
    fileFormat: { type: String, required: true, enum: ["pdf", "docx"] },
    mimeType: { type: String, required: true },

    uploadedAt: { type: Date, default: Date.now, index: true },

    // Analysis
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
