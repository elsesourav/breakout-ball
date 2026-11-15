import { AUDIO_PATHS } from '../constants/game';
import { synthAudio } from './synthAudio';

class SoundController {
  private volume: number = 1.0;
  private vibrateEnabled: boolean = true;
  private bgAudio: HTMLAudioElement | null = null;
  private currentTrack: number = 0;
  private cache: Record<string, HTMLAudioElement> = {};

  constructor() {
    // preload sounds
    if (typeof window !== 'undefined') {
      Object.entries(AUDIO_PATHS).forEach(([key, path]) => {
        try {
          const audio = new Audio(path);
          audio.preload = 'auto';
          this.cache[key] = audio;
        } catch {
          // ignore error if audio fails to preload
        }
      });
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    synthAudio.setVolume(this.volume);
    if (this.bgAudio) {
      this.bgAudio.volume = this.volume * 0.4;
    }
  }

  public setVibrate(enabled: boolean) {
    this.vibrateEnabled = enabled;
  }

  public play(name: keyof typeof AUDIO_PATHS, volumeMultiplier: number = 1.0) {
    if (this.volume <= 0) return;
    try {
      const src = AUDIO_PATHS[name];
      const sound = new Audio(src);
      sound.volume = Math.max(0, Math.min(1, this.volume * volumeMultiplier));
      sound.play().catch(() => {});
    } catch {
      // Audio playback might be restricted before user interaction
    }
  }

  public playClick() {
    this.play('click', 0.8);
  }

  public playBlockHit() {
    this.play('blockHit', 0.9);
  }

  public playSideHit() {
    this.play('sideHit', 0.7);
  }

  public playCountdownTick(count: number | string) {
    synthAudio.playCountdownTick(count);
    this.triggerVibrate(25);
  }

  public playCountdownGo() {
    synthAudio.playCountdownGo();
    this.triggerVibrate([50, 40, 100]);
  }

  public playDamage() {
    this.play('damage', 1.0);
    this.triggerVibrate([100, 50, 100]);
  }

  public playWin() {
    this.play('win', 1.0);
    this.triggerVibrate([80, 40, 80, 40, 160]);
  }

  public playGameOver() {
    this.play('gameOver', 1.0);
    this.triggerVibrate([200, 100, 300]);
  }

  public startBgMusic() {
    this.stopBgMusic();
    if (this.volume <= 0) return;
    try {
      const track = this.currentTrack === 0 ? AUDIO_PATHS.bg0 : AUDIO_PATHS.bg1;
      this.bgAudio = new Audio(track);
      this.bgAudio.loop = true;
      this.bgAudio.volume = this.volume * 0.35;
      this.bgAudio.play().catch(() => {});
      this.currentTrack = (this.currentTrack + 1) % 2;
    } catch {}
  }

  public stopBgMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
      this.bgAudio.currentTime = 0;
      this.bgAudio = null;
    }
  }

  public triggerVibrate(pattern: number | number[]) {
    if (!this.vibrateEnabled || typeof window === 'undefined') return;
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }
}

export const soundManager = new SoundController();
