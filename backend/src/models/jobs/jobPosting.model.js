const mongoose = require("mongoose");
const { Schema } = mongoose;

const JobPostingSchema = new Schema(
  {
    recruiterId: { type: Schema.Types.ObjectId, ref: "RecruiterProfile", required: true, index: true },

    jobTitle: { type: String, required: true, maxlength: 100, trim: true, index: true },
    jobDescription: { type: String, required: true, maxlength: 20000 },

    requiredSkills: [{ type: Schema.Types.ObjectId, ref: "Skill", required: true }],
    preferredSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],

    minExperience: { type: Number, min: 0, max: 60 },
    maxExperience: { type: Number, min: 0, max: 60 },

    minEducation: { type: String, enum: ["high_school", "bachelor", "master", "phd"] },

    location: { type: String, required: true, maxlength: 120, index: true },
    jobType: { type: String, required: true, enum: ["full-time", "part-time", "contract", "remote"], index: true },

    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    salaryCurrency: { type: String, default: "USD", maxlength: 8 },

    company: { type: String, required: true, maxlength: 150, index: true },
    companyDescription: { type: String, maxlength: 2000 },

    applicationDeadline: { type: Date, default: null },

    status: { type: String, enum: ["open", "closed", "on_hold", "filled"], default: "open", index: true },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: "throw" }
);

JobPostingSchema.index({ requiredSkills: 1 }); // multikey
JobPostingSchema.index({ recruiterId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("JobPosting", JobPostingSchema);
