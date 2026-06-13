const router = require("express").Router();

router.use('/auth', require('./auth.routes'));
router.use('/resumes', require('./resumes.routes'));
router.use('/resume', require('./resumes.routes'));
router.use('/matches', require('./matches.routes'));
router.use('/courses', require('./courses.routes'));
router.use('/roadmap', require('./roadmap.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/progress', require('./progress.routes'));
router.use('/skills', require('./skills.routes'));
router.use('/jobs', require('./jobs.routes'));
router.use('/users', require('./users.routes'));

module.exports = router;
