const jobApplicationSchema = new mongoose.Schema({
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeekerProfile',
    required: true,
    index: true,
  },
  jobPostingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'interview', 'rejected', 'hired'],
    default: 'pending',
  },
}, {
  timestamps: { createdAt: 'appliedAt', updatedAt: false }, // Use appliedAt for creation time
});

// Efficiency: Compound index to prevent duplicate applications and speed up lookups
jobApplicationSchema.index({ jobSeekerId: 1, jobPostingId: 1 }, { unique: true });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);