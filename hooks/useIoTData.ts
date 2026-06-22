// hooks/useIoTData.ts
// Custom hook for polling ESP32 sensor data and toggling relays via n8n webhook.
// CRITICAL: The UI state of devices is driven by CT sensor readings, NOT relay state.
// In a 2-way switching setup, the relay position doesn't indicate load — only the CT does.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Type Definitions ────────────────────────────────────────────────────────

export interface EnvData {
  roomTemp: number;
  roomHumidity: number;
  pressure: number; // BMP280 atmospheric pressure (hPa)
  gasQuality: number; // MQ sensor air quality index
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

export interface IoTPayload {
  env: EnvData;
  power: PowerData;
  pir: PirData;
  relays: RelayData;
}

// ── Configuration ───────────────────────────────────────────────────────────

// ESP32 endpoint for polling sensor data
const ESP32_IP = "http://192.168.1.XXX";

// n8n webhook endpoint for toggling relays
const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/toggle-relay";

// ── Mock Data (used when hardware is offline) ───────────────────────────────

const initialMockData: IoTPayload = {
  env: {
    roomTemp: 24.5,
    roomHumidity: 45.2,
    pressure: 1013.25,
    gasQuality: 120,
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
};

// ── Hook ────────────────────────────────────────────────────────────────────

export function useIoTData() {
  const [data, setData] = useState<IoTPayload | null>(null);
  const [error, setError] = useState<boolean>(false);

  // Persistent mock state so 1s polling doesn't reset toggled values during dev
  const mockDataRef = useRef<IoTPayload>(structuredClone(initialMockData));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${ESP32_IP}/api/data`);
        if (!res.ok) throw new Error("Network response was not ok");
        const json: IoTPayload = await res.json();
        setData(json);
        setError(false);
      } catch {
        setError(true);
        // Serve mock data for UI development without hardware
        setData({ ...mockDataRef.current });
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fires an n8n webhook to toggle the relay.
  // Does NOT optimistically update UI — the next poll will pick up
  // the new CT sensor state once the physical load changes.
  const toggleRelay = useCallback(async (id: number) => {
    try {
      await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relayId: id }),
      });
    } catch {
      console.warn(`[IoT] Webhook unreachable — mocking toggle for relay ${id}`);

      // In dev/mock mode, simulate the CT sensor detecting the load change
      const ctKey = `ct${id}` as keyof RelayData;
      mockDataRef.current = {
        ...mockDataRef.current,
        relays: {
          ...mockDataRef.current.relays,
          [ctKey]: !mockDataRef.current.relays[ctKey],
        },
      };
      setData({ ...mockDataRef.current });
    }
  }, []);

  return { data, error, toggleRelay };
}