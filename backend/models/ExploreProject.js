const mongoose = require('mongoose');

const exploreProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [String],
  postedBy: { type: String, required: true },           // 显示名称（如“仙坑村茶厂”或用户昵称）
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 发布者的用户ID，关联 User 模型
  reward: String,
  deadline: Date,
  hot: { type: Boolean, default: false },
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' }, // 项目状态，默认进行中
  message: { type: String, default: '' },               // 发布者填写的留言/联系方式
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ExploreProject', exploreProjectSchema);