const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');
const UserActivity = require('../models/UserActivity');

// 从控制器导入已有函数和新函数
const {
  getActivities,
  getActivityById,
  updateActivity,
  getUserPostedActivities,      // 新增
  getActivityParticipants,      // 新增
} = require('../controllers/activityController');

// 获取活动列表（无需认证）
router.get('/', getActivities);

// 获取单个活动详情（无需认证）
router.get('/:id', getActivityById);

// 获取当前用户发布的活动（需要认证）  <-- 新增
router.get('/posted', auth, getUserPostedActivities);

// 获取活动的报名者列表（仅发布者可见，需要认证） <-- 新增
router.get('/:id/participants', auth, getActivityParticipants);

// 创建新活动（需要认证）
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' });
    }

    const {
      title, type, date, time, location, description,
      process, notes, organizer, maxParticipants
    } = req.body;

    if (!title || !type || !date || !time || !location) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const newActivity = new Activity({
      title,
      type,
      date,
      time,
      location,
      description,
      process: process || [],
      notes: notes || [],
      organizer: organizer || {},
      participants: 0,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      userId: req.user._id,
    });

    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 报名参加活动（需要认证）
router.post('/:id/join', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: '活动不存在' });
    }

    if (activity.maxParticipants && activity.participants >= activity.maxParticipants) {
      return res.status(400).json({ error: '活动已满员' });
    }

    const existing = await UserActivity.findOne({
      userId: req.user._id,
      activityId: activity._id,
    });
    if (existing) {
      return res.status(400).json({ error: '您已报名过此活动' });
    }

    activity.participants += 1;
    await activity.save();

    await UserActivity.create({
      userId: req.user._id,
      activityId: activity._id,
      title: activity.title,
      date: activity.date,
      status: 'registered',
    });

    res.json({ message: '报名成功', participants: activity.participants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 取消报名（需要认证）
router.delete('/:id/join', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: '活动不存在' });

    const userActivity = await UserActivity.findOne({
      userId: req.user._id,
      activityId: activity._id,
      status: 'registered'
    });
    if (!userActivity) {
      return res.status(400).json({ error: '您尚未报名此活动' });
    }

    activity.participants = Math.max(0, activity.participants - 1);
    await activity.save();

    userActivity.status = 'cancelled';
    await userActivity.save();

    res.json({ message: '取消报名成功', participants: activity.participants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取当前用户对活动的报名状态（需要认证）
router.get('/:id/registration', auth, async (req, res) => {
  try {
    const userActivity = await UserActivity.findOne({
      userId: req.user._id,
      activityId: req.params.id,
      status: 'registered'
    });
    res.json({
      registered: !!userActivity,
      status: userActivity ? userActivity.status : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取活动的申请列表（仅发布者可见）
router.get('/:id/applications', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ error: '活动不存在' });
    }
    if (activity.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权限查看' });
    }
    const applications = await UserActivity.find({ activityId: activity._id })
      .populate('userId', 'name email avatar phone')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 更新活动（需要认证）
router.put('/:id', auth, updateActivity);

module.exports = router;