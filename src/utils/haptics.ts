/**
 * Haptic Vibration Utility with Chromium User-Activation & Frame Interaction Guards
 *
 * Prevents:
 * "[Intervention] Blocked call to navigator.vibrate because user hasn't tapped on the frame or any embedded frame yet"
 *
 * Ensures haptics only fire when:
 * 1. The browser supports navigator.vibrate
 * 2. The document is visible (not hidden/backgrounded)
 * 3. The user has performed at least one interaction (tap, click, keydown, pointerdown)
 *    verified via `navigator.userActivation` and global event listeners.
 */

let hasUserInteracted = false;

if (typeof window !== 'undefined') {
  const markActive = () => {
    hasUserInteracted = true;
    const events = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
    events.forEach((evt) => {
      window.removeEventListener(evt, markActive, true);
    });
  };

  const events = ['pointerdown', 'touchstart', 'touchend', 'mousedown', 'keydown', 'click'];
  events.forEach((evt) => {
    window.addEventListener(evt, markActive, { capture: true, passive: true });
  });
}

/**
 * Checks whether the current frame has received user activation and can safely vibrate.
 */
export function canVibrate(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') return false;
  if (typeof document !== 'undefined' && document.hidden) return false;

  // Modern browsers (Chrome, Edge, Firefox, Safari): check navigator.userActivation
  // UserActivation.hasBeenActive: true if the current frame or ancestor has received user interaction
  // UserActivation.isActive: true if currently handling an active user gesture
  if ('userActivation' in navigator && (navigator as any).userActivation) {
    const act = (navigator as any).userActivation;
    if (!act.hasBeenActive && !act.isActive) {
      return false;
    }
  } else if (!hasUserInteracted) {
    return false;
  }

  return true;
}

/**
 * Safely triggers haptic vibration without triggering browser intervention warnings.
 *
 * @param pattern Duration in ms (e.g. 20) or vibration/pause sequence (e.g. [40, 30, 80])
 * @returns true if vibration was dispatched, false otherwise
 */
export function safeVibrate(pattern: number | number[]): boolean {
  if (!canVibrate()) return false;
  try {
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}
