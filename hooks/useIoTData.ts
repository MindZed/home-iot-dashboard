// hooks/useIoTData.ts
// Real-time IoT hook bridging to the global singleton IoTProvider context.
//
// Network flow:
//   Browser (Next.js) <--- WSS (Port 8084) ---> EMQX Cloud Serverless <--- MQTTS (Port 8883) ---> ESP32 Node
//
// Maintains 100% backward compatibility for all components while delegating to the single persistent
// application-level WebSocket session. Route changes do NOT re-render, reload, or disconnect the broker.

"use client";

import { useIoTContext } from "@/context/IoTContext";

export type {
  EnvData,
  PowerData,
  PirData,
  RelayData,
  SysData,
  ServerData,
  IoTPayload,
  LogEntry,
  IoTContextType,
} from "@/context/IoTContext";

export function useIoTData() {
  return useIoTContext();
}