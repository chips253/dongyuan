const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  items: [String],
  price: { type: Number, required: true },
  originalPrice: Number,
  tag: {
    type: String,
    enum: ['hot', 'recommend', 'new', null],
    default: null,
  },
});

module.exports = mongoose.model('Package', packageSchema);