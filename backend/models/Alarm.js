const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({
  channel: Number,
  metric: String,
  level: String, // 'warning' or 'alarm'
  value: Number,
  threshold: Number,
  message: String,
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null } // ✅ Add this line
});

module.exports = mongoose.model('Alarm', alarmSchema, 'Sentinel-VM_alarms');
