const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/auth');

// 注册
router.post('/register', register);
// 登录
router.post('/login', login);
// 获取当前用户信息（需认证）
router.get('/me', auth, getMe);
// 忘记密码
router.post('/forgot-password', forgotPassword);
// 重置密码
router.post('/reset-password', resetPassword);

module.exports = router;