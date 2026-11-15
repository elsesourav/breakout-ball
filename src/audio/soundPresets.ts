/**
 * Procedural Web Audio API Sound Synthesizers
 * High-fidelity, zero-latency cyberpunk arcade sound generators.
 */

import { ClickSoundType } from './types';

/**
 * High-tech UI Button Click Synthesizer
 */
export function playSyntheticClick(
  ctx: AudioContext,
  masterVol: number,
  type: ClickSoundType = 'cyber'
): void {
  if (masterVol <= 0) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  switch (type) {
    case 'tab': {
      // Soft, rounded tab toggle pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.035);

      gain.gain.setValueAtTime(0.25 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
    case 'close': {
      // Clean downward dismiss tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);

      gain.gain.setValueAtTime(0.22 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
    case 'toggle': {
      // Dual-harmonic flick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(1040, now + 0.015);

      gain.gain.setValueAtTime(0.2 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
    case 'cyber':
    default: {
      // Futuristic cyber interface beep/chirp
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(1550, now + 0.025);

      gain.gain.setValueAtTime(0.28 * masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
      break;
    }
  }
}

/**
 * Ascending Crystal Core Collection Chime
 * Pentatonic scale harmonics with shimmering high overtone.
 */
export function playSyntheticCoreCollect(
  ctx: AudioContext,
  masterVol: number,
  step = 1
): void {
  if (masterVol <= 0) return;
  const now = ctx.currentTime;

  const notes = [587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
  const freq = notes[Math.min(Math.max(0, step - 1), notes.length - 1)] || 880;

  // 1. Fundamental Crystal Tone
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);
  osc1.frequency.exponentialRampToValueAtTime(freq * 1.08, now + 0.08);

  const vol1 = Math.min(0.35, 0.16 + (step % 5) * 0.02) * masterVol;
  gain1.gain.setValueAtTime(vol1, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.19);

  // 2. High Shimmer Sparkle Overtone
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2.02, now);

  gain2.gain.setValueAtTime(vol1 * 0.35, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now);
  osc2.stop(now + 0.1);
}

/**
 * Triumphant Armory Upgrade Power Surge Fanfare
 * Ascending cyber chord arpeggio with warm resonance.
 */
export function playSyntheticUpgradeSuccess(
  ctx: AudioContext,
  masterVol: number
): void {
  if (masterVol <= 0) return;
  const now = ctx.currentTime;

  const arpeggio = [
    { freq: 440.0, time: 0 },       // A4
    { freq: 554.37, time: 0.07 },   // C#5
    { freq: 659.25, time: 0.14 },   // E5
    { freq: 880.0, time: 0.21 },    // A5
  ];

  arpeggio.forEach(({ freq, time }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.04, now + time + 0.15);

    gain.gain.setValueAtTime(0.24 * masterVol, now + time);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + 0.3);
  });

  // Climax Bass Bloom
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(140, now);
  subOsc.frequency.exponentialRampToValueAtTime(220, now + 0.35);

  subGain.gain.setValueAtTime(0.2 * masterVol, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.4);
}

/**
 * Low Warning Buzz for Insufficient Cores / Denied Action
 */
export function playSyntheticWarning(
  ctx: AudioContext,
  masterVol: number
): void {
  if (masterVol <= 0) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

  gain.gain.setValueAtTime(0.18 * masterVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.13);
}

/**
 * Ultra-short, low-frequency muted tap for locked levels / route obstacles.
 * Very soft, short (~40ms), low-pitch sine pulse (125Hz -> 70Hz) at low volume.
 * Gentle, quiet and unobtrusive with zero harsh treble.
 */
export function playSyntheticLockTap(
  ctx: AudioContext,
  masterVol: number
): void {
  if (masterVol <= 0) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Pure sine wave for a deep, smooth, non-piercing low thump
  osc.type = 'sine';
  osc.frequency.setValueAtTime(125, now);
  osc.frequency.exponentialRampToValueAtTime(70, now + 0.038);

  // Very gentle volume ceiling (0.09) with fast exponential decay
  gain.gain.setValueAtTime(0.09 * masterVol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.042);
}

