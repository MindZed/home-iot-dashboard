// app/page.tsx
// Main dashboard page — mobile-first IoT control center.
// Layout: Environment sensors → Power monitor → Device cards → Bottom nav

"use client";

import DeviceCard from "@/components/DeviceCard";
import BottomNav from "@/components/BottomNav";
import { useIoTData } from "../hooks/useIoTData";
import { motion, Variants } from "framer-motion";

import SystemHealth from "@/components/SystemHealth";
import EventLog from "@/components/EventLog";
import ServerControl from "@/components/ServerControl";
import QuickScenes from "@/components/QuickScenes";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Home() {
  const {
    data,
    error,
    logs,
    clearLogs,
    toggleRelay,
    pendingRelayIds,
    wakeServer,
    setRelayTimer,
  } = useIoTData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 dark:border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-neutral-400 font-medium">
            Connecting to hardware…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-neutral-950 font-sans transition-colors duration-300">
      <main className="flex-1 overflow-y-auto p-5 pb-24">
        <motion.div 
          className="max-w-md mx-auto space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <motion.header variants={itemVariants} className="pt-3 pb-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Room</h1>
                <p
                  className={`mt-0.5 text-sm font-medium transition-colors ${
                    data.pir.motion ? "text-amber-600 dark:text-amber-500" : "text-gray-400 dark:text-neutral-500"
                  }`}
                >
                  {data.pir.motion ? "🚶 Motion Detected" : "Room is clear"}
                </p>
              </div>
              {error && (
                <span className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium">
                  ⚠ Offline
                </span>
              )}
            </div>
          </motion.header>

          {/* ── Environment Sensors ─────────────────────────────────── */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 dark:from-neutral-900 dark:to-red-950 p-5 text-white shadow-lg shadow-blue-200/40 dark:shadow-red-900/20 dark:border dark:border-red-500/20"
            aria-label="Environment sensors"
          >
            <div className="grid grid-cols-2 gap-4">
              <SensorTile
                icon="🌡️"
                label="Temperature"
                value={`${data.env.roomTemp.toFixed(1)}°C`}
              />
              <SensorTile
                icon="💧"
                label="Humidity"
                value={`${data.env.roomHumidity.toFixed(0)}%`}
              />
              <SensorTile
                icon="🌬️"
                label="Pressure"
                value={`${(data.env.pressure ?? 1009.1).toFixed(1)} hPa`}
              />
              <SensorTile
                icon="🌿"
                label="Air Quality"
                value={`${data.env.airQuality}`}
                subtitle={getAirQualityLabel(data.env.airQuality)}
              />
            </div>
          </motion.section>

          {/* ── 1-Tap Quick Scenes ──────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <QuickScenes
              relays={data.relays}
              onToggle={toggleRelay}
              pendingRelayIds={pendingRelayIds}
            />
          </motion.div>

          {/* ── Power Monitor ───────────────────────────────────────── */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 p-4 shadow-sm transition-colors duration-300"
            aria-label="Power monitor"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                ⚡ Power Monitor
              </h2>
              {/* Power Quality Badge based on PF */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  (data.power.pf ?? 1.0) >= 0.95
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/40"
                    : (data.power.pf ?? 1.0) >= 0.85
                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/40"
                    : "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/40"
                }`}
                title={`Power Factor: ${(data.power.pf ?? 1.0).toFixed(2)}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {(data.power.pf ?? 1.0).toFixed(2)} PF • {getPfClassification(data.power.pf ?? 1.0)}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center pb-2.5">
              <PowerStat
                value={`${data.power.voltage.toFixed(0)}`}
                unit="V"
              />
              <PowerStat
                value={`${data.power.current.toFixed(2)}`}
                unit="A"
              />
              <PowerStat
                value={`${data.power.power.toFixed(0)}`}
                unit="W"
              />
              <PowerStat
                value={`${data.power.energy.toFixed(1)}`}
                unit="kWh"
              />
            </div>

            {/* Apparent Power Breakdown */}
            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/70 flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500 font-medium px-0.5">
              <span>
                Apparent:{" "}
                <strong className="text-gray-700 dark:text-neutral-300">
                  {Math.round(data.power.voltage * data.power.current)} VA
                </strong>
              </span>
              <span>
                Grid:{" "}
                <strong className="text-gray-700 dark:text-neutral-300">
                  50 Hz • 230V RMS
                </strong>
              </span>
            </div>
          </motion.section>

          {/* ── Device Controls ─────────────────────────────────────── */}
          <motion.section variants={itemVariants} aria-label="Device controls">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-3 px-1">
              Devices
            </h2>
            <div className="flex flex-col gap-3">
              <DeviceCard
                id={1}
                title="Socket"
                type="plug"
                hasLoad={data.relays.ct1}
                timerSec={data.relays.t1}
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
                onToggle={toggleRelay}
                onSetTimer={setRelayTimer}
                isPending={pendingRelayIds.includes(4)}
              />
            </div>
          </motion.section>

          {/* ── Home Server Control (Wake-on-LAN) ───────────────────── */}
          <motion.div variants={itemVariants}>
            <ServerControl server={data.server} onWake={wakeServer} />
          </motion.div>

          {/* ── System Health ───────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <SystemHealth sys={data.sys} />
          </motion.div>

          {/* ── Event Log ───────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <EventLog logs={logs} onClear={clearLogs} />
          </motion.div>

        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

// ── Sub-components (co-located for simplicity) ──────────────────────────────

function SensorTile({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[11px] font-medium text-white/60 dark:text-neutral-300 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xl font-bold leading-tight">{value}</span>
      {subtitle && (
        <span className="text-[11px] font-medium text-white/70 dark:text-neutral-400">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function PowerStat({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
        {value}
      </span>
      <span className="text-[11px] font-medium text-gray-400 dark:text-neutral-500">{unit}</span>
    </div>
  );
}

function getAirQualityLabel(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "Unknown";
  if (numValue < 50) return "Excellent";
  if (numValue < 100) return "Good";
  if (numValue < 150) return "Moderate";
  if (numValue < 200) return "Poor";
  return "Hazardous";
}

function getPfClassification(pf: number): string {
  if (pf >= 0.95) return "Clean Resistive";
  if (pf >= 0.85) return "Normal Load";
  return "Inductive Motor";
}