const User = require('../models/User');
const Booking = require('../models/Booking');
const Activity = require('../models/Activity');
const Topic = require('../models/Topic');
const Case = require('../models/Case');
const bcrypt = require('bcryptjs'); // 用于密码加密（如果允许管理员重置密码）

// ==================== 用户管理 ====================

// 获取所有用户（已有）
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新用户信息（新）
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // 禁止更新的敏感字段
    delete updates.password;
    delete updates._id;
    delete updates.role; // 如果需要修改角色，可单独允许，但最好谨慎处理

    // 如果更新邮箱，需检查是否已存在
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ error: '邮箱已被占用' });
      }
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: '用户不存在' });
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除用户（新）
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // 可选：防止删除超级管理员
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    
    // 可以添加额外检查，例如不能删除自己
    if (req.user.id === id) {
      return res.status(400).json({ error: '不能删除当前登录的管理员账号' });
    }

    await user.deleteOne();
    // 同时删除关联数据（预订、项目、活动等，视业务需求）
    await Booking.deleteMany({ userId: id });
    // ... 其他关联数据删除

    res.json({ message: '用户删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// ==================== 活动管理 ====================

// 获取所有活动（可支持分页和筛选，新）
exports.getAllActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Activity.countDocuments(filter);

    res.json({
      activities,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新活动状态（例如审核通过/拒绝，新）
exports.updateActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 假设前端传 status 字段

    if (!status) {
      return res.status(400).json({ error: '缺少状态参数' });
    }

    const activity = await Activity.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!activity) return res.status(404).json({ error: '活动不存在' });

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// ==================== 仪表盘统计 ====================

// 获取系统统计（已有，保持原样）
exports.getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const activityCount = await Activity.countDocuments();
    const topicCount = await Topic.countDocuments();
    const caseCount = await Case.countDocuments();
    res.json({
      users: userCount,
      bookings: bookingCount,
      activities: activityCount,
      topics: topicCount,
      cases: caseCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};