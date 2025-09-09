const mongoose = require("mongoose");

const CPMAlarmConfigSchema = new mongoose.Schema(
  {
    // Metric path (e.g. compressorData.unit.totalFlow)
    metric: { type: String, required: true, unique: true },

    // Human-readable details
    displayName: { type: String, required: true },   // e.g. "Total Flow"
    description: { type: String },
    unit: { type: String },                          // e.g. "m³/hr"
    category: { type: String, default: "Unit" },     // Unit / Stage / Cylinder
    order: { type: Number, default: 0 },

    // ---------------- [ Alarm Setpoints ] ----------------
    HH_Setpoint: { type: Number, default: null },    // High-High threshold
    H_Setpoint: { type: Number, default: null },     // High threshold
    L_Setpoint: { type: Number, default: null },     // Low threshold
    LL_Setpoint: { type: Number, default: null },    // Low-Low threshold

    // ---------------- [ Alarm Enable / Disable ] ----------------
    HH_Enable: { type: Boolean, default: false },    // 1 = Enable, 0 = Disable
    H_Enable: { type: Boolean, default: false },
    L_Enable: { type: Boolean, default: false },
    LL_Enable: { type: Boolean, default: false },

    // ---------------- [ Alarm Severity ] ----------------
    HH_Severity: { type: String, default: "critical" }, // critical / warning / info
    H_Severity: { type: String, default: "warning" },
    L_Severity: { type: String, default: "warning" },
    LL_Severity: { type: String, default: "critical" },

    // ---------------- [ Alarm Behavior ] ----------------
    debounceSeconds: { type: Number, default: 5 }, // Avoid alarm flickering
    notification: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      dashboard: { type: Boolean, default: true }
    }
  },
  {
    collection: "CPM_Alarm_Config",
    timestamps: true
  }
);

module.exports = mongoose.model("CPM_Alarm_Config", CPMAlarmConfigSchema);
