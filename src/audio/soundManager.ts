/**
 * Unified Audio Manager
 * Combines procedural synthesis and audio playback with zero latency.
 */

import { AUDIO_PATHS } from '../constants/game';
import { ClickSoundType } from './types';
import {
  playSyntheticClick,
  playSyntheticCoreCollect,
  playSyntheticUpgradeSuccess,
  playSyntheticWarning,
  playSyntheticLockTap,
} from './soundPresets';
import { synthAudio } from '../utils/synthAudio';

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true; // Master audio ON by default
  private volume: number = 0.5; // Master volume 50% by default
  private musicEnabled: boolean = false; // Background music OFF by default
  private sfxEnabled: boolean = true; // Action sounds active when sound is ON
  private clickSoundEnabled: boolean = true; // Button clicks active when sound is ON
  private vibrateEnabled: boolean = true; // Vibration ON by default
  private bgAudio: HTMLAudioElement | null = null;
  private currentTrack: number = 0;
  private cache: Record<string, HTMLAudioElement> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      // Preload static audio files
      Object.entries(AUDIO_PATHS).forEach(([key, path]) => {
        try {
          const audio = new Audio(path);
          audio.preload = 'auto';
          this.cache[key] = audio;
        } catch {
          // ignore
        }
      });
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.soundEnabled) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    synthAudio.setEnabled(this.soundEnabled && this.sfxEnabled);
    if (!enabled) {
      this.stopBgMusic();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled || !this.soundEnabled) {
      this.stopBgMusic();
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    synthAudio.setEnabled(this.soundEnabled && this.sfxEnabled);
  }

  public setClickSoundEnabled(enabled: boolean) {
    this.clickSoundEnabled = enabled;
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

  // ── High-Tech Button Clicks ───────────────────────────────────────
  public playClick(type: ClickSoundType = 'cyber') {
    if (!this.soundEnabled || !this.clickSoundEnabled || this.volume <= 0) return;
    const ctx = this.getContext();
    if (ctx) {
      playSyntheticClick(ctx, this.volume, type);
    } else {
      this.playStatic('click', 0.8);
    }
  }

  // ── Armory & Economy Sounds ───────────────────────────────────────
  public playCollectCore(step = 1) {
    if (this.soundEnabled && this.sfxEnabled && this.volume > 0) {
      const ctx = this.getContext();
      if (ctx) {
        playSyntheticCoreCollect(ctx, this.volume, step);
      }
    }
    this.triggerVibrate(20);
  }

  public playUpgradeSuccess() {
    if (this.soundEnabled && this.sfxEnabled && this.volume > 0) {
      const ctx = this.getContext();
      if (ctx) {
        playSyntheticUpgradeSuccess(ctx, this.volume);
      } else {
        this.playStatic('win', 1.0);
      }
    }
    this.triggerVibrate([40, 30, 80]);
  }

  public playInsufficientFunds() {
    if (this.soundEnabled && this.sfxEnabled && this.volume > 0) {
      const ctx = this.getContext();
      if (ctx) {
        playSyntheticWarning(ctx, this.volume);
      } else {
        this.playStatic('damage', 0.5);
      }
    }
    this.triggerVibrate(50);
  }

  public playLockTap() {
    if (this.soundEnabled && this.sfxEnabled && this.volume > 0) {
      const ctx = this.getContext();
      if (ctx) {
        playSyntheticLockTap(ctx, this.volume);
      } else {
        this.playStatic('sideHit', 0.15);
      }
    }
    this.triggerVibrate(15);
  }

  // ── Game Action Sounds ───────────────────────────────────────────
  public play(name: keyof typeof AUDIO_PATHS, volumeMultiplier = 1.0) {
    this.playStatic(name, volumeMultiplier);
  }

  private playStatic(name: keyof typeof AUDIO_PATHS, volumeMultiplier = 1.0) {
    if (!this.soundEnabled || !this.sfxEnabled || this.volume <= 0) return;
    try {
      const src = AUDIO_PATHS[name];
      const sound = new Audio(src);
      sound.volume = Math.max(0, Math.min(1, this.volume * volumeMultiplier));
      sound.play().catch(() => {});
    } catch {}
  }

  public playBlockHit() {
    this.playStatic('blockHit', 0.9);
  }

  public playSideHit() {
    this.playStatic('sideHit', 0.7);
  }

  public playCountdownTick(count: number | string) {
    if (this.soundEnabled && this.sfxEnabled && this.volume > 0) {
      synthAudio.playCountdownTick(count);
    }
    this.triggerVibrate(25);
  }

  public playCountdownGo() {
    if (this.soundEnabled && this.sfxEnabled && this.volume > 0) {
      synthAudio.playCountdownGo();
    }
    this.triggerVibrate([50, 40, 100]);
  }

  public playDamage() {
    this.playStatic('damage', 1.0);
    this.triggerVibrate([100, 50, 100]);
  }

  public playWin() {
    this.playStatic('win', 1.0);
    this.triggerVibrate([80, 40, 80, 40, 160]);
  }

  public playGameOver() {
    this.playStatic('gameOver', 1.0);
    this.triggerVibrate([200, 100, 300]);
  }

  public startBgMusic() {
    this.stopBgMusic();
    if (!this.soundEnabled || !this.musicEnabled || this.volume <= 0) return;
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

export const soundManager = new SoundManager();
