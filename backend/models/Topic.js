const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  tags: [String],
  category: {
    type: String,
    enum: ['guide', 'creator', 'village', 'review'],
    required: true,
  },
  // 评论数组，每个评论包含用户信息、内容和时间
  comments: [{
    user: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  // 冗余字段：评论数量，用于快速排序和显示
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Topic || mongoose.model('Topic', topicSchema);