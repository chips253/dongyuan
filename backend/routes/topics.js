const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // 认证中间件（如果需要登录才能发布话题等）
const {
  getTopics,
  getTopicById,
  createTopic,
  likeTopic,
  addComment,
} = require('../controllers/topicController'); // 确保这些函数已在控制器中实现

// 公开路由
router.get('/', getTopics);               // 获取话题列表
router.get('/:id', getTopicById);        // 获取单个话题详情

// 需要登录的路由
router.post('/', auth, createTopic);     // 发布新话题
router.put('/:id/like', auth, likeTopic); // 点赞话题
router.post('/:id/comments', auth, addComment); // 添加评论

module.exports = router;