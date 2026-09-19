// components/MoldComfortCard.tsx
// Displays indoor thermal comfort ("Feels Like" Heat Index) and ASHRAE mold spore germination risk.

"use client";

import { motion } from "framer-motion";
import { Thermometer, ShieldAlert, ShieldCheck, Droplets, Wind, AlertTriangle, Fan } from "lucide-react";
import { getComfortAssessment } from "@/lib/climateCalculations";

interface MoldComfortCardProps {
  temperature: number;
  humidity: number;
  pressure?: number;
  onTurnOnFan?: () => void;
  isFanOn?: boolean;
}

export default function MoldComfortCard({
  temperature,
  humidity,
  pressure = 1009.1,
  onTurnOnFan,
  isFanOn = false,
}: MoldComfortCardProps) {
  const assessment = getComfortAssessment(temperature, humidity, pressure);

  const getRiskGradient = () => {
    switch (assessment.moldRiskLevel) {
      case "critical":
        return "from-rose-500/20 to-red-600/10 border-rose-500/40 text-rose-400";
      case "high":
        return "from-orange-500/20 to-amber-600/10 border-orange-500/40 text-orange-400";
      case "moderate":
        return "from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-400";
      case "low":
        return "from-teal-500/20 to-emerald-600/10 border-teal-500/30 text-teal-400";
      case "minimal":
      default:
        return "from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-400";
    }
  };

  const getBarColor = (score: number) => {
    if (score < 25) return "bg-emerald-400";
    if (score < 50) return "bg-teal-400";
    if (score < 70) return "bg-amber-400";
    if (score < 85) return "bg-orange-500";
    return "bg-rose-500";
  };

  return (
    <div className="rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Thermal Comfort & Health
            </h2>
            <p className="text-[10px] text-neutral-500">Perceived Heat Index & Spore Growth</p>
          </div>
        </div>

        {/* Feels Like Pill */}
        <div className="px-3 py-1 rounded-2xl bg-[#171E2C] border border-white/[0.08] text-right">
          <span className="text-[10px] uppercase font-bold text-neutral-400 block leading-none">
            Feels Like
          </span>
          <span className={`text-sm font-extrabold ${assessment.comfortColor}`}>
            {assessment.feelsLike}°C
          </span>
        </div>
      </div>

      {/* Sensation summary row */}
      <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05] flex items-center justify-between text-xs">
        <span className="text-neutral-400">Atmospheric Sensation</span>
        <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] bg-white/[0.05] border border-white/10 ${assessment.comfortColor}`}>
          {assessment.comfortLevel}
        </span>
      </div>

      {/* ── Mold Spore Germination Risk ─────────────────────────────── */}
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${getRiskGradient()} border space-y-3`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {assessment.moldRiskScore >= 70 ? (
              <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 animate-bounce" />
            ) : assessment.moldRiskScore >= 45 ? (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <h3 className="text-xs font-bold text-white capitalize">
                {assessment.moldRiskLevel} Mold Spore Risk
              </h3>
              <p className="text-[10px] text-neutral-300">
                ASHRAE 160 Moisture Assessment
              </p>
            </div>
          </div>
          <span className="text-sm font-black text-white">
            {assessment.moldRiskScore}%
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${assessment.moldRiskScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${getBarColor(assessment.moldRiskScore)}`}
            />
          </div>
          <div className="flex justify-between text-[9px] text-neutral-400 font-medium px-0.5">
            <span>Dormant (Safe)</span>
            <span>Caution (65%)</span>
            <span>Germination (75%+)</span>
          </div>
        </div>

        {/* Recommendation text */}
        <p className="text-[11px] text-neutral-200 leading-relaxed font-medium">
          {assessment.moldRecommendation}
        </p>

        {/* Quick action button if humidity is high and fan is available */}
        {assessment.moldRiskScore >= 50 && onTurnOnFan && (
          <button
            onClick={onTurnOnFan}
            disabled={isFanOn}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isFanOn
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-white/15 hover:bg-white/25 text-white border border-white/20 active:scale-[0.98]"
            }`}
          >
            <Fan className={`w-3.5 h-3.5 ${isFanOn ? "animate-spin" : ""}`} />
            <span>{isFanOn ? "Ventilation Fan Active" : "Activate Fan to Reduce Humidity"}</span>
          </button>
        )}
      </div>

      {/* Weather trend & Dew point info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-[#171E2C] border border-white/[0.05]">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
            Condensation Margin
          </span>
          <span className="font-bold text-white">
            {(temperature - assessment.dewPoint).toFixed(1)}°C <span className="text-[10px] font-normal text-neutral-400">spread</span>
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#171E2C] border border-white/[0.05]">
          <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
            Barometer State
          </span>
          <span className="font-bold text-white text-[11px] truncate block">
            {assessment.weatherTrend.split(" ")[0]} ({pressure.toFixed(0)} hPa)
          </span>
        </div>
      </div>
    </div>
  );
}
