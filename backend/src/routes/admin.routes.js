const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { validate } = require("../middlewares/validate.middleware");

const {
  listUsers,
  deactivateUser,
  listAllJobs,
  deleteJobModeration,
  getSystemStats,
} = require("../controllers/admin.controller");

const {
  listUsersSchema,
  deactivateUserSchema,
  listAllJobsSchema,
  deleteJobSchema,
} = require("../validators/admin.validators");

// Users
router.get("/users", authenticate, requireRole("admin"), validate(listUsersSchema), listUsers);
router.patch(
  "/users/:userId/deactivate",
  authenticate,
  requireRole("admin"),
  validate(deactivateUserSchema),
  deactivateUser
);

// Jobs moderation
router.get("/jobs", authenticate, requireRole("admin"), validate(listAllJobsSchema), listAllJobs);
router.delete(
  "/jobs/:jobId",
  authenticate,
  requireRole("admin"),
  validate(deleteJobSchema),
  deleteJobModeration
);

// Stats
router.get("/stats", authenticate, requireRole("admin"), getSystemStats);

module.exports = router;
