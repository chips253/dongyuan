const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  condition: String, // 获得条件描述（如“累计1000积分”）
  icon: String,      // 可选图标名称
  order: Number,     // 排序
});

module.exports = mongoose.model('Badge', badgeSchema);