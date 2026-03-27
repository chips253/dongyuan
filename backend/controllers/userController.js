const User = require('../models/User');
const Booking = require('../models/Booking');
const UserProject = require('../models/UserProject');
const UserActivity = require('../models/UserActivity');
const UserCase = require('../models/UserCase');
const PointTransaction = require('../models/PointTransaction');
const bcrypt = require('bcryptjs');
const ExploreProject = require('../models/ExploreProject');
const Activity = require('../models/Activity'); // 新增：用于获取用户发布的活动

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: '当前密码不正确' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取当前用户信息
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: '用户不存在' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新用户信息
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    // 不允许更新敏感字段
    delete updates.password;
    delete updates.role;
    delete updates.points;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户的预订列表
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户参与的项目列表
exports.getUserProjects = async (req, res) => {
  try {
    const projects = await UserProject.find({ userId: req.user.id }).sort({ joinedAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户报名的活动列表
exports.getUserActivities = async (req, res) => {
  try {
    const activities = await UserActivity.find({ userId: req.user.id }).sort({ registeredAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户提交的案例列表
exports.getUserCases = async (req, res) => {
  try {
    const cases = await UserCase.find({ userId: req.user.id }).sort({ submittedAt: -1 });
    res.json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户积分流水
exports.getPointTransactions = async (req, res) => {
  try {
    const transactions = await PointTransaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户统计数据（用于个人中心首页）
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingCount = await Booking.countDocuments({ userId });
    const projectCount = await UserProject.countDocuments({ userId });
    const activityCount = await UserActivity.countDocuments({ userId });
    const caseCount = await UserCase.countDocuments({ userId });
    const recentBookings = await Booking.find({ userId }).sort({ createdAt: -1 }).limit(3);
    const recentProjects = await UserProject.find({ userId }).sort({ joinedAt: -1 }).limit(3);
    const recentActivities = await UserActivity.find({ userId }).sort({ registeredAt: -1 }).limit(3);

    res.json({
      stats: {
        bookings: bookingCount,
        projects: projectCount,
        activities: activityCount,
        cases: caseCount,
      },
      recent: {
        bookings: recentBookings,
        projects: recentProjects,
        activities: recentActivities,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户发布的项目（探索页面）
exports.getUserPostedProjects = async (req, res) => {
  try {
    const projects = await ExploreProject.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户发布的活动（新增）
exports.getUserPostedActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};