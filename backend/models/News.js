const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: String,
  content: String,
  type: { type: String, enum: ['story', 'event', 'news'], default: 'news' },
  date: { type: Date, default: Date.now },
  imageUrl: String
});

module.exports = mongoose.model('News', NewsSchema);