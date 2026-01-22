const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const JobApplication = require("../models/jobs/jobApplication.model.js");
const JobPosting = require("../models/jobs/jobPosting.model.js");

const createApplication = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const { jobPostingId, resumeId } = req.body;

  const job = await JobPosting.findById(jobPostingId).lean();
  if (!job) throw new ApiError(404, "Job not found");
  if (job.status !== "open") throw new ApiError(400, "Job is not open");

  const exists = await JobApplication.findOne({ jobPostingId, jobSeekerId: req.user.id }).lean();
  if (exists) throw new ApiError(409, "Already applied to this job");

  const app = await JobApplication.create({
    jobPostingId,
    jobSeekerId: req.user.id,
    resumeId: resumeId || null,
    status: "pending",
  });

  res.status(201).json({ success: true, data: app });
});

const listMyApplications = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const apps = await JobApplication.find({ jobSeekerId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: apps });
});

const listJobApplicationsForRecruiter = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const job = await JobPosting.findOne({ _id: req.params.jobId, recruiterId: req.user.id }).lean();
  if (!job) throw new ApiError(404, "Job not found");

  const apps = await JobApplication.find({ jobPostingId: job._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: apps });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const app = await JobApplication.findById(req.params.appId);
  if (!app) throw new ApiError(404, "Application not found");

  const job = await JobPosting.findOne({ _id: app.jobPostingId, recruiterId: req.user.id }).lean();
  if (!job) throw new ApiError(403, "Forbidden");

  app.status = req.body.status;
  if (req.body.notes) app.notes = req.body.notes;
  await app.save();

  res.json({ success: true, data: app });
});

module.exports = {
  createApplication,
  listMyApplications,
  listJobApplicationsForRecruiter,
  updateApplicationStatus,
};
