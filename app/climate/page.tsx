// app/climate/page.tsx
// Dedicated Climate & Environment view replicating Screen 2 of the reference smart home design.

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Thermometer,
  Droplets,
  Wind,
  Sparkles,
  Activity,
  Flame,
  Clock,
  ShieldCheck,
} from "lucide-react";

import { useIoTData } from "@/hooks/useIoTData";
import ClimateDial from "@/components/ClimateDial";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

export default function ClimatePage() {
  const { data, isConnecting } = useIoTData();
  const [activeTab, setActiveTab] = useState<"temperature" | "statistics">("temperature");

  if (isConnecting && !data) {
    return <LoadingScreen statusText="Loading Room Climate Sensors..." />;
  }

  if (!data) {
    return <LoadingScreen statusText="Syncing climate data..." />;
  }

  // Calculate Dew Point approx
  const temp = data.env.roomTemp;
  const rh = data.env.roomHumidity;
  const dewPoint = (temp - ((100 - rh) / 5)).toFixed(1);

  // Air quality assessment
  const aqNum = typeof data.env.airQuality === "number" ? data.env.airQuality : parseInt(String(data.env.airQuality)) || 100;
  const getAirQualityAssessment = (aq: number) => {
    if (aq <= 50) return { status: "Clean Air", desc: "Optimal indoor environment for work and rest" };
    if (aq <= 100) return { status: "Good Quality", desc: "No harmful particulate buildup detected" };
    if (aq <= 150) return { status: "Moderate", desc: "Consider ventilating the room with fresh air" };
    return { status: "Elevated Particles", desc: "Turn on air purifier or open window" };
  };

  const aqInfo = getAirQualityAssessment(aqNum);

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] text-white font-sans transition-colors duration-300 antialiased selection:bg-orange-500/30 selection:text-orange-200">
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div className="max-w-md mx-auto space-y-5">
          {/* ── Top Bar (Screen 2 style) ─────────────────────────────── */}
          <header className="flex items-center justify-between pt-1">
            <Link
              href="/"
              className="p-2 rounded-2xl bg-[#131722] border border-white/10 hover:bg-[#1B2232] text-neutral-300 transition-colors"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="text-center">
              <h1 className="text-base font-bold text-white tracking-tight">
                Temperature & Air
              </h1>
              <p className="text-[11px] text-neutral-400 font-medium">
                Living Room / Office Node
              </p>
            </div>

            <div className="w-9 h-9 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Thermometer className="w-4 h-4" />
            </div>
          </header>

          {/* ── Segmented Control Tabs (Screen 2 style) ──────────────── */}
          <div className="flex p-1 rounded-2xl bg-[#121722] border border-white/[0.08] select-none">
            <button
              onClick={() => setActiveTab("temperature")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "temperature"
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/25"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "statistics"
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white shadow-md shadow-orange-500/25"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Environment Stats
            </button>
          </div>

          {/* ── Radial Dial Gauge (Screen 2 signature) ───────────────── */}
          <section aria-label="Temperature Radial Gauge">
            <ClimateDial
              temperature={data.env.roomTemp}
              humidity={data.env.roomHumidity}
              pressure={data.env.pressure ?? 1009.1}
              airQuality={data.env.airQuality}
              motionDetected={data.pir.motion}
            />
          </section>

          {/* ── Extended Climate Diagnostics ─────────────────────────── */}
          <section
            className="rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl space-y-3"
            aria-label="Atmospheric Metrics"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Atmospheric Comfort Metrics
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" /> Dew Point
                </div>
                <span className="text-base font-bold text-white">{dewPoint}°C</span>
                <p className="text-[10px] text-neutral-400 mt-0.5">Condensation limit</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  <Wind className="w-3.5 h-3.5 text-amber-400" /> Barometer
                </div>
                <span className="text-base font-bold text-white">
                  {(data.env.pressure ?? 1009.1).toFixed(1)} <span className="text-xs font-normal text-neutral-400">hPa</span>
                </span>
                <p className="text-[10px] text-neutral-400 mt-0.5">Standard pressure</p>
              </div>
            </div>

            {/* Air Quality Analysis Card */}
            <div className="p-3.5 rounded-2xl bg-[#171E2C] border border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">{aqInfo.status}</h3>
                  <p className="text-[10px] text-neutral-400">{aqInfo.desc}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-teal-400">
                AQI {aqNum}
              </span>
            </div>

            {/* Motion state badge */}
            <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <Activity className="w-4 h-4 text-orange-400" />
                <span className="font-semibold">PIR Occupancy Sensor</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.pir.motion
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {data.pir.motion ? "Active Movement" : "Room Clear"}
              </span>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
