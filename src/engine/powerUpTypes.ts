export type PowerUpType = 'multiball' | 'megaball' | 'laser' | 'slowmo' | 'shield' | 'expand';

export interface PowerUpMeta {
  type: PowerUpType;
  label: string;
  symbol: string;
  color: string;
  glow: string;
  duration: number; // in seconds (0 = instant)
}

export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpMeta> = {
  multiball: {
    type: 'multiball',
    label: 'MULTI-BALL',
    symbol: '●●',
    color: '#00f7ff',
    glow: 'rgba(0, 247, 255, 0.8)',
    duration: 0,
  },
  megaball: {
    type: 'megaball',
    label: 'MEGA CORE',
    symbol: '✹',
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.85)',
    duration: 5.0,
  },
  laser: {
    type: 'laser',
    label: 'PLASMA CANNON',
    symbol: '▲',
    color: '#ff0055',
    glow: 'rgba(255, 0, 85, 0.85)',
    duration: 6.0,
  },
  slowmo: {
    type: 'slowmo',
    label: 'CHRONOS WARP',
    symbol: '⏱',
    color: '#b773ff',
    glow: 'rgba(183, 115, 255, 0.85)',
    duration: 4.0,
  },
  shield: {
    type: 'shield',
    label: 'FORCEFIELD',
    symbol: '🛡',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.85)',
    duration: 0,
  },
  expand: {
    type: 'expand',
    label: 'TITAN PADDLE',
    symbol: '◀▶',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.85)',
    duration: 6.0,
  },
};

export interface PowerUpDrop {
  id: number;
  x: number;
  y: number;
  vy: number;
  meta: PowerUpMeta;
  collected: boolean;
  angle: number;
}

export interface ActiveBuffs {
  megaBall: number;
  laser: number;
  slowMo: number;
  expand: number;
  hasShield: boolean;
  shield: number;
  shieldCharges: number;
}

export interface LaserBolt {
  id: number;
  x: number;
  y: number;
  vy: number;
  w: number;
  h: number;
}
