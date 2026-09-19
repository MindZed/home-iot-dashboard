# Home IoT Dashboard - Software Architecture

## Overview
This document contains the architecture, tech stack, and structure for the `home-iot-dashboard` project. 
**Agent Instruction:** This file must be updated whenever any modifications are made to the database schema, core frontend structure, dependencies, or routing configurations to ensure the documentation stays perfectly in sync with the code.

## Tech Stack
- **Framework**: Next.js (App Router, v16)
- **UI & Styling**: React (v19), Tailwind CSS (v4), Framer Motion (for animations)
- **IoT Transport**: MQTT over WebSockets (WSS on Port 8084) via `mqtt` package
- **Database & ORM**: PostgreSQL (Neon Serverless), Prisma (v7)
- **Authentication**: `jose` (JWT), `bcryptjs` (hashing)
- **Other Features**: PWA enabled via `@ducanh2912/next-pwa`

## Real-Time MQTT Architecture
- **Global Singleton Provider (`IoTProvider`)**: Wrapped at the application root level in `app/layout.tsx`. Maintains a single persistent WSS MQTT connection across the entire application lifecycle.
- **Persistent Telemetry Cache**: Page transitions between `/`, `/climate`, `/energy`, `/server`, and `/settings` are pure client-side transitions that share the same global context. No socket disconnects, loading screen flashes, or telemetry refetch delays occur on navigation.
- **Hook Bridge (`useIoTData`)**: Delegated directly to `useIoTContext()`, preserving 100% backward compatibility with all existing components and pages.
- Direct browser connection to EMQX Serverless (`wss://z1314459.ala.asia-southeast1.emqxsl.com:8084/mqtt`).
- Completely decouples the dashboard from the local home server and Cloudflare tunnel (100% Vercel compatible).
- Subscribes to `home/node1/telemetry`, `home/node1/status`, `home/node1/heartbeat`, `home/node1/relay/+/timer_ack`, `home/node1/wol/ack`.
- **Optimistic UI Execution & Fast ACKs**: Switch clicks trigger instant 0ms optimistic visual response on the client with dual-transient audio clicks. The dashboard subscribes directly to `home/node1/relay/+/ack`, updating real-time hardware confirmation and clearing pending state in `<30ms`. In-flight telemetry is prevented from reverting the optimistic toggle for at least 1500ms before falling back if hardware confirmation is absent.
- Controls relays with sub-40ms latency by publishing directly to `home/node1/relay/{id}/toggle`.
- On-device Two-Way Edge Timers: Publishes to `home/node1/relay/{id}/timer` (`{"seconds": 300, "action": "off"}` or `{"seconds": 600, "action": "on"}`); ESP32 manages hardware countdown up to 24h on edge.
- Sends Wake-on-LAN packets on demand by publishing to `home/node1/wol/toggle` with live server status feedback.
- 1-Tap Master Scenes ("Leave Home / All Off", "Work Mode", "Night Mode", "All On").
- Power Quality Monitoring: Displays real-time Power Factor (PF) load classification and Apparent Power (VA).

## UI/UX Architecture & Mobile PWA Design
- Dark obsidian theme (`#0B0E14`) inspired by modern smart home interfaces (@uix.vikram).
- **FeedbackEngine (`lib/feedback.ts`, `hooks/useFeedback.ts`)**: Pure Web Audio API synthesized mechanical relay switch click sounds, rotary dial micro-ticks, and 1-tap scene harmonic chimes with `navigator.vibrate` micro-haptics. Zero external sound files. Includes persistent user toggle (`FeedbackToggle`).
- **MoldComfortCard (`components/MoldComfortCard.tsx`, `lib/climateCalculations.ts`)**: Evaluates real-time perceived temperature ("Feels Like" Heat Index via NOAA Steadman formula), Dew Point condensation margin, and ASHRAE 160 indoor mold spore germination risk (0-100%) with actionable fan ventilation triggers.
- **LoadingScreen**: Animated concentric pulsing hub showing live WSS handshake until ESP32 telemetry syncs.
- **DeviceCard**: 2x2 grid layout with sunset-orange gradient active glow (`from-amber-500 via-orange-600 to-rose-600`), CT-driven states, tactile sound feedback, and Lucide vector icons.
- **TimerModal**: 360° interactive rotary dial supporting two-way auto-off / auto-on timers up to 24 hours with dial tick sound feedback.
- **ClimateDial**: Radial temperature gauge with circular ticks, ambient needle, humidity, pressure, and air quality bar.
- **BottomNav**: Subtle, textless, floating glassmorphic pill bar (`backdrop-blur-2xl`) with Lucide vector icons (`Home`, `Climate`, `Energy`, `Server`, `Settings`).

## Page Routing Structure
- `/`: Main dashboard with greeting, quick 3-metric pill, 1-tap scenes, 2x2 device grid, and section shortcuts.
- `/climate`: Dedicated climate & environment page recreating Screen 2 of the reference design with the radial gauge dial and comfort analytics.
- `/energy`: Dedicated power monitoring page with real-time active watts, apparent power (VA), power factor quality badge, and circuit load states.
- `/server`: Dedicated infrastructure page with Wake-on-LAN control, SSH port 22 health ping, ESP32 CPU/RAM diagnostics, and live event console.
- `/settings`: User credentials, MQTT broker configuration, and offline PWA settings.

## Directory Structure
- `app/`: Next.js App Router endpoints and pages (`page.tsx`, `climate/`, `energy/`, `server/`, `settings/`, `login/`).
- `components/`: Reusable React UI components (`DeviceCard`, `ClimateDial`, `TimerModal`, `LoadingScreen`, `ServerControl`, `QuickScenes`, `SystemHealth`, `EventLog`, `BottomNav`).
- `context/`: React context providers for state management.
- `hooks/`: Custom React hooks.
- `lib/`: Utility functions and shared core logic.
- `prisma/`: Database schema (`schema.prisma`) and migrations.

## Database Models (Prisma)
### `User`
- `id`: String (cuid) - Primary Key
- `username`: String (unique)
- `passwordHash`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Running the Application
- **Development**: `npm run dev` (Runs on `0.0.0.0` to allow local network access)
- **Database Generation**: `npx prisma generate` (or runs automatically on postinstall)
