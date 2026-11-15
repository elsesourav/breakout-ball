import { soundManager } from '../utils/audio';
import { synthAudio } from '../utils/synthAudio';
import { achievementManager } from '../services/achievements';
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
        synthAudio.playPaddleBounce();
        this.vibrate(30);
        break;

      case 'wall':
        soundManager.playSideHit();
        this.vibrate(20);
        break;

      case 'block_damage':
        soundManager.playBlockHit();
        synthAudio.playComboHit(combo);
        if (!achievementManager.isRestricted()) {
          achievementManager.unlock('first_blood');
        }
        this.vibrate(40);
        break;

      case 'block_destroy':
        soundManager.playBlockHit();
        synthAudio.playComboHit(combo);
        if (!achievementManager.isRestricted()) {
          achievementManager.unlock('first_blood');
          if (combo >= 5) achievementManager.unlock('combo_5');
          if (combo >= 10) achievementManager.unlock('combo_10');
        }
        this.vibrate(combo > 3 ? 80 : 50);
        break;

      case 'ball_lost':
        soundManager.playDamage();
        this.vibrate(350);
        break;

      case 'portal_warp':
        soundManager.playClick();
        synthAudio.playPortalWarp();
        if (!achievementManager.isRestricted()) {
          achievementManager.unlock('portal_hopper');
        }
        this.vibrate([25, 40, 25]);
        break;

      case 'emp_explode':
        soundManager.playBlockHit();
        if (!achievementManager.isRestricted()) {
          achievementManager.unlock('emp_detonator');
        }
        this.vibrate(120);
        break;

      case 'powerup_collect':
        soundManager.playClick();
        synthAudio.playPowerup();
        this.vibrate(45);
        break;

      case 'shield_bounce':
        soundManager.playSideHit();
        synthAudio.playPaddleBounce();
        this.vibrate(70);
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
