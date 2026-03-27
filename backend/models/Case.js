const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // 前端使用的短ID，如 'case-1'
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [String], // 图片 URL 数组
  category: {
    type: String,
    enum: ['agriculture', 'culture', 'skill', 'other'],
    required: true,
  },
  tags: [String],
  outcome: { type: String, required: true }, // 成果摘要
  participants: { type: Number, default: 0 },
  year: { type: String },
  detail: { type: String }, // 详细描述（可选）
  contributors: [String], // 参与人员名字列表（可选）
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

caseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Case', caseSchema);