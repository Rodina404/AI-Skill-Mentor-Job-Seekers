const path = require("path");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const Resume = require("../models/ai/resume.model.js");

function getFormatFromFile(file) {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  return null;
}

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  if (!req.file) throw new ApiError(400, "Resume file is required");

  const format = getFormatFromFile(req.file);
  if (!format) throw new ApiError(400, "Only PDF or DOCX files are allowed");

  const resume = await Resume.create({
    userId: req.user.id,

    originalName: req.file.originalname,
    fileName: req.file.filename,         // multer’s generated name
    fileUrl: req.file.path,              // local path for now
    fileSize: req.file.size,             // ✅ matches schema
    fileFormat: format,
    mimeType: req.file.mimetype,

    analysisStatus: "pending",
    isAnalyzed: false,
  });

  res.status(201).json({ success: true, data: resume });
});

const listMyResumes = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const docs = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: docs });
});

const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
  if (!resume) throw new ApiError(404, "Resume not found");

  resume.analysisStatus = "processing";
  await resume.save();

  res.json({
    success: true,
    message: "Analysis started",
    data: { resumeId: resume._id, analysisStatus: resume.analysisStatus },
  });
});

const getResumeAnalysis = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");

  const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id }).lean();
  if (!resume) throw new ApiError(404, "Resume not found");

  // You don't have "analysis" field in schema; return extracted fields instead
  res.json({
    success: true,
    data: {
      analysisStatus: resume.analysisStatus,
      isAnalyzed: resume.isAnalyzed,
      extractedSkills: resume.extractedSkills,
      extractedEducation: resume.extractedEducation,
      extractedExperience: resume.extractedExperience,
      extractedContact: resume.extractedContact,
      confidenceScore: resume.confidenceScore,
    },
  });
});

module.exports = { uploadResume, listMyResumes, analyzeResume, getResumeAnalysis };
