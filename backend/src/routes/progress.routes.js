const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/progress.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', getProgress);
router.post('/update', updateProgress);

module.exports = router;
