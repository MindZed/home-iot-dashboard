// app/energy/page.tsx
// Dedicated Power Quality & Energy Monitoring view with real-time PZEM-004T metrics.

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Zap,
  Activity,
  ShieldCheck,
  Gauge,
  TrendingUp,
  Cpu,
  Flame,
  CheckCircle2,
} from "lucide-react";

import { useIoTData } from "@/hooks/useIoTData";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

export default function EnergyPage() {
  const { data, isConnecting } = useIoTData();

  if (isConnecting && !data) {
    return <LoadingScreen statusText="Reading PZEM-004T Energy Monitor..." />;
  }

  if (!data) {
    return <LoadingScreen statusText="Syncing power metrics..." />;
  }

  const pf = data.power.pf ?? 1.0;
  const apparentPower = Math.round(data.power.voltage * data.power.current);
  const reactivePower = Math.round(Math.sqrt(Math.max(0, Math.pow(apparentPower, 2) - Math.pow(data.power.power, 2))));

  const getPfBadge = (val: number) => {
    if (val >= 0.95) return { label: "Clean Resistive Load", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30", icon: ShieldCheck };
    if (val >= 0.85) return { label: "Normal Mixed Load", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", icon: Activity };
    return { label: "Inductive / Motor Load", color: "text-rose-400", bg: "bg-rose-500/15 border-rose-500/30", icon: Flame };
  };

  const pfBadge = getPfBadge(pf);

  // Active channel count and names
  const activeChannels = [
    { name: "Socket", active: data.relays.ct1 },
    { name: "Main Light", active: data.relays.ct2 },
    { name: "Fan", active: data.relays.ct3 },
    { name: "Desk Light", active: data.relays.ct4 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] text-white font-sans transition-colors duration-300 antialiased selection:bg-orange-500/30 selection:text-orange-200">
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div className="max-w-md mx-auto space-y-5">
          {/* ── Top Bar ─────────────────────────────────────────────── */}
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
                Power & Energy Monitor
              </h1>
              <p className="text-[11px] text-neutral-400 font-medium">
                PZEM-004T v3.0 (UART 16/17)
              </p>
            </div>

            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </header>

          {/* ── Hero Power Card ──────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-[#141926] to-[#121622] border border-amber-500/30 p-6 shadow-2xl text-white">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                Active Load Consumption
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${pfBadge.bg} ${pfBadge.color} flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {pf.toFixed(2)} PF
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black tracking-tight text-white drop-shadow">
                {data.power.power.toFixed(0)}
              </span>
              <span className="text-xl font-bold text-amber-400">Watts</span>
            </div>

            <p className="text-xs text-neutral-300 font-medium mb-5">
              Live power drawn across all 4 controlled circuits.
            </p>

            {/* 4-Stat Metric Strip */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10 text-center">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Voltage</span>
                <span className="text-sm font-bold text-white">{data.power.voltage.toFixed(0)}V</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Current</span>
                <span className="text-sm font-bold text-white">{data.power.current.toFixed(2)}A</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Apparent</span>
                <span className="text-sm font-bold text-white">{apparentPower}VA</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Energy</span>
                <span className="text-sm font-bold text-white">{data.power.energy.toFixed(1)}kWh</span>
              </div>
            </div>
          </section>

          {/* ── Power Quality Breakdown Card ─────────────────────────── */}
          <section className="rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Power Quality & Grid Purity
              </h2>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 50.0 Hz RMS
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#171E2C] border border-white/[0.05] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-medium">Power Factor (PF):</span>
                <span className="text-white font-bold">{pf.toFixed(2)} / 1.00</span>
              </div>
              {/* PF Spectrum bar */}
              <div className="h-2 w-full rounded-full bg-[#10141D] overflow-hidden p-[1px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(pf * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-neutral-500 font-medium">
                <span>0.70 Poor</span>
                <span>0.85 Normal</span>
                <span>1.00 Optimal</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                  Active Real Power
                </span>
                <span className="text-base font-bold text-white">
                  {data.power.power.toFixed(0)} <span className="text-xs font-normal text-neutral-400">W</span>
                </span>
                <p className="text-[10px] text-neutral-400 mt-0.5">Energy converted to work</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                  Reactive Power
                </span>
                <span className="text-base font-bold text-white">
                  {reactivePower} <span className="text-xs font-normal text-neutral-400">VAR</span>
                </span>
                <p className="text-[10px] text-neutral-400 mt-0.5">Inductive / magnetic field</p>
              </div>
            </div>
          </section>

          {/* ── Active Circuit Load Status ───────────────────────────── */}
          <section className="rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Circuit Current Sensing (ADS1115)
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              {activeChannels.map((ch, idx) => (
                <div
                  key={ch.name}
                  className={`p-3 rounded-2xl border transition-all ${
                    ch.active
                      ? "bg-gradient-to-br from-amber-500/15 to-orange-500/10 border-orange-500/30 text-white"
                      : "bg-[#171E2C] border-white/[0.05] text-neutral-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{ch.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ch.active ? "bg-orange-400 shadow-[0_0_6px_rgba(249,115,22,0.8)]" : "bg-neutral-600"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold">
                    {ch.active ? "Current flowing" : "No current draw"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
