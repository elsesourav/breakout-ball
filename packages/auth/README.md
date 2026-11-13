# @elsesourav/auth

Universal authentication client and ecosystem package for ElseSourav games and web applications.

## Features
- **OAuth Providers**: Google & GitHub single-click authentication.
- **Identifier Resolution**: Transparently authenticate with either `email` or `@username`.
- **2-Step Progressive Registration**: Instant email/password validation followed by debounced username reservation.
- **OTP Password Recovery**: 6-digit one-time password inputs with native clipboard paste detection.
- **Single Sign-On (SSO)**:
  - Cross-domain cookie sharing on `.elsesourav.com`.
  - Browser canvas / Iframe `postMessage` protocol: `ELSESOURAV_AUTH_REQUEST` ↔ `ELSESOURAV_AUTH_SUCCESS`.
- **Decoupled Database Integration**: Standardized backend service without Firebase Realtime Database reliance.

## Usage

```typescript
import { authService } from '@/services/auth';

// Login with email or @username
const { success, user } = await authService.loginWithIdentifier('@sourav', 'mySecurePass123');

// Social Login
await authService.loginWithOAuth('google');

// OTP Password Reset
const { success, testOtp } = await authService.requestPasswordOtp('user@example.com');
await authService.verifyOtpAndResetPassword('user@example.com', '123456', 'newPassword456');
```
