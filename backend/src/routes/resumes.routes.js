const express = require('express');
const router = express.Router();
const { uploadResume, getResumeStatus, getUserResumes } = require('../controllers/resumes.controller');
const { protect } = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);
router.post('/upload', upload.single('file'), uploadResume);
router.get('/', getUserResumes);
router.get('/:id/status', getResumeStatus);

module.exports = router;
