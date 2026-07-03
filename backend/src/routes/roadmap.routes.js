const express = require('express');
const { getRoadmapByResumeId, explainRoadmapCourse } = require('../controllers/roadmap.controller');
const { protect, authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/explain', protect, explainRoadmapCourse);
router.get('/:resumeId', authenticate, getRoadmapByResumeId);

module.exports = router;

