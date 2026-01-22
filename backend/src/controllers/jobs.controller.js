const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const JobPosting = require("../models/jobs/jobPosting.model.js");

const mongoose = require("mongoose");

// quick mapping for your UI values
const JOB_TYPE_MAP = {
  full_time: "full-time",
  part_time: "part-time",
  contract: "contract",
  remote: "remote",
};

const createJob = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const {
    title,
    description,
    location,
    jobType,
    requiredSkills,
    preferredSkills,
    company,
    companyDescription,
    minExperience,
    maxExperience,
    minEducation,
    salaryMin,
    salaryMax,
    salaryCurrency,
    applicationDeadline,
  } = req.body;

  // ✅ required fields check (better errors than mongoose)
  if (!title) throw new ApiError(400, "title is required");
  if (!description) throw new ApiError(400, "description is required");
  if (!location) throw new ApiError(400, "location is required");
  if (!company) throw new ApiError(400, "company is required");

  const mappedJobType = JOB_TYPE_MAP[jobType] || jobType;
  if (!["full-time", "part-time", "contract", "remote"].includes(mappedJobType)) {
    throw new ApiError(400, "jobType must be one of: full_time, part_time, contract, remote");
  }

  // IMPORTANT:
  // Your schema expects requiredSkills as ObjectId[] referencing Skill.
  // For now (to keep APIs working), allow empty array unless you already have Skill docs.
  // If you DO have Skill model + collection, we can map names -> ObjectIds next.
const reqSkills = Array.isArray(requiredSkills) ? requiredSkills : [];
const prefSkills = Array.isArray(preferredSkills) ? preferredSkills : [];

if (reqSkills.length === 0) throw new ApiError(400, "requiredSkills is required");


  // Temporary acceptance:
  // - if they look like ObjectIds, keep them
  // - if they are strings like "Python", ignore for now (or store separately later)
  const toObjectIdArray = (arr) =>
    arr
      .map((v) => String(v).trim())
      .filter((v) => mongoose.Types.ObjectId.isValid(v))
      .map((v) => new mongoose.Types.ObjectId(v));

  const job = await JobPosting.create({
    recruiterId: req.user.id, // NOTE: your schema says RecruiterProfile; see note below
    jobTitle: title,
    jobDescription: description,
    location,
    jobType: mappedJobType,
    company,
    companyDescription,
    minExperience,
    maxExperience,
    minEducation,
    salaryMin,
    salaryMax,
    salaryCurrency,
    applicationDeadline,

    requiredSkills: reqSkills,
    preferredSkills: prefSkills,

    status: "open",
  });

  res.status(201).json({ success: true, data: job });
});


const listRecruiterJobs = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const jobs = await JobPosting.find({ recruiterId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: jobs });
});


const updateJob = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const patch = {};

  if (req.body.title !== undefined) patch.jobTitle = req.body.title;
  if (req.body.description !== undefined) patch.jobDescription = req.body.description;
  if (req.body.location !== undefined) patch.location = req.body.location;
  if (req.body.company !== undefined) patch.company = req.body.company;
  if (req.body.companyDescription !== undefined) patch.companyDescription = req.body.companyDescription;

  if (req.body.jobType !== undefined) {
    const mappedJobType = JOB_TYPE_MAP[req.body.jobType] || req.body.jobType;
    patch.jobType = mappedJobType;
  }

  const job = await JobPosting.findOneAndUpdate(
    { _id: req.params.jobId, recruiterId: req.user.id },
    patch,
    { new: true }
  ).lean();

  if (!job) throw new ApiError(404, "Job not found");
  res.json({ success: true, data: job });
});


// Job seeker browsing
const listPublicJobs = asyncHandler(async (_req, res) => {
  const jobs = await JobPosting.find({ status: "open" }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: jobs });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await JobPosting.findById(req.params.jobId).lean();
  if (!job) throw new ApiError(404, "Job not found");
  res.json({ success: true, data: job });
});

const deleteJob = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const deleted = await JobPosting.findOneAndDelete({
    _id: req.params.jobId,
    recruiterId: req.user.id,
  }).lean();

  if (!deleted) throw new ApiError(404, "Job not found");

  res.json({ success: true, message: "Job deleted" });
});

module.exports = { createJob, listRecruiterJobs, updateJob, listPublicJobs, getJobById, deleteJob };
