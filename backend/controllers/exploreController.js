const ExploreProject = require('../models/ExploreProject');

// 获取项目列表（支持技能筛选、发布者筛选、排除ID、分页）
exports.getProjects = async (req, res) => {
  try {
    const { skills, postedBy, exclude, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (postedBy) filter.postedBy = postedBy;
    if (exclude) filter._id = { $ne: exclude };
    if (skills) {
      const skillArray = skills.split(',');
      filter.requiredSkills = { $in: skillArray };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const projects = await ExploreProject.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ExploreProject.countDocuments(filter);

    res.json({
      projects,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取单个项目详情
exports.getProjectById = async (req, res) => {
  try {
    const project = await ExploreProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: '项目不存在' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 发布新项目（需认证，userId 从 req.user 获取）
exports.createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, reward, deadline, postedBy, message } = req.body;
    if (!title || !description || !requiredSkills) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const newProject = new ExploreProject({
      title,
      description,
      requiredSkills,
      reward,
      deadline: deadline ? new Date(deadline) : undefined,
      postedBy: postedBy || req.user.name,
      userId: req.user.id,
      message: message || '', // 新增：保存留言/联系方式
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};