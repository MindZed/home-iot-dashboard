// app/page.tsx
// Mobile-first Smart Home IoT control center inspired by the reference design (@uix.vikram).
// Dark obsidian aesthetic, 2x2 grid device controls, rotary two-way edge timer modal,
// radial climate gauge dial, live power factor monitoring, and floating glassmorphic navigation.

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Sparkles,
  Zap,
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Wifi,
} from "lucide-react";

import { useIoTData } from "../hooks/useIoTData";
import DeviceCard from "@/components/DeviceCard";
import ClimateDial from "@/components/ClimateDial";
import QuickScenes from "@/components/QuickScenes";
import ServerControl from "@/components/ServerControl";
import SystemHealth from "@/components/SystemHealth";
import EventLog from "@/components/EventLog";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const {
    data,
    isConnecting,
    error,
    logs,
    clearLogs,
    toggleRelay,
    pendingRelayIds,
    wakeServer,
    setRelayTimer,
  } = useIoTData();

  const [activeNavTab, setActiveNavTab] = useState<string>("home");
  const [showNotificationTray, setShowNotificationTray] = useState<boolean>(false);

  // Animated loading screen until WebSocket connection delivers initial telemetry
  if (isConnecting && !data) {
    return <LoadingScreen statusText="Connecting directly to ESP32 via EMQX Cloud..." />;
  }

  // Safety fallback if data is null
  if (!data) {
    return <LoadingScreen statusText="Syncing device telemetry..." />;
  }

  // Power Quality assessment helper
  const getPfClassification = (pf: number) => {
    if (pf >= 0.95) return "Clean Resistive";
    if (pf >= 0.85) return "Normal Load";
    return "Inductive Motor";
  };

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

          {/* ── Summary Sensor Pill (Screen 1 style) ─────────────────── */}
          <section
            className="p-3.5 rounded-3xl bg-[#121722] border border-white/10 shadow-lg grid grid-cols-3 gap-2 text-center"
            aria-label="Summary sensors"
          >
            <div className="flex items-center justify-center gap-2 p-1">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Temp</span>
                <span className="text-xs font-bold text-white">{data.env.roomTemp.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-1 border-x border-white/[0.08]">
              <Droplets className="w-4 h-4 text-sky-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Humidity</span>
                <span className="text-xs font-bold text-white">{data.env.roomHumidity.toFixed(0)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Power</span>
                <span className="text-xs font-bold text-white">{data.power.power.toFixed(0)}W</span>
              </div>
            </div>
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

          {/* ── Climate Dial & Environment Gauge (Screen 2 style) ───── */}
          <section id="climate" aria-label="Room Climate">
            <ClimateDial
              temperature={data.env.roomTemp}
              humidity={data.env.roomHumidity}
              pressure={data.env.pressure ?? 1009.1}
              airQuality={data.env.airQuality}
              motionDetected={data.pir.motion}
            />
          </section>

          {/* ── Power Monitor Card ──────────────────────────────────── */}
          <section
            id="energy"
            className="rounded-3xl bg-[#121722] border border-white/10 p-5 shadow-xl text-white select-none"
            aria-label="Power Monitor"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight">Power Monitor</h2>
                  <p className="text-[11px] text-neutral-400">PZEM-004T Real-time Metrics</p>
                </div>
              </div>

              {/* Power Quality Badge based on PF */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                  (data.power.pf ?? 1.0) >= 0.95
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : (data.power.pf ?? 1.0) >= 0.85
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
                title={`Power Factor: ${(data.power.pf ?? 1.0).toFixed(2)}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {(data.power.pf ?? 1.0).toFixed(2)} PF • {getPfClassification(data.power.pf ?? 1.0)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pb-3 border-b border-white/[0.08]">
              <div className="p-2 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Voltage</span>
                <span className="text-base font-bold text-white">{data.power.voltage.toFixed(0)}</span>
                <span className="text-[10px] text-neutral-400 font-normal"> V</span>
              </div>

              <div className="p-2 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Current</span>
                <span className="text-base font-bold text-white">{data.power.current.toFixed(2)}</span>
                <span className="text-[10px] text-neutral-400 font-normal"> A</span>
              </div>

              <div className="p-2 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Power</span>
                <span className="text-base font-bold text-amber-400">{data.power.power.toFixed(0)}</span>
                <span className="text-[10px] text-neutral-400 font-normal"> W</span>
              </div>

              <div className="p-2 rounded-2xl bg-[#171E2C] border border-white/[0.05]">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Energy</span>
                <span className="text-base font-bold text-white">{data.power.energy.toFixed(1)}</span>
                <span className="text-[10px] text-neutral-400 font-normal"> kWh</span>
              </div>
            </div>

            {/* Apparent Power & Frequency Row */}
            <div className="pt-3 flex items-center justify-between text-[11px] text-neutral-400 font-medium px-1">
              <span>
                Apparent:{" "}
                <strong className="text-neutral-200">
                  {Math.round(data.power.voltage * data.power.current)} VA
                </strong>
              </span>
              <span>
                Grid: <strong className="text-neutral-200">50 Hz • 230V RMS</strong>
              </span>
            </div>
          </section>

          {/* ── Home Server Control (Wake-on-LAN) ───────────────────── */}
          <section id="server">
            <ServerControl server={data.server} onWake={wakeServer} />
          </section>

          {/* ── System Health ───────────────────────────────────────── */}
          <section id="system">
            <SystemHealth sys={data.sys} />
          </section>

          {/* ── Live Event Log ──────────────────────────────────────── */}
          <section>
            <EventLog logs={logs} onClear={clearLogs} />
          </section>
        </div>
      </main>

      {/* Floating Glassmorphic Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeNavTab}
        onTabChange={(tab) => setActiveNavTab(tab)}
      />
    </div>
  );
}