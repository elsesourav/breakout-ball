/**
 * Procedural Web Audio API Synthesizer for Breakout Ball
 * Provides zero-latency, high-tech sound effects and harmonic combo scaling.
 */

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private volume: number = 0.8;

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Dynamic Combo Tone: Pitch climbs gracefully with combo streak!
   */
  public playComboHit(combo: number = 1) {
    if (this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const baseFreqs = [330, 392, 440, 523, 587, 659, 784, 880, 1046, 1174, 1318];
    const freq = baseFreqs[Math.min(combo - 1, baseFreqs.length - 1)] || 440;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = combo > 4 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.1);

    const hitVol = Math.min(0.35, 0.15 + combo * 0.02) * this.volume;
    gain.gain.setValueAtTime(hitVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playPaddleBounce() {
    if (this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playPortalWarp() {
    if (this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

    gain.gain.setValueAtTime(0.22 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playPowerup() {
    if (this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18 * this.volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.16);
    });
  }

  /**
   * Procedural High-Tech Countdown Tick Tone:
   * Distinct resonant harmonic frequencies for '3', '2', and '1'
   */
  public playCountdownTick(count: number | string) {
    if (this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    let baseFreq = 440; // 3: A4
    let overtoneFreq = 880;

    if (count === 2 || count === '2') {
      baseFreq = 554.37; // 2: C#5 (bright energetic step)
      overtoneFreq = 1108.74;
    } else if (count === 1 || count === '1') {
      baseFreq = 659.25; // 1: E5 (high-tension pre-launch tone)
      overtoneFreq = 1318.51;
    }

    // Oscillator 1: Warm punchy tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.98, now + 0.18);

    const mainVol = 0.32 * this.volume;
    gain1.gain.setValueAtTime(mainVol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Oscillator 2: High harmonic cyber ping
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(overtoneFreq, now);
    osc2.frequency.exponentialRampToValueAtTime(overtoneFreq * 1.04, now + 0.14);

    const pingVol = 0.18 * this.volume;
    gain2.gain.setValueAtTime(pingVol, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.18);
  }

  /**
   * Explosive GO! Launch Burst:
   * Layered chord ascent + punchy sub-bass impact
   */
  public playCountdownGo() {
    if (this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 triumphant chord

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const start = now + idx * 0.025;

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, start);
      filter.frequency.exponentialRampToValueAtTime(900, start + 0.42);

      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, start + 0.38);

      gain.gain.setValueAtTime(0.22 * this.volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.48);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.5);
    });

    // Sub-bass thump for physical presence
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(170, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.32);

    subGain.gain.setValueAtTime(0.38 * this.volume, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.36);
  }

  public playAchievementChime() {
    if (this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major triumph
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.15 * this.volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.42);
    });
  }
}

export const synthAudio = new SynthAudioEngine();
