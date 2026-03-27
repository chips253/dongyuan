const User = require('../models/User');

exports.getRankings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 按积分降序排序，只返回必要字段
    const users = await User.find({})
      .select('name avatar skills points')
      .sort({ points: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments();

    // 计算当前页用户的真实排名（基于全局排序）
    const rankings = users.map((user, index) => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      points: user.points,
      rank: skip + index + 1,
      skills: user.skills || [],
    }));

    res.json({
      rankings,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};