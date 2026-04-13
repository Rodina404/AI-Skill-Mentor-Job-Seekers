const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");

const User = require("../models/users/user.model");
const JobPosting = require("../models/jobs/jobPosting.model");
const JobApplication = require("../models/jobs/jobApplication.model");
const Resume = require("../models/ai/resume.model");

// -------------------- USERS --------------------

const listUsers = asyncHandler(async (req, res) => {
  const { role, isActive, q, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;

  if (q) {
    filter.email = { $regex: q, $options: "i" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .select("email role isActive createdAt updatedAt") // never return password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  res.json({
    success: true,
    data: {
      total,
      page: Number(page),
      limit: Number(limit),
      users,
    },
  });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // prevent admin from deactivating themselves accidentally
  if (String(userId) === String(req.user.id)) {
    throw new ApiError(400, "You cannot deactivate your own account");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  )
    .select("email role isActive createdAt")
    .lean();

  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, message: "User deactivated", data: user });
});

// -------------------- JOBS (MODERATION) --------------------

const listAllJobs = asyncHandler(async (req, res) => {
  const { status, q, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  if (q) {
    filter.$or = [
      { jobTitle: { $regex: q, $options: "i" } },
      { company: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [total, jobs] = await Promise.all([
    JobPosting.countDocuments(filter),
    JobPosting.find(filter)
      .select("jobTitle company location jobType status recruiterId createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  res.json({
    success: true,
    data: {
      total,
      page: Number(page),
      limit: Number(limit),
      jobs,
    },
  });
});

const deleteJobModeration = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const deleted = await JobPosting.findByIdAndDelete(jobId).lean();
  if (!deleted) throw new ApiError(404, "Job not found");

  // Optional: also delete related applications (moderation cleanup)
  await JobApplication.deleteMany({ jobPostingId: deleted._id });

  res.json({ success: true, message: "Job deleted by admin moderation" });
});

// -------------------- STATS --------------------

const getSystemStats = asyncHandler(async (_req, res) => {
  const [
    usersTotal,
    usersActive,
    jobsTotal,
    jobsOpen,
    applicationsTotal,
    resumesTotal,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    JobPosting.countDocuments({}),
    JobPosting.countDocuments({ status: "open" }),
    JobApplication.countDocuments({}),
    Resume.countDocuments({}),
  ]);

  res.json({
    success: true,
    data: {
      usersTotal,
      usersActive,
      jobsTotal,
      jobsOpen,
      applicationsTotal,
      resumesTotal,
    },
  });
});

module.exports = {
  listUsers,
  deactivateUser,
  listAllJobs,
  deleteJobModeration,
  getSystemStats,
};
