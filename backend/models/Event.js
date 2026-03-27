const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  date: Date,
  type: String, // 'workshop', 'hiking', 'talk'...
  maxParticipants: Number
});

module.exports = mongoose.model('Event', EventSchema);