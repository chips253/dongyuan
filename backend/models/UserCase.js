const mongoose = require('mongoose');

const userCaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: String, required: true }, // 案例的 id
  title: String,
  role: String,
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserCase', userCaseSchema);