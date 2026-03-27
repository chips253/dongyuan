const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');          // 认证中间件
const adminAuth = require('../middleware/adminAuth'); // 管理员权限中间件

// 先认证，再检查管理员权限
router.use(auth);      // 解析 token，设置 req.user
router.use(adminAuth); // 验证 req.user.role 是否为 admin

// 仪表盘统计数据
router.get('/dashboard', adminController.getDashboardStats);

// 用户管理
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// 内容管理
router.get('/activities', adminController.getAllActivities);
router.put('/activities/:id/status', adminController.updateActivityStatus);

module.exports = router;