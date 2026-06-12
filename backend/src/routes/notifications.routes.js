const express = require('express');
const { getUserNotifications } = require('../controllers/notifications.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate, getUserNotifications);

module.exports = router;
