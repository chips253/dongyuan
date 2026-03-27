const mongoose = require('mongoose');

const buddyCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: { type: String, required: true },      // 图标名称，如 'FaHiking'
  qrCode: { type: String, required: true },    // 二维码图片 URL
  groupLink: String,                            // 微信群备用链接
  order: { type: Number, default: 0 },          // 排序
  updatedAt: { type: Date, default: Date.now }, // 最后更新时间
});

// 每次更新时自动修改 updatedAt
buddyCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BuddyCategory', buddyCategorySchema);