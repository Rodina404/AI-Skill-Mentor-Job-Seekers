const express = require('express');
const router = express.Router();
const { signup, login, logout, getMe, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);

module.exports = router;
