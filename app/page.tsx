// app/page.tsx
// Mobile-first Smart Home IoT control center inspired by the reference design (@uix.vikram).
// Dark obsidian aesthetic, 2x2 grid device controls, rotary two-way edge timer modal,
// quick metric pill with deep-links, and floating glassmorphic navigation.

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Zap,
  Activity,
  Thermometer,
  Droplets,
  Server,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

import { useIoTData } from "../hooks/useIoTData";
import DeviceCard from "@/components/DeviceCard";
import QuickScenes from "@/components/QuickScenes";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const {
    data,
    isConnecting,
    logs,
    toggleRelay,
    pendingRelayIds,
    setRelayTimer,
  } = useIoTData();

  const [showNotificationTray, setShowNotificationTray] = useState<boolean>(false);

  // Animated loading screen until WebSocket connection delivers initial telemetry
  if (isConnecting && !data) {
    return <LoadingScreen statusText="Connecting directly to ESP32 via EMQX Cloud..." />;
  }

  if (!data) {
    return <LoadingScreen statusText="Syncing device telemetry..." />;
  }

  const activeDeviceCount = [
    data.relays.ct1,
    data.relays.ct2,
    data.relays.ct3,
    data.relays.ct4,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] text-white font-sans transition-colors duration-300 antialiased selection:bg-orange-500/30 selection:text-orange-200">
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div className="max-w-md mx-auto space-y-5">
          {/* ── Top Header (Screen 1 style) ─────────────────────────── */}
          <header className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              {/* User Avatar with online indicator */}
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-[2px] shadow-lg shadow-orange-500/20">
                  <div className="w-full h-full rounded-2xl bg-[#141A26] flex items-center justify-center font-bold text-sm text-white">
                    7
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0B0E14]" />
              </div>

              <div>
                <p className="text-xs text-neutral-400 font-medium">
                  Hey Seven 👋 <span className="text-orange-400 font-semibold">Welcome Back</span>
                </p>
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  Control your Smart home...
                </h1>
              </div>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationTray((prev) => !prev)}
                className="p-2.5 rounded-2xl bg-[#131722] border border-white/10 hover:bg-[#1B2232] text-neutral-300 transition-colors relative"
                aria-label="Alerts"
              >
                <Bell className="w-4 h-4" />
                {data.pir.motion && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                )}
                {data.pir.motion && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>

              {/* Quick Notification Dropdown */}
              <AnimatePresence>
                {showNotificationTray && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141926] border border-white/10 shadow-2xl p-3 z-50 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold">
                      <span>Node Status</span>
                      <span className="text-[10px] text-emerald-400">Online (WSS)</span>
                    </div>
                    <div className="py-2 space-y-1.5 text-neutral-300 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Broker: EMQX Cloud (Singapore)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>Motion: {data.pir.motion ? "Detected" : "Clear"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Active loads: {activeDeviceCount} of 4</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          {/* ── Summary Sensor Pill (Screen 1 style with links) ─────── */}
          <section
            className="p-3.5 rounded-3xl bg-[#121722] border border-white/10 shadow-lg grid grid-cols-3 gap-2 text-center select-none"
            aria-label="Summary sensors"
          >
            <Link
              href="/climate"
              className="flex items-center justify-center gap-2 p-1 hover:bg-white/[0.04] rounded-2xl transition-colors"
            >
              <Thermometer className="w-4 h-4 text-orange-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Temp</span>
                <span className="text-xs font-bold text-white">{data.env.roomTemp.toFixed(1)}°C</span>
              </div>
            </Link>

            <Link
              href="/climate"
              className="flex items-center justify-center gap-2 p-1 border-x border-white/[0.08] hover:bg-white/[0.04] rounded-2xl transition-colors"
            >
              <Droplets className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Humidity</span>
                <span className="text-xs font-bold text-white">{data.env.roomHumidity.toFixed(0)}%</span>
              </div>
            </Link>

            <Link
              href="/energy"
              className="flex items-center justify-center gap-2 p-1 hover:bg-white/[0.04] rounded-2xl transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Power</span>
                <span className="text-xs font-bold text-white">{data.power.power.toFixed(0)}W</span>
              </div>
            </Link>
          </section>

          {/* ── Horizontal Quick Scenes ─────────────────────────────── */}
          <QuickScenes
            relays={data.relays}
            onToggle={toggleRelay}
            pendingRelayIds={pendingRelayIds}
          />

          {/* ── Connected Devices Section (2x2 Grid from Screen 1) ──── */}
          <section aria-label="Connected Devices">
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Connected Devices
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {activeDeviceCount} Active
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">4 Channels</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <DeviceCard
                id={1}
                title="Socket"
                type="plug"
                hasLoad={data.relays.ct1}
                timerSec={data.relays.t1}
                timerAction={data.relays.tAct1}
                onToggle={toggleRelay}
                onSetTimer={setRelayTimer}
                isPending={pendingRelayIds.includes(1)}
              />
              <DeviceCard
                id={2}
                title="Main Light"
                type="light"
                hasLoad={data.relays.ct2}
                timerSec={data.relays.t2}
                timerAction={data.relays.tAct2}
                onToggle={toggleRelay}
                onSetTimer={setRelayTimer}
                isPending={pendingRelayIds.includes(2)}
              />
              <DeviceCard
                id={3}
                title="Fan"
                type="fan"
                hasLoad={data.relays.ct3}
                timerSec={data.relays.t3}
                timerAction={data.relays.tAct3}
                onToggle={toggleRelay}
                onSetTimer={setRelayTimer}
                isPending={pendingRelayIds.includes(3)}
              />
              <DeviceCard
                id={4}
                title="Desk Light"
                type="light"
                hasLoad={data.relays.ct4}
                timerSec={data.relays.t4}
                timerAction={data.relays.tAct4}
                onToggle={toggleRelay}
                onSetTimer={setRelayTimer}
                isPending={pendingRelayIds.includes(4)}
              />
            </div>
          </section>

          {/* ── Quick Overview Navigation Cards ─────────────────────── */}
          <section className="grid grid-cols-2 gap-3 pt-1" aria-label="Section shortcuts">
            {/* Climate Link Card */}
            <Link
              href="/climate"
              className="group p-4 rounded-3xl bg-[#121722] border border-white/10 hover:border-orange-500/40 transition-all flex flex-col justify-between select-none"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-orange-500/15 text-orange-400 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-orange-400 transition-colors" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Climate & Air</span>
                <span className="text-[11px] text-neutral-400">
                  {data.env.roomTemp.toFixed(1)}°C • {data.env.roomHumidity.toFixed(0)}%
                </span>
              </div>
            </Link>

            {/* Energy Link Card */}
            <Link
              href="/energy"
              className="group p-4 rounded-3xl bg-[#121722] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between select-none"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Energy Monitor</span>
                <span className="text-[11px] text-neutral-400">
                  {data.power.power.toFixed(0)}W • {(data.power.pf ?? 1.0).toFixed(2)} PF
                </span>
              </div>
            </Link>
          </section>

          {/* Server status banner */}
          <Link
            href="/server"
            className="p-4 rounded-3xl bg-[#121722] border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between select-none group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Home Server Gateway</span>
                <span className="text-[10px] text-neutral-400">
                  {data.server.online ? "Online (Port 22 SSH)" : "Offline • Tap for WoL"}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              Manage →
            </span>
          </Link>
        </div>
      </main>

      {/* Floating Glassmorphic Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}