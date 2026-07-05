const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  approveJob,
  getRecommendedJobs
} = require('../controllers/jobs.controller');

// Public routes
router.get('/', getAllJobs);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/:jobId', getJobById);

// Protected routes (require token)
router.post('/', protect, createJob);
router.put('/:jobId', protect, updateJob);
router.delete('/:jobId', protect, deleteJob);
router.post('/:jobId/apply', protect, applyToJob);
router.get('/:jobId/applicants', protect, getJobApplicants);
router.post('/:jobId/approve', protect, approveJob);

module.exports = router;
