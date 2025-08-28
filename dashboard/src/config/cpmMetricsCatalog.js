// Central catalog to build UI options quickly.
// For cylinders/stages, we’ll dynamically replace {i} with selected number.

const cylinderMetrics = [
  { label: "Crosshead Pin Reversal (°)", path: "cylinders.cylinder_{i}.Crosshead_Pin_Reversal_Deg" },
  { label: "Rod Load Tension (kLbf)", path: "cylinders.cylinder_{i}.Rod_Load_Tension_kLbf" },
  { label: "Rod Load Compression (kLbf)", path: "cylinders.cylinder_{i}.Rod_Load_Compression_kLbf" },
  { label: "Head HP", path: "cylinders.cylinder_{i}.head_end.HP" },
  { label: "Crank HP", path: "cylinders.cylinder_{i}.crank_end.HP" },
  { label: "Head Discharge Pressure (psi)", path: "cylinders.cylinder_{i}.head_end.Discharge_Pressure_psi" },
  { label: "Head Suction Pressure (psi)", path: "cylinders.cylinder_{i}.head_end.Suction_Pressure_psi" },
  { label: "Crank Discharge Pressure (psi)", path: "cylinders.cylinder_{i}.crank_end.Discharge_Pressure_psi" },
  { label: "Crank Suction Pressure (psi)", path: "cylinders.cylinder_{i}.crank_end.Suction_Pressure_psi" },
  { label: "Head Vol Eff (%)", path: "cylinders.cylinder_{i}.head_end.Vol_Eff_Discharge_pct" },
  { label: "Crank Vol Eff (%)", path: "cylinders.cylinder_{i}.crank_end.Vol_Eff_Discharge_pct" },
  { label: "Head Flow (MMSCFD)", path: "cylinders.cylinder_{i}.head_end.Cylinder_Flow_MMSCFD" },
  { label: "Crank Flow (MMSCFD)", path: "cylinders.cylinder_{i}.crank_end.Cylinder_Flow_MMSCFD" },
  { label: "Head Clearance (%)", path: "cylinders.cylinder_{i}.head_end.Clearance_pct" },
  { label: "Crank Clearance (%)", path: "cylinders.cylinder_{i}.crank_end.Clearance_pct" },
];

const stageMetrics = [
  { label: "Flow (MMSCFD)", path: "stages.stage_{i}.Flow_MMSCFD" },
  { label: "Avg Suction Pressure (psi)", path: "stages.stage_{i}.Avg_Suction_Pressure_psi" },
  { label: "Avg Discharge Pressure (psi)", path: "stages.stage_{i}.Avg_Discharge_Pressure_psi" },
  { label: "Avg Suction Temp (°F)", path: "stages.stage_{i}.Avg_Suction_Temp_F" },
  { label: "Avg Discharge Temp (°F)", path: "stages.stage_{i}.Avg_Discharge_Temp_F" },
];

const unitMetrics = [
  { label: "Unit RPM", path: "unit.Unit_RPM" },
  { label: "Total HP", path: "unit.Total_HP" },
  { label: "Avg Suction Temp (°F)", path: "unit.Avg_Suction_Temp_F" },
  { label: "Avg Discharge Temp (°F)", path: "unit.Avg_Discharge_Temp_F" },
  { label: "Alarm Bits", path: "unit.Alarm_Bits" },
  { label: "Sensor Bad Flag", path: "unit.Sensor_Bad_Flag" },
];

export { unitMetrics, cylinderMetrics, stageMetrics };
