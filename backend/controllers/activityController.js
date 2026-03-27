const Activity = require('../models/Activity');
const UserActivity = require('../models/UserActivity'); // 新增：报名记录模型

// 获取活动列表（支持分页）
exports.getActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const activities = await Activity.find()
      .sort({ date: 1 }) // 按日期升序
      .skip(skip)
      .limit(limitNum);

    const total = await Activity.countDocuments();

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

// 获取单个活动
exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: '活动不存在' });
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 创建活动（需登录，自动关联当前用户）
exports.createActivity = async (req, res) => {
  try {
    const activityData = req.body;
    // 从认证中间件获取当前用户ID，并设置 userId 字段
    activityData.userId = req.user.id;
    const newActivity = new Activity(activityData);
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新活动（例如报名人数增加）
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const activity = await Activity.findByIdAndUpdate(id, updates, { new: true });
    if (!activity) return res.status(404).json({ error: '活动不存在' });
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取当前用户发布的活动（需登录）
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

// 获取活动的报名者列表（需验证是活动发布者）
exports.getActivityParticipants = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: '活动不存在' });
    // 验证当前用户是否为活动发布者
    if (activity.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: '无权限查看' });
    }
    // 从 UserActivity 表中查询报名记录，并 populate 用户信息
    const participants = await UserActivity.find({ activityId: activity._id })
      .populate('userId', 'name email avatar phone')
      .sort({ registeredAt: -1 });
    res.json(participants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};