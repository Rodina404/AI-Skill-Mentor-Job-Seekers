const router = require("express").Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { generateMatches, listMatches } = require("../controllers/matches.controller");

router.post("/recruiter/jobs/:jobId/generate", authenticate, requireRole("recruiter"), generateMatches);
router.get("/recruiter/jobs/:jobId", authenticate, requireRole("recruiter"), listMatches);

module.exports = router;
