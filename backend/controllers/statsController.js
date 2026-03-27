const User = require('../models/User');
const Event = require('../models/Event');
const Project = require('../models/Project');

// 获取所有技能种类（去重）
const getDistinctSkills = async () => {
  const skills = await User.distinct('skills', { isActive: true });
  return skills.length;
};

// 本月活动数量
const getThisMonthEvents = async () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return await Event.countDocuments({ date: { $gte: start, $lt: end } });
};

// 进行中的助农项目数量
const getOngoingProjects = async () => {
  return await Project.countDocuments({ status: 'ongoing' });
};

exports.getStats = async (req, res) => {
  try {
    const currentResidents = await User.countDocuments({ isActive: true });
    const skillTypes = await getDistinctSkills();
    const monthlyEvents = await getThisMonthEvents();
    const localProjects = await getOngoingProjects();

    res.json({
      currentResidents,
      skillTypes,
      monthlyEvents,
      localProjects
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};