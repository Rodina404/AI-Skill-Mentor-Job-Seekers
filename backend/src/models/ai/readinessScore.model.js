const readinessScoreSchema = new mongoose.Schema({
  jobSeekerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeekerProfile',
    required: true,
    index: true,
  },
  jobPostingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    default: null, // Null for general readiness score
    index: true,
  },
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  scoreBreakdown: {
    type: Object, // Composite: { skillAlignment, experienceMatch, educationMatch }
    required: true,
  },
  areasForImprovement: {
    type: [String], // Multi-valued: Feeds the recommendation engine
    default: [],
  },
  modelVersion: {
    type: String,
    required: true, // Security/Auditing: Critical for AI model governance
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

const ReadinessScore = mongoose.model('ReadinessScore', readinessScoreSchema);