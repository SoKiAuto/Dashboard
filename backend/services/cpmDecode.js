// backend/services/cpmDecode.js

/**
 * Sentinel-CPM decoder
 * --------------------
 * Input:  Array of 16-bit holding registers read starting at 40001 (index 0).
 * Output: {
 *   unit: {...},                     // device-level values
 *   cylinders: { cylinder_1: {...}, ... }, // per-cylinder with HE/CE grouping
 *   stages: { stage_1: {...}, ... }  // (if present)
 * }
 *
 * Register Map (offsets are zero-based indexes):
 *  1) Unit-level:
 *     0   : Unit RPM                       (×1)
 *     1   : Total HP                       (÷10)
 *     80  : Avg Discharge Temp (°F)        (×1)   => 40081
 *     81  : Avg Suction Temp (°F)          (×1)   => 40082
 *     130 : Sensor Bad Flag (bitwise)              => 40131
 *     131 : Alarm Bits (bitwise)                   => 40132
 *
 *  2) Cylinder-end series (12 ends: 1HE,1CE,2HE,2CE,...,6HE,6CE):
 *     2..13   : Cylinder-end HP                 (÷10)  => 40003..40014
 *     14..25  : Discharge Pressure (psi)        (÷10)  => 40015..40026
 *     26..37  : Suction Pressure (psi)          (÷10)  => 40027..40038
 *     38..49  : Discharge Vol. Efficiency (%)   (÷10)  => 40039..40050
 *     50..61  : Suction Vol. Efficiency (%)     (÷10)  => 40051..40062
 *     82..93  : Theoretical Discharge Temp (°F) (×1)   => 40083..40094
 *     94..105 : Flow Balance (%)                (÷100) => 40095..40106
 *     106..117: Cylinder Flow (MMSCFD)          (÷100) => 40107..40118
 *     118..129: Clearance (%)                   (÷100) => 40119..40130
 *
 *  3) Per-cylinder (not per-end):
 *     62..67 : Crosshead Pin Reversal (deg)     (×1)   => 40063..40068
 *     68..73 : Rod Load Tension (k-lbf)         (÷10)  => 40069..40074
 *     74..79 : Rod Load Compression (k-lbf)     (÷10)  => 40075..40080
 *
 *  4) Stage-level (if configured):
 *     199..204 : Flow per Stage (MMSCFD)        (÷10)  => 40200..40205
 *     205..210 : Avg Suction Press per Stage    (÷10)  => 40206..40211
 *     211..216 : Avg Discharge Press per Stage  (÷10)  => 40212..40217
 *     217..222 : Avg Suction Temp per Stage (°F)(×1)   => 40218..40223
 *     223..228 : Avg Disch Temp per Stage (°F)  (×1)   => 40224..40229
 */
// backend/services/cpmDecode.js

const CYL_COUNT = 6;
const ENDS_PER_CYL = 2;
const TOTAL_ENDS = CYL_COUNT * ENDS_PER_CYL;

const idx = {
  unit: {
    rpm: 0,
    totalHp: 1,
    avgDischargeTemp: 80,
    avgSuctionTemp: 81,
    sensorBadFlag: 130,
    alarmBits: 131,
  },
  perEnd: {
    hp: { start: 2, end: 13, scale: 10 },
    discPress: { start: 14, end: 25, scale: 10 },
    suctPress: { start: 26, end: 37, scale: 10 },
    veDisc: { start: 38, end: 49, scale: 10 },
    veSuct: { start: 50, end: 61, scale: 10 },
    tdTemp: { start: 82, end: 93, scale: 1 },
    flowBalance: { start: 94, end: 105, scale: 100 },
    cylFlow: { start: 106, end: 117, scale: 100 },
    clearance: { start: 118, end: 129, scale: 100 },
  },
  perCyl: {
    crossheadDeg: { start: 62, end: 67, scale: 1 },
    rodLoadTension: { start: 68, end: 73, scale: 10 },
    rodLoadCompression: { start: 74, end: 79, scale: 10 },
  },
  stages: {
    flow: { start: 199, end: 204, scale: 10 },
    suctPress: { start: 205, end: 210, scale: 10 },
    discPress: { start: 211, end: 216, scale: 10 },
    suctTemp: { start: 217, end: 222, scale: 1 },
    discTemp: { start: 223, end: 228, scale: 1 },
  },
};

function pick(arr, i) {
  const v = arr[i];
  return v == null ? null : v;
}

function scale(val, div) {
  if (val == null) return null;
  const s = div ? val / div : val;
  return Number(Number.isFinite(s) ? s.toFixed(div >= 10 ? 2 : 1) : null);
}

function sliceSeries(arr, { start, end, scale: div }) {
  const out = [];
  for (let i = start; i <= end; i++) {
    out.push(scale(pick(arr, i), div));
  }
  return out;
}

function endsToCylinders(series) {
  const cylinders = [];
  for (let c = 0; c < CYL_COUNT; c++) {
    const he = series[c * 2] ?? null;
    const ce = series[c * 2 + 1] ?? null;
    cylinders.push({ he, ce });
  }
  return cylinders;
}

/**
 * Decode a bitmask into per-cylinder-end flags
 */
function decodeBitFlags(value) {
  const flags = {};
  for (let c = 0; c < CYL_COUNT; c++) {
    const cylKey = `cylinder_${c + 1}`;
    const heBit = c * 2;
    const ceBit = c * 2 + 1;
    flags[cylKey] = {
      head_end: (value >> heBit) & 1 ? true : false,
      crank_end: (value >> ceBit) & 1 ? true : false,
    };
  }
  return flags;
}

