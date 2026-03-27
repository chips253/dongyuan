const Case = require('../models/Case');

// 获取案例列表（支持分类筛选、分页）
exports.getCases = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const cases = await Case.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Case.countDocuments(filter);

    res.json({
      cases,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取单个案例（通过自定义 id 字段）
exports.getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ id: req.params.id });
    if (!caseItem) return res.status(404).json({ error: '案例不存在' });
    res.json(caseItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 创建新案例（需登录，此处简化）
exports.createCase = async (req, res) => {
  try {
    const caseData = req.body;
    // 自动生成 id（例如基于 title 或时间戳，但最好由前端提供或后端生成唯一短ID）
    // 这里假设前端提供了 id，或者我们可以生成一个基于时间戳的短ID
    if (!caseData.id) {
      caseData.id = `case-${Date.now()}`;
    }
    const newCase = new Case(caseData);
    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新案例
exports.updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const caseItem = await Case.findOneAndUpdate({ id }, updates, { new: true, runValidators: true });
    if (!caseItem) return res.status(404).json({ error: '案例不存在' });
    res.json(caseItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除案例
exports.deleteCase = async (req, res) => {
  try {
    const { id } = req.params;
    const caseItem = await Case.findOneAndDelete({ id });
    if (!caseItem) return res.status(404).json({ error: '案例不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};