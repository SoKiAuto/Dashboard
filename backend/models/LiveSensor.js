const mongoose = require('mongoose');

const liveSchema = new mongoose.Schema({
  source: String,
  channel: Number,
  timestamp: { type: Date, default: Date.now },
  values: Object,
  RPM: Number,
  quality: Number
});

module.exports = mongoose.model('LiveSensor', liveSchema, 'live_data');
