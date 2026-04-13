const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { env } = require("../config/env");
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { uploadResume, listMyResumes, analyzeResume, getResumeAnalysis } = require("../controllers/resumes.controller");

const upload = multer({
  dest: path.join(process.cwd(), "uploads"),
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = ext === ".pdf" || ext === ".docx";
    cb(ok ? null : new Error("Only PDF or DOCX files are allowed"), ok);
  },
});

router.post("/", authenticate, requireRole("job_seeker"), upload.single("file"), uploadResume);
router.get("/", authenticate, requireRole("job_seeker"), listMyResumes);
router.post("/:resumeId/analyze", authenticate, requireRole("job_seeker"), analyzeResume);
router.get("/:resumeId/analysis", authenticate, requireRole("job_seeker"), getResumeAnalysis);

module.exports = router;
