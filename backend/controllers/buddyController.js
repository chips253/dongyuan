const BuddyCategory = require('../models/BuddyCategory');

// 获取所有搭子类别（按 order 排序）
exports.getBuddyCategories = async (req, res) => {
  try {
    const categories = await BuddyCategory.find().sort({ order: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取单个搭子类别
exports.getBuddyCategoryById = async (req, res) => {
  try {
    const category = await BuddyCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ error: '类别不存在' });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 创建新的搭子类别
exports.createBuddyCategory = async (req, res) => {
  try {
    const { name, description, icon, qrCode, groupLink, order } = req.body;
    const newCategory = new BuddyCategory({ name, description, icon, qrCode, groupLink, order });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新搭子类别
exports.updateBuddyCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const category = await BuddyCategory.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ error: '类别不存在' });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除搭子类别
exports.deleteBuddyCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await BuddyCategory.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ error: '类别不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 专门更新二维码（可用于定时任务或手动更新）
exports.updateQrCode = async (req, res) => {
  try {
    const { id } = req.params;
    const { qrCode, groupLink } = req.body;
    const category = await BuddyCategory.findById(id);
    if (!category) return res.status(404).json({ error: '类别不存在' });
    if (qrCode) category.qrCode = qrCode;
    if (groupLink) category.groupLink = groupLink;
    await category.save(); // updatedAt 会自动更新
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};