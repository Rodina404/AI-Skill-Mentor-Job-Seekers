const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  updateProfile,
  updateGoals,
  getSavedJobs,
  saveJob,
  removeSavedJob,
  getUserCourses
} = require('../controllers/users.controller');

// Enforce auth on all user routes
router.use(protect);

router.put('/:userId', updateProfile);
router.put('/:userId/goals', updateGoals);
router.get('/:userId/saved-jobs', getSavedJobs);
router.post('/:userId/saved-jobs', saveJob);
router.delete('/:userId/saved-jobs/:savedJobId', removeSavedJob);
router.get('/:userId/courses', getUserCourses);

module.exports = router;
