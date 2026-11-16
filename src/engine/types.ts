import { BlockData } from '../types/game';

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  baseSpeed: number;
  isActive: boolean;
  warpCooldown?: number;
  paddleCooldown?: number;
  lastHitBlockIndex?: number;
  lastHitBlockCooldown?: number;
  isMega?: boolean;
  trail: { x: number; y: number; alpha: number; size: number }[];
}

export interface PaddleState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  targetX: number;
  maxSpeed?: number; // Physical maximum tracking speed in px/sec
}

export interface BlockEngineState {
  index: number;
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  health: number;
  initialHealth: number;
  isDead: boolean;
  hitAnim: number; // 0 to 1 for flash effect
  counter?: number; // for type 8 EMP counter
  portalPairIndex?: number; // for type 7 Quantum Portal (target block index in physics.blocks)
  portalPairId?: number; // for type 7 Quantum Portal (1, 2, 3, 4)
  portalRechargeTimer?: number; // for type 7 Quantum Portal (ticks remaining in 3s recharge break)
}

export type CollisionEventType =
  | 'wall'
  | 'paddle'
  | 'block_damage'
  | 'crit_damage'
  | 'block_destroy'
  | 'ball_lost'
  | 'portal_warp'
  | 'emp_explode'
  | 'powerup_collect'
  | 'shield_bounce';

export interface CollisionEvent {
  type: CollisionEventType;
  blockIndex: number;
  hitX: number;
  hitY: number;
  combo: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'square' | 'circle' | 'spark';
}

export interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  twinkleSpeed: number;
  color?: string;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

export interface ScoreState {
  score: number;
  blocksDestroyed: number;
  totalBreakable: number;
  combo: number;
  maxCombo: number;
  timeUsed: number;
  lives: number;
  status: 'countdown' | 'playing' | 'win' | 'gameover' | 'paused';
}

export interface PhysicsWorldConfig {
  width: number;
  height: number;
  paddleWidth: number;
  paddleHeight: number;
  ballRadius: number;
  ballSpeed: number;
  blockWidth: number;
  blockHeight: number;
  substeps?: number;
}

import type { ActiveBuffInfo } from './powerUpTypes';

export interface EngineCallbacks {
  onScoreUpdate?: (scoreState: ScoreState) => void;
  onLivesChange?: (lives: number) => void;
  onComboChange?: (combo: number) => void;
  onLevelWin?: (finalScore: ScoreState) => void;
  onGameOver?: (finalScore: ScoreState) => void;
  onEventAudio?: (eventType: CollisionEventType, combo: number) => void;
  onBuffsChange?: (buffs: ActiveBuffInfo[]) => void;
}
