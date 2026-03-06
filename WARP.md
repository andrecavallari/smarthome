# Smart Home Project Rules

## Project Overview
Next.js 16 smart home dashboard that integrates with the Tuya IoT platform and MQTT (HiveMQ). It displays and controls smart devices (switches, wireless switches) and links RF remote codes to Tuya scenes.

## Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **IoT**: Tuya Cloud API (`@tuya/tuya-connector-nodejs`), Tuya WebSocket for real-time events
- **MQTT**: HiveMQ Cloud via `mqtt` package (TLS with certificate)
- **Icons**: lucide-react
- **Crypto**: crypto-js (AES/GCM decryption for Tuya WebSocket messages)

## Architecture
- `src/actions/` — Next.js Server Actions for Tuya API calls (marked with `'use server'`)
- `src/app/api/` — SSE streaming routes (`/api/tuya` for device events, `/api/mqtt` for MQTT messages)
- `src/clients/` — Singleton service clients (Tuya REST, Tuya WebSocket, MQTT)
- `src/components/devices/` — Device components mapped by Tuya category code (`kg`=Switch, `tdq`=Switch, `wxkg`=WirelessSwitch)
- `src/hooks/` — React hooks (`useTuya`, `useEventSource`, `useAutomations`)
- `src/lib/` — WebSocket manager and event source utilities
- `src/config/` — Static configuration (RF code → Scene ID mappings)
- `src/@types/` — Global type declarations (`Device`, `Scene`)
- `src/instrumentation.ts` — Next.js instrumentation hook; connects MQTT and subscribes to RF topics at startup

## Conventions
- Use `npm` as the package manager
- Path alias: `@/*` maps to `./src/*`
- Device types are declared globally in `src/@types/` (no imports needed)
- Client modules export singletons (e.g., `mqttManager`, `TuyaWebSocketManager`)
- Real-time updates flow: Tuya WebSocket → SSE API route → `useEventSource` hook → UI state update
- RF automation flow: MQTT `rf/received` → match against `rfSceneLink` config → trigger Tuya scene

## Environment Variables
See `.env.example`. Required variables:
- `TUYA_ACCESS_KEY`, `TUYA_SECRET_KEY` — Tuya IoT platform credentials
- `TUYA_ENDPOINT` — Tuya API base URL
- `TUYA_USER_ID`, `TUYA_HOME_ID` — Tuya user/home identifiers
- `NEXT_PUBLIC_TUYA_IMAGES_BASE_URL` — Public base URL for device icon images
- `MQTT_SERVER_URI`, `MQTT_PORT`, `MQTT_USER`, `MQTT_PASSWORD` — HiveMQ credentials

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
