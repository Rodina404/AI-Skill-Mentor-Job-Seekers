const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  updateProfile,
  updateGoals,
  getSavedJobs,
  saveJob,
  removeSavedJob
} = require('../controllers/users.controller');

// Enforce auth on all user routes
router.use(protect);

router.put('/:userId', updateProfile);
router.put('/:userId/goals', updateGoals);
router.get('/:userId/saved-jobs', getSavedJobs);
router.post('/:userId/saved-jobs', saveJob);
router.delete('/:userId/saved-jobs/:jobId', removeSavedJob);

module.exports = router;
