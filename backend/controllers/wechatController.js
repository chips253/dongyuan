const WechatHighlight = require('../models/WechatHighlight');

// 获取所有微信群精选（按更新时间倒序）
exports.getWechatHighlights = async (req, res) => {
  try {
    const highlights = await WechatHighlight.find().sort({ updatedAt: -1 });
    res.json(highlights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取单个微信群精选
exports.getWechatHighlightById = async (req, res) => {
  try {
    const highlight = await WechatHighlight.findById(req.params.id);
    if (!highlight) return res.status(404).json({ error: '精选不存在' });
    res.json(highlight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 创建新的微信群精选
exports.createWechatHighlight = async (req, res) => {
  try {
    const { title, excerpt, messages } = req.body;
    const newHighlight = new WechatHighlight({ title, excerpt, messages });
    await newHighlight.save();
    res.status(201).json(newHighlight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新微信群精选
exports.updateWechatHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const highlight = await WechatHighlight.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!highlight) return res.status(404).json({ error: '精选不存在' });
    res.json(highlight);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除微信群精选
exports.deleteWechatHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const highlight = await WechatHighlight.findByIdAndDelete(id);
    if (!highlight) return res.status(404).json({ error: '精选不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};