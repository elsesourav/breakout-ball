# V2 Architecture Specification

## 1. Unified Authentication Protocol
Directly integrated with the Universal Authentication Specification ([docs/AUTHENTICATION.md](./AUTHENTICATION.md)).

Key capabilities:
- Cross-subdomain cookie sharing (`.elsesourav.com`).
- Embeddable HTML5/Canvas postMessage authorization (`ELSESOURAV_AUTH_REQUEST` and `ELSESOURAV_AUTH_SUCCESS`).
- 2-Step progressive sign up with real-time username debouncing and availability check.
- 6-digit OTP verification code flow for instant password recovery.

## 2. Decoupled Persistence Engine
- Eliminated Firebase Realtime Database.
- Production-ready standard database service interface (`dbService`) in `src/services/db.ts`.

## 3. UI System & Design Tokens
- Midnight Space design theme provided by `@elsesourav/react-ui`.
- High-contrast arcade glow effects (cyan, purple, emerald, rose).
- Viewport heights strictly bound to `100svh`.
- Mobile viewport target verified down to ultra-compact displays (350px x 650px).
