const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { matchingLimiter, resumeUrlLimiter } = require('../middlewares/rateLimit.middleware');
const {
  getAllJobs,
  getRecruiterJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  approveJob,
  getRecommendedJobs,
  matchCandidatesForJob,
  getCandidateMatchesForJob,
  getCandidateResumeUrl,
} = require('../controllers/jobs.controller');

// Public routes
router.get('/', getAllJobs);
router.get('/recommended', protect, getRecommendedJobs);
router.get('/recruiter/my-jobs', protect, getRecruiterJobs);
router.get('/:jobId', getJobById);

// Protected routes (require token)
router.post('/', protect, createJob);
router.put('/:jobId', protect, updateJob);
router.delete('/:jobId', protect, deleteJob);
router.post('/:jobId/apply', protect, applyToJob);
router.get('/:jobId/applicants', protect, getJobApplicants);
router.post('/:jobId/approve', protect, approveJob);
router.post('/:jobId/match-candidates', protect, matchingLimiter, matchCandidatesForJob);
router.get('/:jobId/candidate-matches', protect, getCandidateMatchesForJob);
router.get('/:jobId/candidates/:candidateId/resume-url', protect, resumeUrlLimiter, getCandidateResumeUrl);

module.exports = router;
