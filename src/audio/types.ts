/**
 * Audio System Types & Interfaces
 */

export type ClickSoundType = 'cyber' | 'tab' | 'close' | 'toggle';

export interface SoundOptions {
  volumeMultiplier?: number;
  pitchShift?: number;
}
