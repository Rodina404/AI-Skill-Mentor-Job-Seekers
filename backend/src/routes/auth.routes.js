const express = require('express');
const router = express.Router();
const { signup, login, logout, getMe, refreshToken } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);

// Frontend compatibility aliases
router.post('/signin', login);
router.post('/signout', protect, logout);
router.get('/verify', protect, getMe);

module.exports = router;
