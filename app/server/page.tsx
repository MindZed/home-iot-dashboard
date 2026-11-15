// app/server/page.tsx
// Dedicated Infrastructure view: Home Server (WoL), Office Laptop (WoL) & ESP32 Hardware Diagnostics.

"use client";

import Link from "next/link";
import { ChevronLeft, Server, ShieldCheck, Cpu, Terminal, ScrollText } from "lucide-react";

import { useIoTData } from "@/hooks/useIoTData";
import ServerControl from "@/components/ServerControl";
import SystemHealth from "@/components/SystemHealth";
import EventLog from "@/components/EventLog";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/LoadingScreen";

export default function ServerPage() {
  const { data, isConnecting, logs, clearLogs, wakeServer, wakeLaptop } = useIoTData();

  if (isConnecting && !data) {
    return <LoadingScreen statusText="Probing Infrastructure & ESP32 Node..." />;
  }

  if (!data) {
    return <LoadingScreen statusText="Syncing server infrastructure..." />;
  }

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
                Server & Gateway
              </h1>
              <p className="text-[11px] text-neutral-400 font-medium">
                Infrastructure Control
              </p>
            </div>

            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Server className="w-4 h-4" />
            </div>
          </header>

          {/* ── Home Server Control (Wake-on-LAN) ────────────────────── */}
          <section aria-label="Home Server Control">
            <ServerControl
              title="Home Server"
              ip="192.168.0.107"
              portLabel="SSH :22"
              mac="70:71:BC:77:51:A3"
              deviceType="server"
              server={data.server}
              onWake={wakeServer}
            />
          </section>

          {/* ── Office Laptop Control (Wake-on-LAN) ──────────────────── */}
          <section aria-label="Office Laptop Control">
            <ServerControl
              title="Office Laptop"
              ip="192.168.0.109"
              portLabel="Port :445"
              mac="40:C2:BA:15:55:47"
              deviceType="laptop"
              server={data.laptop || { online: false, checking: false, failed: false }}
              onWake={wakeLaptop}
            />
          </section>

          {/* ── System Diagnostics ──────────────────────────────────── */}
          <section aria-label="System Health">
            <SystemHealth sys={data.sys} />
          </section>

          {/* ── Live Event Logs ─────────────────────────────────────── */}
          <section aria-label="Event Log">
            <EventLog logs={logs} onClear={clearLogs} />
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
