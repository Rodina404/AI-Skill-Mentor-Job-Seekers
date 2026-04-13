const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/resumes", require("./resumes.routes"));
router.use("/jobs", require("./jobs.routes"));
router.use("/job-applications", require("./applications.routes"));
router.use("/matches", require("./matches.routes"));
router.use("/admin", require("./admin.routes"));

module.exports = router;
