// hooks/useIoTData.ts
// Custom hook for polling ESP32 sensor data and toggling relays.
//
// Network flow:
//   Browser → Cloudflare HTTPS → Cloudflared Tunnel → Home Server (Reverse Proxy) → ESP32 :80
//
// CRITICAL: The UI state of devices is driven by CT sensor readings, NOT relay state.
// In a 2-way switching setup, the relay position doesn't indicate load — only the CT does.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Type Definitions ────────────────────────────────────────────────────────

export interface EnvData {
  roomTemp: number;
  roomHumidity: number;
  pressure?: number; // Atmospheric pressure (hPa)
  internalTemp?: number; // Backward compatibility for older payloads
  airQuality: number | string; // Air quality index or label
}

export interface PowerData {
  voltage: number;
  current: number;
  power: number; // Watts
  energy: number; // kWh
}

export interface PirData {
  motion: boolean;
}

export interface RelayData {
  r1: boolean;
  ct1: boolean;
  r2: boolean;
  ct2: boolean;
  r3: boolean;
  ct3: boolean;
  r4: boolean;
  ct4: boolean;
}

export interface SysData {
  ramFree: number;
  ramTotal: number;
  cpuFreq: number;
  uptime: number;
}

export interface IoTPayload {
  env: EnvData;
  power: PowerData;
  pir: PirData;
  relays: RelayData;
  sys: SysData;
}

export interface LogEntry {
  time: string;
  message: string;
  type: "info" | "alert";
}

// ── Configuration ───────────────────────────────────────────────────────────

// We no longer store the ESP32 URL or Cloudflare Secrets in the client bundle.
// All requests are now securely proxied through our Next.js API route (/api/iot/[...path]).

// ── Mock Data (used when hardware/tunnel is offline) ────────────────────────

const initialMockData: IoTPayload = {
  env: {
    roomTemp: 24.5,
    roomHumidity: 45.2,
    pressure: 1001.6,
    airQuality: 120,
  },
  power: {
    voltage: 230.1,
    current: 1.5,
    power: 345.0,
    energy: 12.5,
  },
  pir: {
    motion: false,
  },
  relays: {
    r1: true,
    ct1: true,
    r2: false,
    ct2: false,
    r3: true,
    ct3: false,
    r4: false,
    ct4: false,
  },
  sys: {
    ramFree: 128000,
    ramTotal: 320000,
    cpuFreq: 240,
    uptime: 3600,
  },
};

// ── Hook ────────────────────────────────────────────────────────────────────

export function useIoTData() {
  const [data, setData] = useState<IoTPayload | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pendingRelayIds, setPendingRelayIds] = useState<number[]>([]);

  // Persistent mock state so 1s polling doesn't reset toggled values during dev
  const mockDataRef = useRef<IoTPayload>(structuredClone(initialMockData));
  const prevDataRef = useRef<IoTPayload | null>(null);

  useEffect(() => {
    const handleNewData = (newData: IoTPayload) => {
      if (prevDataRef.current) {
        const newLogs: LogEntry[] = [];
        const now = new Date().toLocaleTimeString([], { hour12: false });

        // Check motion
        if (!prevDataRef.current.pir.motion && newData.pir.motion) {
          newLogs.push({ time: now, message: "⚠️ Motion Detected", type: "alert" });
        }

        // Check relays
        for (let i = 1; i <= 4; i++) {
          const key = `ct${i}` as keyof RelayData;
          if (!prevDataRef.current.relays[key] && newData.relays[key]) {
            newLogs.push({ time: now, message: `Device ${i} turned ON`, type: "info" });
            setPendingRelayIds((current) => current.filter((relayId) => relayId !== i));
          } else if (prevDataRef.current.relays[key] && !newData.relays[key]) {
            newLogs.push({ time: now, message: `Device ${i} turned OFF`, type: "info" });
            setPendingRelayIds((current) => current.filter((relayId) => relayId !== i));
          }
        }

        if (newLogs.length > 0) {
          setLogs((prev) => {
            const combined = [...newLogs, ...prev];
            return combined.slice(0, 15);
          });
        }
      }

      prevDataRef.current = structuredClone(newData);
      setData(newData);
    };

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/iot/data`);
        if (!res.ok) throw new Error(`ESP32 responded ${res.status}`);
        const json: IoTPayload = await res.json();
        handleNewData(normalizeEnvPayload(json));
        setError(false);
      } catch {
        setError(true);
        // Tunnel offline or ESP32 unreachable — serve mock data so the UI stays alive
        handleNewData(normalizeEnvPayload({ ...mockDataRef.current }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // 2 seconds per instructions
    return () => clearInterval(interval);
  }, []);

  // Sends a toggle command to the ESP32 via Cloudflare Tunnel.
  // Does NOT optimistically update UI — the next poll will pick up
  // the new CT sensor state once the physical load changes.
  const toggleRelay = useCallback(async (id: number) => {
    setPendingRelayIds((current) => (current.includes(id) ? current : [...current, id]));

    try {
      await fetch(`/api/iot/relay?id=${id}`, {
        method: "GET",
      });
    } catch {
      console.warn(`[IoT] Tunnel unreachable — mocking toggle for relay ${id}`);

      // In dev/mock mode, simulate the CT sensor detecting the load change
      const ctKey = `ct${id}` as keyof RelayData;
      mockDataRef.current = {
        ...mockDataRef.current,
        relays: {
          ...mockDataRef.current.relays,
          [ctKey]: !mockDataRef.current.relays[ctKey],
        },
      };
      // Let the next poll pick up the mock change automatically, 
      // or we can manually trigger handleNewData if needed.
    }
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { data, error, logs, clearLogs, toggleRelay, pendingRelayIds };
}

function normalizeEnvPayload(payload: IoTPayload): IoTPayload {
  return {
    ...payload,
    env: {
      ...payload.env,
      airQuality: normalizeAirQuality(payload.env.airQuality),
    },
  };
}

function normalizeAirQuality(value: number | string): number | string {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(parsed)) {
    return value;
  }

  // MQ135 raw analog readings are usually around 200–500; map to AQI-like 50–300.
  if (parsed >= 180 && parsed <= 550) {
    const mapped = ((parsed - 200) / 300) * 250 + 50;
    return Math.round(Math.max(0, Math.min(500, mapped)));
  }

  return Math.round(parsed);
}