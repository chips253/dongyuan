const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityId: { type: String, required: true }, // 活动的 id
  title: String,
  date: Date,
  status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
  registeredAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserActivity', userActivitySchema);