const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  source: String,
  channel: Number,
  timestamp: { type: Date, default: Date.now },
  values: Object,
  RPM: Number,
  quality: Number
});

module.exports = mongoose.model('HistorySensor', historySchema, 'history_data');
