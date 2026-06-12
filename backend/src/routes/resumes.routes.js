const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResumeStatus,
  getUserResumes,
  createLearningPath,
  getRecommendedCourses
} = require('../controllers/resumes.controller');
const { protect } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);

// Existing endpoints
router.post('/upload', upload.single('file'), uploadResume);
router.get('/', getUserResumes);
router.get('/:id/status', getResumeStatus);

// Frontend compatibility endpoints
router.post('/analyze', upload.single('resume'), uploadResume);
router.get('/history/:userId', getUserResumes);
router.get('/analysis/:id', getResumeStatus);
router.post('/learning-path', createLearningPath);
router.get('/recommendations/:id', getRecommendedCourses);

module.exports = router;
