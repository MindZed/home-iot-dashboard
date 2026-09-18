// components/ServerControl.tsx
// Home Server Wake-on-LAN control card with live ping feedback and dark obsidian styling.

"use client";

import { motion } from "framer-motion";
import { Server, Zap, Terminal, Activity, ShieldCheck, Loader2 } from "lucide-react";
import { ServerData } from "@/hooks/useIoTData";

interface ServerControlProps {
  server: ServerData;
  onWake: () => void;
}

export default function ServerControl({ server, onWake }: ServerControlProps) {
  const isOnline = server?.online;
  const isChecking = server?.checking;
  const isFailed = server?.failed;

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl transition-colors duration-300 text-white select-none"
      aria-label="Home Server Control"
    >
      {/* Background ambient glow when online */}
      {isOnline && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      )}
      {isChecking && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isOnline
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : isChecking
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                : "bg-[#1A2130] text-neutral-400 border border-white/[0.06]"
            }`}
          >
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Home Server
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              192.168.0.107 • SSH :22
            </p>
          </div>
        </div>

        {/* Status Pill Badge */}
        <div className="flex items-center">
          {isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Online
            </span>
          ) : isChecking ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Loader2 className="animate-spin h-3.5 w-3.5" />
              Checking...
            </span>
          ) : isFailed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Unreachable
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1C2333] text-neutral-400 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-neutral-500" />
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Network & Specs row */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
          <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mb-1">
            <Terminal className="w-3 h-3 text-orange-400" /> MAC Address
          </div>
          <p className="text-xs font-mono text-neutral-200 truncate">
            00:11:32:B1:3D:16
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
          <div className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-emerald-400" /> Health Ping
          </div>
          <p className="text-xs font-semibold text-neutral-200">
            {isOnline ? "Responding (Port 22)" : isChecking ? "Probing server..." : "No response"}
          </p>
        </div>
      </div>

      {/* Wake-on-LAN Trigger Button */}
      <button
        onClick={onWake}
        disabled={isChecking}
        className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
          isOnline
            ? "bg-[#1A2130] text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 cursor-default"
            : isChecking
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-wait animate-pulse"
            : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white hover:brightness-110 active:scale-[0.98] shadow-orange-500/25"
        }`}
      >
        {isChecking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Magic Packet & Probing...</span>
          </>
        ) : isOnline ? (
          <>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Server is Active & Ready</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-current" />
            <span>Wake-on-LAN (Power On Server)</span>
          </>
        )}
      </button>
    </motion.section>
  );
}
