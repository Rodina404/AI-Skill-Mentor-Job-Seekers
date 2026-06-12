const router = require("express").Router();

router.use('/auth', require('./auth.routes'));
router.use('/resumes', require('./resumes.routes'));
router.use('/matches', require('./matches.routes'));
router.use('/courses', require('./courses.routes'));
router.use('/roadmap', require('./roadmap.routes'));
router.use('/notifications', require('./notifications.routes'));

module.exports = router;
