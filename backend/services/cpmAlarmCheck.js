const AlarmModel = require("../models/SentinelCPMAlarms");
const SetpointModel = require("../models/cpmSetpointModel");

const DEBUG_ALARMS = process.env.DEBUG_ALARMS === "true"; // 🔹 Controlled by .env

async function cpmAlarmCheck(liveData) {
    try {
        // ✅ Check if this is a communication break trigger
        if (liveData && liveData.commBreak) {
            await handleCommBreakAlarm();
            return;
        } else {
            await resolveCommBreakAlarm();
        }

        // ✅ Fetch setpoints
        const setpoints = await SetpointModel.findOne({});
        if (!setpoints) {
            if (DEBUG_ALARMS) {
                console.warn("⚠️ No CPM setpoints found — skipping alarm check");
            }
            return;
        }

        /**
         * Recursive traversal through live data & setpoints
         */
        const traverse = async (liveObj, spObj, path = []) => {
            for (const key in liveObj) {
                const currentPath = [...path, key];
                const liveVal = liveObj[key];
                const spVal = spObj?.[key];

                if (
                    spVal &&
                    typeof liveVal === "number" &&
                    typeof spVal === "object" &&
                    spVal.warning !== undefined &&
                    spVal.alarm !== undefined
                ) {
                    await processAlarm(currentPath.join("."), liveVal, spVal);
                } else if (typeof liveVal === "object" && spVal) {
                    await traverse(liveVal, spVal, currentPath);
                }
            }
        };

        /**
         * Process parameter-based alarms
         */
        const processAlarm = async (paramPath, liveVal, spVal) => {
            let severity = null;

            if (liveVal >= spVal.alarm) severity = "alarm";
            else if (liveVal >= spVal.warning) severity = "warning";

            const existing = await AlarmModel.findOne({
                parameter: paramPath,
                status: "active",
            });

            const formatMessage = (path) => {
                let parts = path.split(".");

                let category = "unit";
                if (parts[0] === "cylinders") category = "cylinder";
                else if (parts[0] === "stages") category = "stage";

                if (["cylinders", "stages", "unit"].includes(parts[0])) {
                    parts.shift();
                }

                parts = parts.map((p) => {
                    if (p.startsWith("cylinder_")) return "Cylinder " + p.split("_")[1];
                    else if (p.startsWith("stage_")) return "Stage " + p.split("_")[1];
                    else if (p === "head_end") return "Head End";
                    else if (p === "crank_end") return "Crank End";
                    else if (p === "avg") return "Average";
                    else return p
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                });

                return { category, displayName: parts.join(" ") };
            };

            const { category, displayName } = formatMessage(paramPath);
            const msg = `${displayName} exceeded ${severity?.toUpperCase()} limit`;

            if (severity) {
                if (!existing) {
                    await AlarmModel.create({
                        source: "CPM",
                        parameter: paramPath,
                        value: liveVal,
                        threshold: spVal[severity],
                        severity,
                        category: {
                            type: category,
                            name:
                                category === "cylinder"
                                    ? `Cylinder ${paramPath.split("_")[1]}`
                                    : category === "stage"
                                        ? `Stage ${paramPath.split("_")[1]}`
                                        : "Unit",
                        },
                        message: msg,
                        status: "active",
                        resolved: false,
                        resolvedAt: null,
                        timestamp: new Date(),
                    });

                    if (DEBUG_ALARMS)
                        console.log(`🚨 New ${severity.toUpperCase()} alarm => ${msg} | Value: ${liveVal}`);
                } else {
                    existing.value = liveVal;
                    existing.threshold = spVal[severity];
                    existing.severity = severity;
                    existing.message = msg;
                    existing.status = "active";
                    existing.resolved = false;
                    existing.timestamp = new Date();
                    await existing.save();

                    if (DEBUG_ALARMS)
                        console.log(`🔄 Updated ${severity.toUpperCase()} alarm => ${msg} | Value: ${liveVal}`);
                }
            } else if (existing) {
                existing.status = "resolved";
                existing.resolved = true;
                existing.resolvedAt = new Date();
                await existing.save();

                if (DEBUG_ALARMS)
                    console.log(`✅ Alarm resolved => ${displayName}`);
            }
        };

        await traverse(liveData.values, setpoints.toObject());
    } catch (err) {
        console.error("❌ CPM Alarm Check Error:", err);
    }
}

/**
 * Handle communication break alarm
 */
async function handleCommBreakAlarm() {
    const existing = await AlarmModel.findOne({
        parameter: "COMMUNICATION_BREAK",
        status: "active",
    });

    if (!existing) {
        await AlarmModel.create({
            source: "CPM",
            parameter: "COMMUNICATION_BREAK",
            value: 0,
            threshold: null,
            severity: "alarm",
            category: { type: "unit", name: "Unit" },
            message: `Communication with CPM device lost`,
            status: "active",
            resolved: false,
            resolvedAt: null,
            timestamp: new Date(),
        });

        console.log("🚨 COMM BREAK ALARM: CPM device unreachable");
    }
}

/**
 * Resolve communication break alarm
 */
async function resolveCommBreakAlarm() {
    const existing = await AlarmModel.findOne({
        parameter: "COMMUNICATION_BREAK",
        status: "active",
    });

    if (existing) {
        existing.status = "resolved";
        existing.resolved = true;
        existing.resolvedAt = new Date();
        await existing.save();

        console.log("✅ COMM BREAK RESOLVED: CPM device online");
    }
}

module.exports = cpmAlarmCheck;
