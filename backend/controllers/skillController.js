const User = require('../models/User');

exports.getSkills = async (req, res) => {
  try {
    // 从所有用户的技能数组中聚合计数
    const skills = await User.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};