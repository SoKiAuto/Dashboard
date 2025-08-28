const mongoose = require("mongoose");

// ✅ Common schema for limits
const limitSchema = new mongoose.Schema({
  warning: { type: Number, required: true },
  alarm: { type: Number, required: true },
});

// ✅ Cylinder schema
const cylinderSchema = new mongoose.Schema({
  Crosshead_Pin_Reversal_Deg: limitSchema,
  Rod_Load_Tension_kLbf: limitSchema,
  Rod_Load_Compression_kLbf: limitSchema,
  head_end: {
    HP: limitSchema,
    Discharge_Pressure_psi: limitSchema,
    Suction_Pressure_psi: limitSchema,
  },
  crank_end: {
    HP: limitSchema,
    Discharge_Pressure_psi: limitSchema,
    Suction_Pressure_psi: limitSchema,
  },
});

// ✅ Stage schema
const stageSchema = new mongoose.Schema({
  Flow_MMSCFD: limitSchema,
  Avg_Suction_Pressure_psi: limitSchema,
  Avg_Discharge_Pressure_psi: limitSchema,
});

// ✅ Main setpoint schema
const cpmSetpointSchema = new mongoose.Schema(
  {
    unit: {
      Unit_RPM: limitSchema,
      Total_HP: limitSchema,
      Avg_Discharge_Temp_F: limitSchema,
      Avg_Suction_Temp_F: limitSchema,
    },
    cylinders: {
      cylinder_1: cylinderSchema,
      cylinder_2: cylinderSchema,
      cylinder_3: cylinderSchema,
    },
    stages: {
      stage_1: stageSchema,
      stage_2: stageSchema,
    },
  },
  { timestamps: true }
);

// ✅ Model
const SetpointModel = mongoose.model(
  "Sentinel-CPM_setpoints",
  cpmSetpointSchema,
  "Sentinel-CPM_setpoints"
);

module.exports = SetpointModel;
