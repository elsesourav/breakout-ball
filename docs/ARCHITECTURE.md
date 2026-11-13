# Architecture Documentation

## Overview
Breakout Ball is a modern, mobile-first arcade brick breaker built with React 19, Vite, TypeScript, and `@elsesourav/react-ui` (Midnight Theme).

## Architectural Pillars

### 1. Viewport & Dimensions
- Strict adherence to `100svh` for viewport height across all CSS rules, modal wrappers, and canvas layouts.
- Dynamic responsive unit `--s` calculated based on `Math.min(window.innerWidth / 9, window.innerHeight / 16)` on desktop and optimized for mobile screens (e.g. 350x650).

### 2. Universal Authentication & SSO
- Follows [AUTHENTICATION.md](./AUTHENTICATION.md).
- Single Sign-On (SSO) integration supporting `postMessage` protocol `ELSESOURAV_AUTH_REQUEST` <-> `ELSESOURAV_AUTH_SUCCESS`.
- Full component suite: `OAuthButtons`, `LoginForm`, `SignUpForm`, `ForgotPasswordForm`, `OtpBoxes`, and `UserAvatarMenu`.
- Clean login/signup cards with zero admin or restricted portal leaks.

### 3. Database Layer
- Completely decoupled from Firebase Realtime Database.
- Managed by `src/services/db.ts` (`dbService`), providing standard asynchronous contracts for:
  - User profiles and high scores
  - Built-in campaign levels
  - Community published levels
  - Real-time rating and leaderboard queries
