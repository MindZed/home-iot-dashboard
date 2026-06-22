// app/page.tsx
// Main dashboard page — mobile-first IoT control center.
// Layout: Environment sensors → Power monitor → Device cards → Bottom nav

"use client";

import DeviceCard from "@/components/DeviceCard";
import BottomNav from "@/components/BottomNav";
import { useIoTData } from "../hooks/useIoTData";

export default function Home() {
  const { data, error, toggleRelay } = useIoTData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 font-medium">
            Connecting to hardware…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <main className="flex-1 overflow-y-auto p-5 pb-24">
        <div className="max-w-md mx-auto space-y-5">
          {/* ── Header ──────────────────────────────────────────────── */}
          <header className="pt-3 pb-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Room</h1>
                <p
                  className={`mt-0.5 text-sm font-medium transition-colors ${
                    data.pir.motion ? "text-amber-600" : "text-gray-400"
                  }`}
                >
                  {data.pir.motion ? "🚶 Motion Detected" : "Room is clear"}
                </p>
              </div>
              {error && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  ⚠ Offline
                </span>
              )}
            </div>
          </header>

          {/* ── Environment Sensors ─────────────────────────────────── */}
          <section
            className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white shadow-lg shadow-blue-200/40"
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
                icon="🌀"
                label="Pressure"
                value={`${data.env.pressure.toFixed(0)} hPa`}
              />
              <SensorTile
                icon="🌿"
                label="Air Quality"
                value={`${data.env.gasQuality}`}
                subtitle={getAirQualityLabel(data.env.gasQuality)}
              />
            </div>
          </section>

          {/* ── Power Monitor ───────────────────────────────────────── */}
          <section
            className="rounded-2xl bg-white border border-gray-200/80 p-4 shadow-sm"
            aria-label="Power monitor"
          >
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              ⚡ Power Monitor
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
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
          </section>

          {/* ── Device Controls ─────────────────────────────────────── */}
          <section aria-label="Device controls">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
              Devices
            </h2>
            <div className="flex flex-col gap-3">
              <DeviceCard
                id={1}
                title="Main Light"
                type="light"
                hasLoad={data.relays.ct1}
                onToggle={toggleRelay}
              />
              <DeviceCard
                id={2}
                title="Ceiling Fan"
                type="fan"
                hasLoad={data.relays.ct2}
                onToggle={toggleRelay}
              />
              <DeviceCard
                id={3}
                title="Desk Lamp"
                type="light"
                hasLoad={data.relays.ct3}
                onToggle={toggleRelay}
              />
              <DeviceCard
                id={4}
                title="Spare Plug"
                type="plug"
                hasLoad={data.relays.ct4}
                onToggle={toggleRelay}
              />
            </div>
          </section>
        </div>
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
      <span className="text-[11px] font-medium text-white/60 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-xl font-bold leading-tight">{value}</span>
      {subtitle && (
        <span className="text-[11px] font-medium text-white/70">
          {subtitle}
        </span>
      )}
    </div>
  );
}

function PowerStat({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold text-gray-800 leading-tight">
        {value}
      </span>
      <span className="text-[11px] font-medium text-gray-400">{unit}</span>
    </div>
  );
}

function getAirQualityLabel(value: number): string {
  if (value < 50) return "Excellent";
  if (value < 100) return "Good";
  if (value < 150) return "Moderate";
  if (value < 200) return "Poor";
  return "Hazardous";
}