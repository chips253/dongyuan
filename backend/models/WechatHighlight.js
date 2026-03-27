const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  avatar: String,
  content: { type: String, required: true },
  time: { type: String, required: true },
  isSelf: { type: Boolean, default: false },
});

const wechatHighlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

wechatHighlightSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WechatHighlight', wechatHighlightSchema);