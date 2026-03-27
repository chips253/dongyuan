const Badge = require('../models/Badge');
const User = require('../models/User');

// 获取当前用户的所有称号（包括已获得和未获得）
exports.getUserBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    // 获取所有称号
    const allBadges = await Badge.find().sort({ order: 1 });
    
    // 构建返回列表，标记是否获得和是否激活
    const badges = allBadges.map(badge => ({
      id: badge._id,
      name: badge.name,
      description: badge.description,
      condition: badge.condition,
      obtained: user.badges.includes(badge.name),
      active: user.activeBadge === badge.name,
    }));

    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 设置激活称号
exports.activateBadge = async (req, res) => {
  try {
    const { badgeName } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    // 检查用户是否拥有该称号
    if (!user.badges.includes(badgeName)) {
      return res.status(400).json({ error: '您尚未获得该称号' });
    }

    user.activeBadge = badgeName;
    await user.save();

    res.json({ success: true, activeBadge: badgeName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};