export interface BlockData {
  x: number; // column index (0 to 8)
  y: number; // row index (0 to 10)
  h: number; // 1 to 5: breakable with health, 6: unbreakable wall
  currentHp?: number; // active game health
}

export interface LevelData {
  id: string;
  name?: string;
  creator: string;
  playCount: number;
  blocks: BlockData[];
  isPublic?: boolean;
  createdAt?: number;
}

export interface LocalLevelProgress {
  levelNumber: number;
  completed: boolean;
  rank: number | null;
  bestTime: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  time: number;
}

export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
}

export interface GameSettings {
  volume: number; // 0.0 to 1.0
  vibrate: boolean;
  gyroscope: boolean;
  gyroSensitivity: number; // 0.05 to 0.7
  wasmParticles?: boolean;
}

export type ActiveTab = 'local' | 'online' | 'create' | 'profile';

export type GameScreen = 'menu' | 'preview' | 'playing' | 'designer';

export interface AlertConfig {
  title: string;
  message: string;
  btn1Text?: string;
  btn2Text?: string;
  btn1Color?: string;
  btn2Color?: string;
  titleColor?: string;
  singleBtn?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}
