const mongoose = require("mongoose");

const CPMLiveDataSchema = new mongoose.Schema(
  {
    // Unique device ID (e.g. CPM-1, CPM-2, etc.)
    deviceId: { type: String, required: true, unique: true, index: true },

    // ---------- [ 1. DEVICE INFO ] ----------
    deviceInfo: {
      name: { type: String },
      model: { type: String },
      serialNumber: { type: String },
      location: { type: String },
      ipAddress: { type: String },
      protocol: { type: String, default: "socket.io" },
      lastUpdated: { type: Date, default: Date.now },
    },

    // ---------- [ 2. COMPRESSOR DATA ] ----------
    compressorData: {
      // Unit-level summary metrics
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

      // Stage-wise calculated values
      stages: {
        type: [
          {
            stageNumber: { type: Number },
            stgCalcFlow: { type: Number, default: null },
            stgCalcDiscTemp: { type: Number, default: null },
            stgCalcHP: { type: Number, default: null },
            stgCalcPressureRatio: { type: Number, default: null },
          },
        ],
        default: [],
      },

      // Cylinder-wise calculated values
      cylinders: {
        type: [
          {
            cylinderId: { type: Number },
            avgKValue: { type: Number, default: null },
            compressionRatio: { type: Number, default: null },
            leakagePercent: { type: Number, default: null },
            rodDrop: { type: Number, default: null },
            measuredPower: { type: Number, default: null },
          },
        ],
        default: [],
      },
    },

    // ---------- [ 3. DEVICE STATUS ] ----------
    status: {
      online: { type: Boolean, default: false },
      lastSeen: { type: Date, default: null },
      alarmsActive: { type: Number, default: 0 },
      systemStatus: mongoose.Mixed,
    },

    // ---------- [ 4. CURVE DATA ] ----------
    curveData: {
      lastUpdated: { type: Date, default: null },
      CETheoretical: { type: [Number], default: [] },
      CERaw: { type: [Number], default: [] },
      CESmoothed: { type: [Number], default: [] },
      HERaw: { type: [Number], default: [] },
      HESmoothed: { type: [Number], default: [] },
    },
  },
  {
    collection: "CPM_Live_Data",
    timestamps: true,
  }
);

module.exports = mongoose.model("CPM_Live_Data", CPMLiveDataSchema);
