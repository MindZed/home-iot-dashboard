# Software Architecture - Home IoT Frontend & Go Backend

This document describes the unified software architecture, networking, state management, and UI design system for the `home-iot-unified` system.

---

## 1. High-Level Architecture & Data Flow

```
[ ESP32 Hardware Node (Node 1) ]
       │  (MQTTS - TLS v1.3 on Port 8883)
       ▼
[ MindZed MQTT Broker (mqtt.mindzed.tech) ]
       │
       │  (Internal MQTT Client: paho.mqtt.golang)
       ▼
[ Dokploy Go Backend (home-iot.mindzed.tech:8080) ]
       ├── Ingestion Worker ──> [ SQLite WAL Database (/data/iot.db) ]
       │                            ├── telemetry_raw (10-15s resolution)
       │                            ├── power_hourly (Hourly kWh & peak metrics)
       │                            └── power_daily (Daily summaries)
       ├── Retention Engine (Monthly block pruning: retains 2 full calendar months)
       └── WebSocket Hub (/ws)
               ▲
               │  (WSS Encrypted WebSocket + HTTPS REST)
               ▼
[ Next.js 16 PWA Dashboard (sewen.me) ]
       ├── Single Global IoTProvider (app/layout.tsx)
       ├── Sub-15ms Bidirectional Control
       └── Black / White / Soft Red Stealth Design System
```

---

## 2. Go Backend & Database Engine (`backend/`)

* **Runtime:** Go 1.23 statically linked Alpine container (~22 MB).
* **Database:** Embedded SQLite in WAL mode (`modernc.org/sqlite` pure Go).
* **Retention Policy:**
  - **Raw Telemetry (`telemetry_raw`)**: Monthly block pruning: retains current month and 2 preceding calendar months intact (e.g. data from Nov 16 is retained until Jan 31; on Feb 1, the entire Nov month block is purged in a single batch via `DELETE FROM telemetry_raw WHERE timestamp < datetime('now', 'start of month', '-2 month')`).
  - **Hourly Power Rollup (`power_hourly`)**: Retained permanently for multi-year energy consumption analytics.
* **WebSocket Server (`/ws`)**:
  - Broadcasts live telemetry frames to all connected browsers (`telemetry`).
  - Dispatches optimistic relay commands (`toggle_relay`, `set_timer`).
  - Sends Wake-on-LAN commands (`wol`).
* **REST API Endpoints**:
  - `GET /api/v1/health`: Container & DB healthcheck.
  - `GET /api/v1/telemetry/latest`: Latest snapshot.
  - `GET /api/v1/analytics/power?range=24h|7d|30d`: Time-series power charts.
  - `GET /api/v1/analytics/climate?range=24h|7d|30d`: Time-series climate trends.
  - `GET /api/v1/analytics/summary`: Today's kWh, yesterday's kWh, peak power.
  - `POST /api/v1/relay/{id}/toggle`: REST alternative for relay toggling.
  - `POST /api/v1/wol`: REST alternative for Wake-on-LAN.

---

## 3. UI/UX Design System: Black, White & Soft Red

* **Background:** Pitch obsidian black (`#050608` / `#000000`).
* **Surfaces & Cards:** Deep glassmorphic obsidian (`#0D1017`) with subtle border highlights (`border-white/10`).
* **Primary Typography:** Crisp high-contrast white (`text-white`).
* **Accent Palette:**
  - Soft Red: `#EF4444` (`text-red-400`, `bg-red-500/15`, `border-red-500/30`)
  - Rose Crimson: `#F43F5E` (`from-red-600 via-rose-600 to-red-500`)
  - Active Glow: `rgba(239, 68, 68, 0.2)`
* **Active States:**
  - Active Relay Switch: Soft red gradient glow (`bg-gradient-to-br from-red-600 via-rose-600 to-red-500`).
  - Active Navigation Tab: Glowing crimson glass pill with soft-red active dot.
  - Live Sensors: Soft red accents for active power and feels-like temperature.

---

## 4. Hardware Power Supply Notice & Fallback
The 4-channel relay board is currently under-powered by the power supply. The frontend UI implements optimistic toggle execution with graceful timeouts, allowing the user to operate the UI cleanly without getting blocked if physical current sensing requires extra settling time.
