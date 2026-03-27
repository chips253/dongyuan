const mongoose = require('mongoose');

const userProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExploreProject', required: true }, // 改为 ObjectId 并引用 ExploreProject
  title: String,
  role: String,
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  progress: Number,
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserProject', userProjectSchema);