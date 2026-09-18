// hooks/useIoTData.ts
// Real-time MQTT hook for ESP32 sensor telemetry and direct relay control.
//
// Network flow:
//   Browser (Next.js) <--- WSS (Port 8084) ---> EMQX Cloud Serverless <--- MQTTS (Port 8883) ---> ESP32 Node
//
// Eliminates local reverse-proxy / Cloudflare tunnel dependency.
// CRITICAL: The UI state of devices is driven by CT sensor readings, NOT relay state.
// In a 2-way switching setup, the relay position doesn't indicate load — only the CT does.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import mqtt, { MqttClient } from "mqtt";

// ── Type Definitions ────────────────────────────────────────────────────────

export interface EnvData {
  roomTemp: number;
  roomHumidity: number;
  internalTemp: number; // Box internal temperature or pressure
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

export interface ServerData {
  online: boolean;
  checking: boolean;
  failed: boolean;
}

export interface IoTPayload {
  env: EnvData;
  power: PowerData;
  pir: PirData;
  relays: RelayData;
  sys: SysData;
  server: ServerData;
}

export interface LogEntry {
  time: string;
  message: string;
  type: "info" | "alert";
}

// ── Mock Data (used when hardware/broker is offline) ────────────────────────

const initialMockData: IoTPayload = {
  env: {
    roomTemp: 24.5,
    roomHumidity: 45.2,
    internalTemp: 30.1,
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
  server: {
    online: false,
    checking: false,
    failed: false,
  },
};

const MQTT_URL =
  process.env.NEXT_PUBLIC_MQTT_URL ||
  "wss://z1314459.ala.asia-southeast1.emqxsl.com:8084/mqtt";
const MQTT_USER = process.env.NEXT_PUBLIC_MQTT_USER || "officeEsp";
const MQTT_PASS = process.env.NEXT_PUBLIC_MQTT_PASS || "esp32*s3";

const TOPIC_TELEMETRY = "home/node1/telemetry";
const TOPIC_STATUS = "home/node1/status";
const TOPIC_HEARTBEAT = "home/node1/heartbeat";
const TOPIC_RELAY_ACK = "home/node1/relay/+/ack";
const TOPIC_WOL_ACK = "home/node1/wol/ack";

// ── Hook ────────────────────────────────────────────────────────────────────

export function useIoTData() {
  const [data, setData] = useState<IoTPayload | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pendingRelayIds, setPendingRelayIds] = useState<number[]>([]);

  const clientRef = useRef<MqttClient | null>(null);
  const mockDataRef = useRef<IoTPayload>(structuredClone(initialMockData));
  const prevDataRef = useRef<IoTPayload | null>(null);

  const handleNewData = useCallback((newData: IoTPayload) => {
    if (prevDataRef.current) {
      const newLogs: LogEntry[] = [];
      const now = new Date().toLocaleTimeString([], { hour12: false });

      // Check server state transitions
      if (!prevDataRef.current.server.online && newData.server.online) {
        newLogs.push({ time: now, message: "🟢 Home Server is now ONLINE", type: "info" });
      } else if (prevDataRef.current.server.online && !newData.server.online) {
        newLogs.push({ time: now, message: "💤 Home Server is OFFLINE", type: "info" });
      }

      // Check motion transitions
      if (!prevDataRef.current.pir.motion && newData.pir.motion) {
        newLogs.push({ time: now, message: "⚠️ Motion Detected", type: "alert" });
      }

      // Check relay/load transitions
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
  }, []);

  useEffect(() => {
    // Connect directly to EMQX Cloud over WebSockets (TLS)
    const randomId = Math.random().toString(16).substring(2, 8);
    const client = mqtt.connect(MQTT_URL, {
      username: MQTT_USER,
      password: MQTT_PASS,
      clientId: `web-dash-${randomId}`,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 5000,
    });

    clientRef.current = client;

    client.on("connect", () => {
      console.log("[MQTT] Connected to EMQX Cloud broker");
      setError(false);
      client.subscribe(
        [TOPIC_TELEMETRY, TOPIC_STATUS, TOPIC_HEARTBEAT, TOPIC_RELAY_ACK, TOPIC_WOL_ACK],
        (err) => {
          if (err) {
            console.error("[MQTT] Subscription error:", err);
          }
        }
      );
    });

    client.on("message", (topic, message) => {
      try {
        const payloadStr = message.toString();
        const json = JSON.parse(payloadStr);

        if (topic === TOPIC_TELEMETRY) {
          const channels = json.channels || [];
          const transformed: IoTPayload = {
            env: {
              roomTemp: typeof json.env?.roomTemp === "string" ? parseFloat(json.env.roomTemp) : (json.env?.roomTemp ?? 0),
              roomHumidity: typeof json.env?.roomHumidity === "string" ? parseFloat(json.env.roomHumidity) : (json.env?.roomHumidity ?? 0),
              internalTemp: typeof json.env?.pressure === "string" ? parseFloat(json.env.pressure) : (json.env?.pressure ?? json.env?.internalTemp ?? 0),
              airQuality: json.env?.airQuality ?? 0,
            },
            power: {
              voltage: typeof json.power?.voltage === "string" ? parseFloat(json.power.voltage) : (json.power?.voltage ?? 0),
              current: typeof json.power?.current === "string" ? parseFloat(json.power.current) : (json.power?.current ?? 0),
              power: typeof json.power?.power === "string" ? parseFloat(json.power.power) : (json.power?.power ?? 0),
              energy: typeof json.power?.energy === "string" ? parseFloat(json.power.energy) : (json.power?.energy ?? 0),
            },
            pir: {
              motion: Boolean(json.pir?.motion),
            },
            relays: {
              r1: Boolean(channels[0]?.relay ?? json.relays?.r1),
              ct1: Boolean(channels[0]?.load ?? json.relays?.ct1),
              r2: Boolean(channels[1]?.relay ?? json.relays?.r2),
              ct2: Boolean(channels[1]?.load ?? json.relays?.ct2),
              r3: Boolean(channels[2]?.relay ?? json.relays?.r3),
              ct3: Boolean(channels[2]?.load ?? json.relays?.ct3),
              r4: Boolean(channels[3]?.relay ?? json.relays?.r4),
              ct4: Boolean(channels[3]?.load ?? json.relays?.ct4),
            },
            sys: {
              ramFree: (json.sys?.ramFreeKb ?? 0) * 1024,
              ramTotal: (json.sys?.ramTotalKb ?? 0) * 1024,
              cpuFreq: json.sys?.cpuFreqMhz ?? 240,
              uptime: (json.sys?.uptimeMin ?? 0) * 60,
            },
            server: {
              online: Boolean(json.server?.online),
              checking: Boolean(json.server?.checking),
              failed: Boolean(json.server?.failed),
            },
          };

          handleNewData(transformed);
          setError(false);
        } else if (topic === TOPIC_WOL_ACK) {
          const now = new Date().toLocaleTimeString([], { hour12: false });
          setLogs((prev) => [
            { time: now, message: "🚀 Magic Packet sent! Waking server...", type: "info" },
            ...prev.slice(0, 14),
          ]);
        } else if (topic === TOPIC_STATUS) {
          if (json.state === "offline") {
            setError(true);
          } else {
            setError(false);
          }
        }
      } catch (err) {
        console.error("[MQTT] Failed to parse message:", err);
      }
    });

    client.on("error", (err) => {
      console.warn("[MQTT] Connection error:", err.message);
      setError(true);
      // Serve mock data so UI doesn't crash during network disruptions
      handleNewData({ ...mockDataRef.current });
    });

    client.on("offline", () => {
      console.warn("[MQTT] Broker offline");
      setError(true);
    });

    // If no real data arrives within 2 seconds of mounting, load mock data as placeholder
    const timeout = setTimeout(() => {
      if (!prevDataRef.current) {
        handleNewData({ ...mockDataRef.current });
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      client.end(true);
    };
  }, [handleNewData]);

  // Sends toggle command directly over MQTT to ESP32: home/node1/relay/{id}/toggle
  const toggleRelay = useCallback((id: number) => {
    setPendingRelayIds((current) => (current.includes(id) ? current : [...current, id]));

    if (clientRef.current && clientRef.current.connected) {
      const topic = `home/node1/relay/${id}/toggle`;
      clientRef.current.publish(topic, "{}", { qos: 1 }, (err) => {
        if (err) {
          console.error(`[MQTT] Failed to publish relay ${id} toggle:`, err);
        } else {
          console.log(`[MQTT] Published toggle command to ${topic}`);
        }
      });
    } else {
      console.warn(`[MQTT] Not connected — mocking toggle for relay ${id}`);
      const ctKey = `ct${id}` as keyof RelayData;
      mockDataRef.current = {
        ...mockDataRef.current,
        relays: {
          ...mockDataRef.current.relays,
          [ctKey]: !mockDataRef.current.relays[ctKey],
        },
      };
      handleNewData({ ...mockDataRef.current });
    }
  }, [handleNewData]);

  // Sends Wake-on-LAN trigger command to ESP32: home/node1/wol/toggle
  const wakeServer = useCallback(() => {
    if (clientRef.current && clientRef.current.connected) {
      const topic = "home/node1/wol/toggle";
      clientRef.current.publish(topic, "{}", { qos: 1 }, (err) => {
        if (err) {
          console.error("[MQTT] Failed to trigger Wake-on-LAN:", err);
        } else {
          console.log("[MQTT] Published WoL command to", topic);
        }
      });
      // Optimistically show checking state
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          server: { ...prev.server, checking: true, failed: false },
        };
      });
    } else {
      console.warn("[MQTT] Not connected — mocking Wake-on-LAN");
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          server: { ...prev.server, checking: true, failed: false },
        };
      });
    }
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { data, error, logs, clearLogs, toggleRelay, pendingRelayIds, wakeServer };
}