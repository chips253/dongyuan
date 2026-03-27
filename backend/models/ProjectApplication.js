const mongoose = require('mongoose');

const projectApplicationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExploreProject', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },            // 申请留言
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' }, // 新增 cancelled 状态
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProjectApplication', projectApplicationSchema);