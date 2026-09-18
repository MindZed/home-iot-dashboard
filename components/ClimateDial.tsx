// components/ClimateDial.tsx
// Radial Temperature & Climate Gauge inspired by Screen 2 of the reference smart home design.
// Features circular tick marks, ambient temperature needle indicator, and an environment status card.

"use client";

import { motion } from "framer-motion";
import { Thermometer, Droplets, Wind, Sparkles, Activity } from "lucide-react";

interface ClimateDialProps {
  temperature: number; // e.g. 24.5
  humidity: number; // e.g. 45
  pressure: number; // e.g. 1009.1
  airQuality: number | string; // e.g. 120
  motionDetected: boolean;
}

export default function ClimateDial({
  temperature,
  humidity,
  pressure,
  airQuality,
  motionDetected,
}: ClimateDialProps) {
  // Temperature range: 16°C to 36°C (20 degree span)
  const minTemp = 16;
  const maxTemp = 36;
  const clampedTemp = Math.max(minTemp, Math.min(maxTemp, temperature));
  const tempRatio = (clampedTemp - minTemp) / (maxTemp - minTemp);

  // Radial dial geometry (240° arc from -120° to +120°)
  const startAngle = -120;
  const endAngle = 120;
  const angleSpan = endAngle - startAngle; // 240 degrees
  const currentAngle = startAngle + tempRatio * angleSpan;

  const center = 130;
  const radius = 95;
  const totalTicks = 32;

  // Air quality assessment
  const aqNum = typeof airQuality === "number" ? airQuality : parseInt(String(airQuality)) || 100;
  const getAqDetails = (aq: number) => {
    if (aq <= 50) return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/20", pct: 20 };
    if (aq <= 100) return { label: "Good", color: "text-teal-400", bg: "bg-teal-500/20", pct: 40 };
    if (aq <= 150) return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/20", pct: 65 };
    return { label: "Poor", color: "text-rose-400", bg: "bg-rose-500/20", pct: 90 };
  };

  const aqDetails = getAqDetails(aqNum);

  return (
    <div className="rounded-3xl bg-[#111622] border border-white/10 p-5 shadow-xl text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight">Room Climate</h2>
            <p className="text-[11px] text-neutral-400">BME280 Ambient Sensor</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
            motionDetected
              ? "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          {motionDetected ? "🚶 Motion Active" : "Clear"}
        </span>
      </div>

      {/* Radial Temperature Gauge */}
      <div className="relative flex flex-col items-center justify-center my-4">
        <svg width={260} height={230} className="overflow-visible select-none">
          <defs>
            <linearGradient id="climateGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Dial Radial Tick Marks */}
          {Array.from({ length: totalTicks }).map((_, i) => {
            const frac = i / (totalTicks - 1);
            const deg = startAngle + frac * angleSpan;
            const rad = ((deg - 90) * Math.PI) / 180;

            const isHighlighted = frac <= tempRatio;
            const inner = radius - 8;
            const outer = radius + (i % 4 === 0 ? 8 : 2);

            const x1 = center + inner * Math.cos(rad);
            const y1 = center + inner * Math.sin(rad);
            const x2 = center + outer * Math.cos(rad);
            const y2 = center + outer * Math.sin(rad);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHighlighted ? "#f97316" : "#262E40"}
                strokeWidth={i % 4 === 0 ? 3 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Needle Arrow at current temperature */}
          {(() => {
            const needleRad = ((currentAngle - 90) * Math.PI) / 180;
            const tipX = center + (radius + 15) * Math.cos(needleRad);
            const tipY = center + (radius + 15) * Math.sin(needleRad);
            const base1X = center + (radius + 3) * Math.cos(needleRad - 0.08);
            const base1Y = center + (radius + 3) * Math.sin(needleRad - 0.08);
            const base2X = center + (radius + 3) * Math.cos(needleRad + 0.08);
            const base2Y = center + (radius + 3) * Math.sin(needleRad + 0.08);

            return (
              <polygon
                points={`${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}`}
                fill="#f97316"
                className="filter drop-shadow"
              />
            );
          })()}

          {/* Inner Gauge Surface */}
          <circle
            cx={center}
            cy={center}
            r={radius - 22}
            fill="#141A26"
            stroke="#212A3B"
            strokeWidth={1.5}
          />
        </svg>

        {/* Center Digital Temperature Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 pointer-events-none">
          <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            {temperature.toFixed(1)}°C
          </span>
          <span className="text-[11px] font-semibold text-orange-400 uppercase tracking-widest mt-1">
            Current Temp
          </span>
          <div className="flex items-center gap-6 text-[11px] text-neutral-400 font-medium mt-2">
            <span>Min 16°C</span>
            <span>•</span>
            <span>Max 36°C</span>
          </div>
        </div>
      </div>

      {/* Lower Multi-Sensor Pill Panel (Screen 2 style) */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#171E2C] border border-white/[0.06] text-center">
        {/* Humidity */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#121722]/60">
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 uppercase font-bold mb-1">
            <Droplets className="w-3 h-3 text-sky-400" /> Humidity
          </div>
          <span className="text-sm font-bold text-white">
            {humidity.toFixed(0)}%
          </span>
        </div>

        {/* Pressure */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#121722]/60">
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 uppercase font-bold mb-1">
            <Wind className="w-3 h-3 text-amber-400" /> Pressure
          </div>
          <span className="text-sm font-bold text-white">
            {pressure.toFixed(1)} <span className="text-[10px] font-normal text-neutral-400">hPa</span>
          </span>
        </div>

        {/* Air Quality */}
        <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#121722]/60">
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 uppercase font-bold mb-1">
            <Sparkles className="w-3 h-3 text-teal-400" /> Air Quality
          </div>
          <span className={`text-sm font-bold ${aqDetails.color}`}>
            {aqNum} • {aqDetails.label}
          </span>
        </div>
      </div>

      {/* Air Quality Gradient Bar */}
      <div className="mt-3 px-1">
        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-medium mb-1">
          <span>Air Purity Spectrum</span>
          <span className={aqDetails.color}>{aqDetails.label}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#1D2536] overflow-hidden p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-500"
            style={{ width: `${aqDetails.pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
