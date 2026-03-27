const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');          // 认证中间件
const {
  getRewards,
  getRewardById,
  exchangeReward,
  getUserExchanges,
} = require('../controllers/rewardController');

// 所有路由需要登录
router.use(auth);

// 商品列表
router.get('/', getRewards);
// 单个商品详情
router.get('/:id', getRewardById);
// 兑换商品
router.post('/exchange', exchangeReward);
// 用户兑换记录
router.get('/exchanges/me', getUserExchanges);

module.exports = router;