const router = require('express').Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getCompanyProfile,
  updateCompanyProfile
} = require('../controllers/companyProfile.controller');

router.get('/', protect, getCompanyProfile);
router.put('/', protect, updateCompanyProfile);

module.exports = router;