/**
 * Build the hierarchical grouped object.
 */
function decodeCPM(registers) {
  if (!Array.isArray(registers) || registers.length === 0) return null;

  // ----- Decode bit flags -----
  const rawSensorFlag = pick(registers, idx.unit.sensorBadFlag) || 0;
  const rawAlarmBits = pick(registers, idx.unit.alarmBits) || 0;

  const sensorFlags = decodeBitFlags(rawSensorFlag);
  const alarmFlags = decodeBitFlags(rawAlarmBits);

  // ----- Unit Level -----
  const unit = {
    Unit_RPM: scale(pick(registers, idx.unit.rpm), 1),
    Total_HP: scale(pick(registers, idx.unit.totalHp), 10),
    Avg_Discharge_Temp_F: scale(pick(registers, idx.unit.avgDischargeTemp), 1),
    Avg_Suction_Temp_F: scale(pick(registers, idx.unit.avgSuctionTemp), 1),

    Sensor_Bad_Flag_Raw: rawSensorFlag,
    Sensor_Bad_Flag: sensorFlags,  // structured readable object

    Alarm_Bits_Raw: rawAlarmBits,
    Alarm_Bits: alarmFlags,        // structured readable object
  };

  // ----- Per-end series → split to cylinders -----
  const perEnd = {};
  for (const [k, spec] of Object.entries(idx.perEnd)) {
    perEnd[k] = sliceSeries(registers, spec);
  }

  const perEndCyl = {};
  for (const [k, series] of Object.entries(perEnd)) {
    perEndCyl[k] = endsToCylinders(series);
  }

  // ----- Per-cylinder series -----
  const crosshead = sliceSeries(registers, idx.perCyl.crossheadDeg);
  const rodTension = sliceSeries(registers, idx.perCyl.rodLoadTension);
  const rodCompression = sliceSeries(registers, idx.perCyl.rodLoadCompression);

  // ----- Build hierarchical cylinders -----
  const cylinders = {};
  for (let c = 0; c < CYL_COUNT; c++) {
    const num = c + 1;
    cylinders[`cylinder_${num}`] = {
      Crosshead_Pin_Reversal_Deg: crosshead[c] ?? null,
      Rod_Load_Tension_kLbf: rodTension[c] ?? null,
      Rod_Load_Compression_kLbf: rodCompression[c] ?? null,

      head_end: {
        HP: perEndCyl.hp[c]?.he ?? null,
        Discharge_Pressure_psi: perEndCyl.discPress[c]?.he ?? null,
        Suction_Pressure_psi: perEndCyl.suctPress[c]?.he ?? null,
        Vol_Eff_Discharge_pct: perEndCyl.veDisc[c]?.he ?? null,
        Vol_Eff_Suction_pct: perEndCyl.veSuct[c]?.he ?? null,
        Theoretical_Discharge_Temp_F: perEndCyl.tdTemp[c]?.he ?? null,
        Flow_Balance_pct: perEndCyl.flowBalance[c]?.he ?? null,
        Cylinder_Flow_MMSCFD: perEndCyl.cylFlow[c]?.he ?? null,
        Clearance_pct: perEndCyl.clearance[c]?.he ?? null,
      },

      crank_end: {
        HP: perEndCyl.hp[c]?.ce ?? null,
        Discharge_Pressure_psi: perEndCyl.discPress[c]?.ce ?? null,
        Suction_Pressure_psi: perEndCyl.suctPress[c]?.ce ?? null,
        Vol_Eff_Discharge_pct: perEndCyl.veDisc[c]?.ce ?? null,
        Vol_Eff_Suction_pct: perEndCyl.veSuct[c]?.ce ?? null,
        Theoretical_Discharge_Temp_F: perEndCyl.tdTemp[c]?.ce ?? null,
        Flow_Balance_pct: perEndCyl.flowBalance[c]?.ce ?? null,
        Cylinder_Flow_MMSCFD: perEndCyl.cylFlow[c]?.ce ?? null,
        Clearance_pct: perEndCyl.clearance[c]?.ce ?? null,
      },
    };
  }

  // ----- Stages -----
  const stages = {};
  const stageKeys = Object.keys(idx.stages);
  const hasStages = stageKeys.some(k => idx.stages[k].start < registers.length);
  if (hasStages) {
    const sFlow = sliceSeries(registers, idx.stages.flow);
    const sSuctP = sliceSeries(registers, idx.stages.suctPress);
    const sDiscP = sliceSeries(registers, idx.stages.discPress);
    const sSuctT = sliceSeries(registers, idx.stages.suctTemp);
    const sDiscT = sliceSeries(registers, idx.stages.discTemp);

    for (let s = 0; s < 6; s++) {
      stages[`stage_${s + 1}`] = {
        Flow_MMSCFD: sFlow[s] ?? null,
        Avg_Suction_Pressure_psi: sSuctP[s] ?? null,
        Avg_Discharge_Pressure_psi: sDiscP[s] ?? null,
        Avg_Suction_Temp_F: sSuctT[s] ?? null,
        Avg_Discharge_Temp_F: sDiscT[s] ?? null,
      };
    }
  }

  return { unit, cylinders, stages };
}

module.exports = { decodeCPM };
