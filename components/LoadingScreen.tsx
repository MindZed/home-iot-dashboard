// components/LoadingScreen.tsx
// High-fidelity animated loading screen displayed while the browser establishes
// its direct WebSocket (WSS) connection to the ESP32 via EMQX Cloud Serverless.

"use client";

import { motion } from "framer-motion";
import { Wifi, Cpu, ShieldCheck } from "lucide-react";

interface LoadingScreenProps {
  statusText?: string;
  onBypass?: () => void;
}

export default function LoadingScreen({
  statusText = "Connecting to ESP32 Node...",
  onBypass,
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E14] text-white px-6 overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/15 via-orange-600/15 to-rose-600/10 blur-3xl pointer-events-none" />

      {/* Central animated node icon with pulsing concentric rings */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer pulsing ring 1 */}
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-36 h-36 rounded-full border border-orange-500/30"
        />

        {/* Outer pulsing ring 2 */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute w-28 h-28 rounded-full border border-amber-400/40"
        />

        {/* Spinning gradient ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600"
        >
          <div className="w-full h-full rounded-full bg-[#10141D] flex items-center justify-center shadow-inner">
            <Cpu className="w-9 h-9 text-orange-400 animate-pulse" />
          </div>
        </motion.div>
      </div>

      {/* Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2 max-w-xs"
      >
        <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
          Home IoT Gateway
        </h2>
        <p className="text-xs text-neutral-400 font-medium">
          {statusText}
        </p>
      </motion.div>

      {/* Connection specs badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#151A24]/90 border border-white/10 text-[11px] text-neutral-400"
      >
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> TLS 8084
        </span>
        <span className="text-neutral-600">•</span>
        <span className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-orange-400" /> EMQX Cloud
        </span>
      </motion.div>

      {/* Optional fallback button if user wants to enter demo mode immediately */}
      {onBypass && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          onClick={onBypass}
          className="mt-6 text-[11px] text-neutral-500 hover:text-neutral-300 underline transition-colors"
        >
          Load demo dashboard
        </motion.button>
      )}
    </div>
  );
}
