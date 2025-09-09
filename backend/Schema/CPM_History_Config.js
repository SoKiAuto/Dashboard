const mongoose = require("mongoose");

const CPMHistoryConfigSchema = new mongoose.Schema(
  {
    // Metric path inside live data (e.g. compressorData.unit.totalFlow)
    metric: { type: String, required: true, unique: true },

    // Whether to store this metric in history or not
    enabled: { type: Boolean, default: true },

    // Optional metadata for dashboard display
    displayName: { type: String },   // e.g. "Total Flow"
    unit: { type: String },          // e.g. "m³/hr"
    description: { type: String },   // Short description
    category: { type: String },      // e.g. "Unit", "Stage", "Cylinder"

    // For future analytics — thresholds if needed
    minValue: { type: Number, default: null },
    maxValue: { type: Number, default: null },

    // For better grouping in UI
    order: { type: Number, default: 0 }
  },
  {
    collection: "CPM_History_Config",
    timestamps: true
  }
);

module.exports = mongoose.model("CPM_History_Config", CPMHistoryConfigSchema);
