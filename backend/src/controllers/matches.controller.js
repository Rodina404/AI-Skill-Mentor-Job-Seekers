const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const CandidateMatch = require("../models/jobs/candidateMatch.model.js");
const JobPosting = require("../models/jobs/jobPosting.model.js");

const generateMatches = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const job = await JobPosting.findOne({ _id: req.params.jobId, recruiterId: req.user.id }).lean();
  if (!job) throw new ApiError(404, "Job not found");

  // TODO: call AI microservice to compute matches, then save/upsert CandidateMatch docs
  res.json({ success: true, message: "Match generation triggered" });
});

const listMatches = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const matches = await CandidateMatch.find({ jobPostingId: req.params.jobId })
    .sort({ score: -1 })
    .lean();

  res.json({ success: true, data: matches });
});

module.exports = { generateMatches, listMatches };
