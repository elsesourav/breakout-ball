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
  trail: { x: number; y: number; alpha: number; size: number }[];
}

export interface PaddleState {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  targetX: number;
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
}

export type CollisionEventType = 'wall' | 'paddle' | 'block_damage' | 'block_destroy' | 'ball_lost';

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

export interface EngineCallbacks {
  onScoreUpdate?: (scoreState: ScoreState) => void;
  onLivesChange?: (lives: number) => void;
  onComboChange?: (combo: number) => void;
  onLevelWin?: (finalScore: ScoreState) => void;
  onGameOver?: (finalScore: ScoreState) => void;
  onEventAudio?: (eventType: CollisionEventType, combo: number) => void;
}
