const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },          // 商品名称
  description: { type: String, default: '' },      // 商品描述
  points: { type: Number, required: true },        // 所需积分
  stock: { type: Number, default: 0 },             // 库存（0表示无库存，-1表示无限）
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }, // 状态
  image: { type: String, default: '' },            // 图片URL
  type: { type: String, enum: ['coupon', 'service', 'physical', 'other'], default: 'other' }, // 商品类型
  codePrefix: { type: String },                    // 兑换码前缀（可选）
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

rewardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reward', rewardSchema);