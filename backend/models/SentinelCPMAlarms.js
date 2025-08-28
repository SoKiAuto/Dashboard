const mongoose = require("mongoose");

const sentinelCPMAlarmSchema = new mongoose.Schema({
  // ✅ Replaced channel with source
  source: { type: String, default: "CPM" }, // Always CPM

  // ✅ Main info
  parameter: { type: String, required: true }, // Full parameter path
  value: { type: Number },                     // Live value
  threshold: { type: Number },                 // Trigger threshold

  // ✅ Alarm details
  severity: { type: String, enum: ["warning", "alarm"], required: true }, // Replaces "level"
  message: { type: String },                     // User-friendly alarm message

  // ✅ Categorization
  category: {
    type: {
      type: String,
      enum: ["unit", "stage", "cylinder"],
      required: true,
    },
    name: { type: String, required: true },
  },

  // ✅ Status tracking
  status: { type: String, enum: ["active", "resolved"], default: "active" },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },

  // ✅ Timestamps
  timestamp: { type: Date, default: Date.now },
});

// ✅ Prevent OverwriteModelError
module.exports =
  mongoose.models.SentinelCPMAlarms ||
  mongoose.model("SentinelCPMAlarms", sentinelCPMAlarmSchema, "Sentinel-CPM_alarms");
