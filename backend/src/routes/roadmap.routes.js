const express = require('express');
const { getRoadmapByResumeId } = require('../controllers/roadmap.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/:resumeId', authenticate, getRoadmapByResumeId);

module.exports = router;
