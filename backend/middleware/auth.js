const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.warn('认证中间件：未提供 token');
      return res.status(401).json({ error: '请先登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.warn(`认证中间件：用户 ${decoded.id} 不存在`);
      return res.status(401).json({ error: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('认证中间件错误:', err.message);
    return res.status(401).json({ error: '无效的令牌' });
  }
};