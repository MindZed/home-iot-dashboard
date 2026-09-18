// components/SystemHealth.tsx
// Displays ESP32 core system diagnostics (CPU, Free RAM, Uptime) in dark obsidian styling.

"use client";

import { motion } from "framer-motion";
import { Cpu, Layers, Clock, Activity } from "lucide-react";
import { SysData } from "@/hooks/useIoTData";

export default function SystemHealth({ sys }: { sys: SysData }) {
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h === 0) return `${m}m ${s}s`;
    return `${h}h ${m}m`;
  };

  const formatRam = (bytes: number) => {
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const ramUsedPct =
    sys.ramTotal > 0
      ? Math.round(((sys.ramTotal - sys.ramFree) / sys.ramTotal) * 100)
      : 16;

  return (
    <motion.section
      className="rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl text-white select-none"
      aria-label="System Health"
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight">ESP32 Core Health</h2>
            <p className="text-[11px] text-neutral-400">Node Diagnostic Telemetry</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Normal
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-white/[0.08]">
        <div className="p-2.5 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-bold uppercase mb-1">
            <Activity className="w-3 h-3 text-orange-400" /> CPU
          </div>
          <span className="text-sm font-bold text-white">{sys.cpuFreq}</span>
          <span className="text-[10px] text-neutral-400"> MHz</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-bold uppercase mb-1">
            <Layers className="w-3 h-3 text-sky-400" /> Free RAM
          </div>
          <span className="text-sm font-bold text-white">{formatRam(sys.ramFree)}</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
          <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400 font-bold uppercase mb-1">
            <Clock className="w-3 h-3 text-amber-400" /> Uptime
          </div>
          <span className="text-sm font-bold text-white">{formatUptime(sys.uptime)}</span>
        </div>
      </div>

      {/* RAM Utilization Bar */}
      <div className="pt-3 px-0.5">
        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-medium mb-1">
          <span>SRAM Heap Utilization</span>
          <span className="text-neutral-200 font-semibold">{ramUsedPct}% used</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#1C2433] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-orange-500 transition-all duration-500"
            style={{ width: `${ramUsedPct}%` }}
          />
        </div>
      </div>
    </motion.section>
  );
}
