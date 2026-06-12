const express = require('express');
const router = express.Router();
const { getAllSkills, getMySkills, addMySkill } = require('../controllers/skills.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', getAllSkills);
router.get('/me', getMySkills);
router.post('/me', addMySkill);

module.exports = router;
