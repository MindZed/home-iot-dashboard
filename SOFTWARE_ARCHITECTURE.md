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
- Direct browser connection to EMQX Serverless (`wss://z1314459.ala.asia-southeast1.emqxsl.com:8084/mqtt`).
- Completely decouples the dashboard from the local home server and Cloudflare tunnel (100% Vercel compatible).
- Subscribes to `home/node1/telemetry`, `home/node1/status`, `home/node1/heartbeat`, `home/node1/relay/+/timer_ack`, `home/node1/wol/ack`.
- Controls relays with sub-40ms latency by publishing directly to `home/node1/relay/{id}/toggle`.
- On-device Edge Timers: Publishes to `home/node1/relay/{id}/timer` (`{"seconds": 300}`); ESP32 manages countdown internally on edge.
- Sends Wake-on-LAN packets on demand by publishing to `home/node1/wol/toggle` with live server status feedback.
- 1-Tap Master Scenes ("Leave Home / All Off", "Work Mode", "Night Mode", "All On").
- Power Quality Monitoring: Displays real-time Power Factor (PF) load classification and Apparent Power (VA).

## Directory Structure
- `app/`: Next.js App Router endpoints and pages.
- `components/`: Reusable React UI components (`DeviceCard`, `ServerControl`, `QuickScenes`, `SystemHealth`, `EventLog`, `BottomNav`).
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
