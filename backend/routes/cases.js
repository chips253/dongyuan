const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // 引入认证中间件
const {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');

// 公开路由（无需认证）
router.get('/', getCases);
router.get('/:id', getCaseById);

// 需要认证的路由
router.post('/', auth, createCase);      // 创建案例需要登录
router.put('/:id', auth, updateCase);    // 更新案例需要登录（可根据需要添加）
router.delete('/:id', auth, deleteCase); // 删除案例需要登录（可根据需要添加）

module.exports = router;