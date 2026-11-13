# Master Authentication & Ecosystem Integration Specification

## 1. Overview
The ElseSourav Universal Authentication Specification guarantees a unified player and developer identity across all web applications, embedded WebGL games, mobile viewports, Godot/Unity game engines, and native platforms.

---

## 2. Supported Identity Services

### A. Google OAuth
- One-click social login using Google Identity Services.
- Pre-flight provider availability check.
- Automatic Google profile name and avatar synchronization.

### B. GitHub OAuth
- One-click developer sign-in.
- Automatic GitHub username, email, and avatar import.

### C. Email & Password with Progressive 2-Step Sign-Up
- **Step 1:** Email, strong password, and password confirmation with real-time strength feedback and bot honeypot protection.
- **Step 2:** Profile creation with real-time username debouncing, availability verification, and smart username suggestions.

### D. Username as Login Identifier
- Allows users to log in with either their email (`user@example.com`) or `@username`.
- Identifier is resolved seamlessly via auth service resolution before issuing JWT session tokens.

### E. 6-Digit OTP Password Reset Flow
- Accessible 6-digit OTP code input boxes (`OtpBoxes`) with clipboard paste handling.
- Step-by-step password recovery:
  1. Identifier submission (email or username)
  2. OTP verification (6 digits, time-limited)
  3. New password creation and instant confirmation

---

## 3. Reusable UI Component Inventory

| Component | Path | Purpose |
| :--- | :--- | :--- |
| `OAuthButtons` | `src/components/auth/OAuthButtons.tsx` | Google & GitHub buttons with loading spinners and micro-feedback. |
| `LoginForm` | `src/components/auth/LoginForm.tsx` | Self-contained login form supporting OAuth, Email/Username, password toggle, and clean footer with no admin links. |
| `SignUpForm` | `src/components/auth/SignUpForm.tsx` | Two-step progressive registration with real-time username validation and honeypot protection. |
| `ForgotPasswordForm` | `src/components/auth/ForgotPasswordForm.tsx` | 3-step OTP password reset and recovery form. |
| `OtpBoxes` | `src/components/auth/OtpBoxes.tsx` | Accessible 6-digit OTP code input boxes with clipboard auto-fill. |
| `UserAvatarMenu` | `src/components/auth/UserAvatarMenu.tsx` | Floating profile menu with avatar, role badges, navigation links, and logout handler. |

---

## 4. Single Sign-On (SSO) Architecture: "One Account Across All Games & Apps"

### A. Subdomains (`*.elsesourav.com`)
- Session cookies configured with `domain: '.elsesourav.com'`.
- Logging in on `elsesourav.com` automatically logs the user into any subdomain (e.g. `play.elsesourav.com`, `arcade.elsesourav.com`, `admin.elsesourav.com`) with zero re-login prompts.

### B. Embedded WebGL Games & HTML5 Apps (Iframe / Browser Canvas)
- Event-driven `postMessage` protocol:
  ```typescript
  // Game requests auth state from parent:
  window.parent.postMessage({ type: 'ELSESOURAV_AUTH_REQUEST' }, '*');

  // Parent responds with user payload:
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'ELSESOURAV_AUTH_SUCCESS') {
      const { user, token } = event.data.payload;
      // Initialize player state
    }
  });
  ```
- Canvas games receive authenticated user session tokens without hosting separate login forms inside the game canvas.

### C. Game Backends & Custom Microservices
- JWT signature verification using HMAC SHA-256 or RS256.
- Database service (`src/services/db.ts`) completely eliminates Firebase Realtime Database in favor of standard extensible REST/database architecture.
