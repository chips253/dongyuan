const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true }, // 对应产品包的 id（如 'living-1'）
  productName: String,
  type: { type: String, enum: ['living', 'office', 'package', 'life', 'social', 'contribute'], required: true },
  date: Date,
  nights: Number, // 住宿晚数
  months: Number, // 工位月数
  price: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);