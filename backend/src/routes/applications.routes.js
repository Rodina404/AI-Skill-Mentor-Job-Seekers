const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createApplicationSchema, updateApplicationStatusSchema } = require("../validators/applications.validators");
const {
  createApplication,
  listMyApplications,
  listJobApplicationsForRecruiter,
  updateApplicationStatus,
} = require("../controllers/applications.controller");

// job seeker
router.post("/", authenticate, requireRole("job_seeker"), validate(createApplicationSchema), createApplication);
router.get("/mine", authenticate, requireRole("job_seeker"), listMyApplications);
/**
 * @swagger
 * tags:
 *   name: Job Applications
 *   description: Job application workflow
 */

/**
 * @swagger
 * /job-applications:
 *   post:
 *     summary: Job seeker applies to a job
 *     tags: [Job Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobPostingId
 *             properties:
 *               jobPostingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created
 */

// recruiter
router.get("/recruiter/job/:jobId", authenticate, requireRole("recruiter"), listJobApplicationsForRecruiter);
router.patch(
  "/recruiter/:appId/status",
  authenticate,
  requireRole("recruiter"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

module.exports = router;
