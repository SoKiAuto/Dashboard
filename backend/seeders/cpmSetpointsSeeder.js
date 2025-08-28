import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix: Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ✅ Use relative path instead of @ alias
import CPMSetpoint from "../models/cpmSetpointModel.js";

// -------------------------
// MongoDB Connection
// -------------------------
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  }
};

// -------------------------
// Default CPM Setpoints Data
// -------------------------
const defaultSetpoints = {
  unit: {
    Unit_RPM: { warning: 1000, alarm: 1200 },
    Total_HP: { warning: 800, alarm: 1000 },
    Avg_Discharge_Temp_F: { warning: 220, alarm: 250 },
    Avg_Suction_Temp_F: { warning: 70, alarm: 90 },
  },
  cylinders: {
    cylinder_1: {
      Crosshead_Pin_Reversal_Deg: { warning: 10, alarm: 15 },
      Rod_Load_Tension_kLbf: { warning: 15, alarm: 20 },
      Rod_Load_Compression_kLbf: { warning: 12, alarm: 18 },
      head_end: {
        HP: { warning: 50, alarm: 70 },
        Discharge_Pressure_psi: { warning: 400, alarm: 450 },
        Suction_Pressure_psi: { warning: 150, alarm: 180 },
      },
      crank_end: {
        HP: { warning: 55, alarm: 75 },
        Discharge_Pressure_psi: { warning: 410, alarm: 460 },
        Suction_Pressure_psi: { warning: 160, alarm: 190 },
      },
    },
    cylinder_2: {
      Crosshead_Pin_Reversal_Deg: { warning: 11, alarm: 16 },
      Rod_Load_Tension_kLbf: { warning: 16, alarm: 21 },
      Rod_Load_Compression_kLbf: { warning: 13, alarm: 19 },
      head_end: {
        HP: { warning: 52, alarm: 72 },
        Discharge_Pressure_psi: { warning: 405, alarm: 455 },
        Suction_Pressure_psi: { warning: 152, alarm: 182 },
      },
      crank_end: {
        HP: { warning: 57, alarm: 77 },
        Discharge_Pressure_psi: { warning: 415, alarm: 465 },
        Suction_Pressure_psi: { warning: 162, alarm: 192 },
      },
    },
    cylinder_3: {
      Crosshead_Pin_Reversal_Deg: { warning: 12, alarm: 17 },
      Rod_Load_Tension_kLbf: { warning: 17, alarm: 22 },
      Rod_Load_Compression_kLbf: { warning: 14, alarm: 20 },
      head_end: {
        HP: { warning: 54, alarm: 74 },
        Discharge_Pressure_psi: { warning: 408, alarm: 458 },
        Suction_Pressure_psi: { warning: 155, alarm: 185 },
      },
      crank_end: {
        HP: { warning: 59, alarm: 79 },
        Discharge_Pressure_psi: { warning: 418, alarm: 468 },
        Suction_Pressure_psi: { warning: 165, alarm: 195 },
      },
    },
  },
  stages: {
    stage_1: {
      Flow_MMSCFD: { warning: 20, alarm: 25 },
      Avg_Suction_Pressure_psi: { warning: 150, alarm: 170 },
      Avg_Discharge_Pressure_psi: { warning: 400, alarm: 450 },
    },
    stage_2: {
      Flow_MMSCFD: { warning: 22, alarm: 27 },
      Avg_Suction_Pressure_psi: { warning: 155, alarm: 175 },
      Avg_Discharge_Pressure_psi: { warning: 405, alarm: 455 },
    },
  },
};

// -------------------------
// Seed Function
// -------------------------
export const seedCPMSetpoints = async () => {
  try {
    await connectDB();

    const existing = await CPMSetpoint.findOne();
    if (existing) {
      console.log("⚠️ CPM setpoints already exist. Skipping seeding.");
      return;
    }

    await CPMSetpoint.create(defaultSetpoints);
    console.log("✅ Default CPM setpoints seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding CPM setpoints:", error);
  } finally {
    mongoose.connection.close();
  }
};

// ✅ Allow running directly via `node`
if (process.argv[1].includes("cpmSetpointsSeeder.js")) {
  seedCPMSetpoints();
}
