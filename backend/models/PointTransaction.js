const mongoose = require('mongoose');

const pointTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  type: { type: String, enum: ['earn', 'redeem'] },
  source: String, // 来源，如 'activity', 'project', 'booking' 等
  description: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PointTransaction', pointTransactionSchema);