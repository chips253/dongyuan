const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  skills: [String],          // 技能标签数组
  isActive: { type: Boolean, default: false }, // 是否当前在园区
  joinedAt: { type: Date, default: Date.now },
  // 新增字段
  password: { type: String, required: true }, // 实际应加密存储
  avatar: String,
  phone: String,
  points: { type: Number, default: 0 },       // 原有已有，可覆盖
  level: { type: String, default: '青铜会员' },
  badges: [String],                           // 称号/徽章列表
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // 角色
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  badges: [String],          // 已获得的称号名称数组
  activeBadge: String,       // 当前激活的称号名称
});

module.exports = mongoose.model('User', UserSchema);