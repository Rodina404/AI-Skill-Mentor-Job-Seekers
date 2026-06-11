const express = require('express');
const router = express.Router();
const { runMatching, getMatchResults } = require('../controllers/matches.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);
router.post('/run', runMatching);
router.get('/', getMatchResults);

module.exports = router;
