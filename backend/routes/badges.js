const express = require('express');
const router = express.Router();
const { getUserBadges, activateBadge } = require('../controllers/badgeController');
const auth = require('../middleware/auth'); // 需要认证

router.use(auth); // 所有接口都需要登录

router.get('/', getUserBadges);
router.post('/activate', activateBadge);

module.exports = router;