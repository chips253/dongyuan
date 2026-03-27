const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 }, // 拥有该技能的人数
});

module.exports = mongoose.model('Skill', skillSchema);