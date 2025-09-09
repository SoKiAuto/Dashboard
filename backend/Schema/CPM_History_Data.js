const mongoose = require("mongoose");

const CPMHistoryDataSchema = new mongoose.Schema(
  {
    // Unique device ID
    deviceId: { type: String, required: true, index: true },

    // Timestamp of this snapshot
    timestamp: { type: Date, required: true, index: true },

    // Compressor performance data (filtered based on CPM_History_Config)
    compressorData: {
      unit: {
        totalFlow: { type: Number, default: null },
        measuredRPM: { type: Number, default: null },
        measuredBHP: { type: Number, default: null },
        loadPercent: { type: Number, default: null },
        rodLoadPercent: { type: Number, default: null },
        dischargePressure: { type: Number, default: null },
        suctionPressure: { type: Number, default: null },
        measuredPower: { type: Number, default: null },
        volumetricEfficiency: { type: Number, default: null },
        polytropicEfficiency: { type: Number, default: null },
      },
      stages: {
        type: [
          {
            stageNumber: { type: Number },
            stgCalcFlow: { type: Number, default: null },
            stgCalcDiscTemp: { type: Number, default: null },
            stgCalcHP: { type: Number, default: null },
            stgCalcPressureRatio: { type: Number, default: null },
          }
        ],
        default: []
      },
      cylinders: {
        type: [
          {
            cylinderId: { type: Number },
            avgKValue: { type: Number, default: null },
            compressionRatio: { type: Number, default: null },
            leakagePercent: { type: Number, default: null },
            rodDrop: { type: Number, default: null },
            measuredPower: { type: Number, default: null },
          }
        ],
        default: []
      }
    },

    // Device status at this time
    status: {
      online: { type: Boolean, default: false },
      alarmsActive: { type: Number, default: 0 },
      systemStatus: mongoose.Mixed
    }
  },
  {
    collection: "CPM_History_Data",
    timestamps: true
  }
);

// Compound index for fast queries
CPMHistoryDataSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model("CPM_History_Data", CPMHistoryDataSchema);
