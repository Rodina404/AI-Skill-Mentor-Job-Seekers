const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { createJobSchema, updateJobSchema } = require("../validators/jobs.validators");
const { createJob, listRecruiterJobs, updateJob, listPublicJobs, getJobById, deleteJob } = require("../controllers/jobs.controller");

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job posting management
 */

/**
 * @swagger
 * /jobs/recruiter:
 *   post:
 *     summary: Recruiter creates a job post
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *               - jobType
 *               - company
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               jobType:
 *                 type: string
 *                 enum: [full_time, part_time, contract, remote]
 *               company:
 *                 type: string
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Job created
 */

// Public browsing
router.get("/", listPublicJobs);
router.get("/:jobId", getJobById);

// Recruiter endpoints
router.post("/recruiter", authenticate, requireRole("recruiter"), validate(createJobSchema), createJob);
router.get("/recruiter/mine", authenticate, requireRole("recruiter"), listRecruiterJobs);
router.patch("/recruiter/:jobId", authenticate, requireRole("recruiter"), validate(updateJobSchema), updateJob);
router.delete("/recruiter/:jobId", authenticate, requireRole("recruiter"), deleteJob);

module.exports = router;
