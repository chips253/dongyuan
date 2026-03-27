const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  rewardName: { type: String, required: true },      // 快照商品名称
  points: { type: Number, required: true },          // 花费积分
  code: { type: String, unique: true, sparse: true }, // 兑换码（如优惠券码）
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exchange', exchangeSchema);