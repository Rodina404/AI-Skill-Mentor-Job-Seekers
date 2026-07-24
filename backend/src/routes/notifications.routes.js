const express = require('express');
const { getUserNotifications, markNotificationRead, markAllNotificationsRead } = require('../controllers/notifications.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate, getUserNotifications);
router.patch('/read-all', authenticate, markAllNotificationsRead);
router.patch('/:id/read', authenticate, markNotificationRead);

module.exports = router;
