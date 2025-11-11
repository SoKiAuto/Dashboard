"use client";

import React, { useEffect, useRef } from "react";

const AnalogTopSemiGauge = ({
  label = "Gauge Label",
  value = 0,
  unit = "",
  range = { min: 0, max: 100 },
  warningSetpoint = 70,
  alarmSetpoint = 90,
}) => {
  const canvasRef = useRef(null);
  const gaugeRef = useRef(null);

  useEffect(() => {
    // ✅ Import dynamically on client only
    import("canvas-gauges").then(({ RadialGauge }) => {
      const gauge = new RadialGauge({
        renderTo: canvasRef.current,
        width: 300,
        height: 300,
        units: "",
        title: false,
        minValue: range.min,
        maxValue: range.max,
        startAngle: 90,
        ticksAngle: 180,
        valueBox: false,
        majorTicks: [
          range.min.toString(),
          ((range.min + range.max) / 2).toString(),
          range.max.toString(),
        ],
        minorTicks: 4,
        strokeTicks: true,
        highlights: [
          { from: warningSetpoint, to: alarmSetpoint, color: "rgba(255,165,0,0.65)" },
          { from: alarmSetpoint, to: range.max, color: "rgba(255,0,0,0.65)" },
        ],
        colorPlate: "#fff",
        colorMajorTicks: "#000",
        colorMinorTicks: "#666",
        colorNumbers: "#000",
        borderShadowWidth: 0,
        borders: true,
        borderOuterWidth: 5,
        needleType: "arrow",
        needleWidth: 4,
        needleCircleSize: 8,
        needleCircleOuter: true,
        needleCircleInner: false,
        animationDuration: 600,
        animationRule: "linear",
        value: value,
      });

      gauge.draw();
      gaugeRef.current = gauge;
    });

    return () => {
      gaugeRef.current = null;
    };
  }, [value, range, warningSetpoint, alarmSetpoint]);

  return (
    <div
      style={{
        width: 300,
        textAlign: "center",
        fontFamily: "Calibri, Segoe UI, sans-serif",
        position: "relative",
        marginBottom: 50,
      }}
    >
      <div
        style={{
          width: 300,
          height: 215,
          margin: "0 auto",
          overflow: "hidden",
          background: "#fff",
          borderTopLeftRadius: 150,
          borderTopRightRadius: 150,
          borderBottomLeftRadius: 60,
          borderBottomRightRadius: 60,
          border: "2px solid #000",
          marginTop: 10,
        }}
      >
        <canvas ref={canvasRef} width={300} height={300}></canvas>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          background: "#fff",
          border: "3px solid #000",
          borderRadius: 6,
          padding: "8px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#000",
            textAlign: "left",
          }}
        >
          {label}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#172C51",
              lineHeight: 1,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#000",
              marginTop: 2,
            }}
          >
            {unit}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalogTopSemiGauge;
