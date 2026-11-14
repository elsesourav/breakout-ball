import { soundManager } from '../utils/audio';
import { CollisionEventType } from './types';

export class AudioBridge {
  private vibrateEnabled: boolean = true;

  constructor(vibrateEnabled: boolean = true) {
    this.vibrateEnabled = vibrateEnabled;
  }

  public setVibrate(enabled: boolean) {
    this.vibrateEnabled = enabled;
  }

  public triggerEvent(type: CollisionEventType, combo: number = 0) {
    switch (type) {
      case 'paddle':
        soundManager.playSideHit();
        this.vibrate(30);
        break;

      case 'wall':
        soundManager.playSideHit();
        this.vibrate(20);
        break;

      case 'block_damage':
        soundManager.playBlockHit();
        this.vibrate(40);
        break;

      case 'block_destroy':
        soundManager.playBlockHit();
        this.vibrate(combo > 3 ? 80 : 50);
        break;

      case 'ball_lost':
        soundManager.playDamage();
        this.vibrate(350);
        break;
    }
  }

  public playWin() {
    soundManager.playWin();
    this.vibrate([100, 50, 150]);
  }

  public playGameOver() {
    soundManager.playGameOver();
    this.vibrate([200, 100, 300]);
  }

  private vibrate(pattern: number | number[]) {
    if (!this.vibrateEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore haptics errors on unsupported browsers
    }
  }
}
