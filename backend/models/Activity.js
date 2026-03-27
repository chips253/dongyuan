const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }, // 自由文本，无枚举限制
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  participants: { type: Number, default: 0 },
  maxParticipants: Number,
  description: String,
  process: [String],
  notes: [String],
  organizer: {
    name: String,
    bio: String,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 改为可选，不强制要求
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
});

module.exports = mongoose.model('Activity', activitySchema);