const mongoose = require("mongoose");

const CPMAlarmsSchema = new mongoose.Schema(
  {
    // ------------- [ Device Info ] -------------
    deviceId: { type: String, required: true, index: true }, // e.g. "CPM-001"
    deviceName: { type: String }, // For dashboard display

    // ------------- [ Metric Info ] -------------
    metric: { type: String, required: true }, // e.g. compressorData.unit.totalFlow
    displayName: { type: String },            // e.g. "Total Flow"
    unit: { type: String },                   // e.g. "m³/hr"
    category: { type: String },               // Unit / Stage / Cylinder

    // ------------- [ Alarm Details ] -------------
    alarmType: {
      type: String,
      enum: ["HH", "H", "L", "LL"],
      required: true
    },
    severity: {
      type: String,
      enum: ["critical", "warning", "info"],
      default: "warning"
    },

    // ------------- [ Thresholds & Values ] -------------
    threshold: { type: Number, required: true },  // The configured limit from Alarm Config
    actualValue: { type: Number, required: true }, // Live value when alarm triggered

    // ------------- [ Alarm Status ] -------------
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active"
    },

    // ------------- [ Timestamps ] -------------
    triggeredAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },

    // ------------- [ Notifications ] -------------
    notified: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      dashboard: { type: Boolean, default: false }
    },

    // ------------- [ Extra Info ] -------------
    description: { type: String }, // Optional custom message
    meta: mongoose.Mixed           // For any additional device-specific info
  },
  {
    collection: "CPM_Alarms",
    timestamps: true
  }
);

// Indexes for faster queries
CPMAlarmsSchema.index({ deviceId: 1, triggeredAt: -1 });
CPMAlarmsSchema.index({ metric: 1 });
CPMAlarmsSchema.index({ status: 1 });

module.exports = mongoose.model("CPM_Alarms", CPMAlarmsSchema);
