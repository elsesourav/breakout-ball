export interface BlockData {
  x: number; // column index (0 to 8)
  y: number; // row index (0 to 10)
  h: number; // 1 to 5: breakable with health, 6: unbreakable wall, 7: quantum portal, 8: emp detonator
  currentHp?: number; // active game health
  portalPairId?: number; // 1 to 4 for paired Quantum Portals (A=1, B=2, C=3, D=4)
}

export interface LevelData {
  id: string;
  name?: string;
  creator: string;
  creatorId?: string;
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
  stars?: number;        // Best stars achieved (1, 2, or 3 based on hearts completed)
  claimedCores?: number; // Total cores claimed so far for this level
  maxCores?: number;     // Maximum core pool for this level
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  time: number;
  score?: number;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  provider?: 'credentials' | 'google' | 'github' | 'sso';
  role?: string;
}

export type BallSkin = 'cyan' | 'fire' | 'void' | 'matrix' | 'gold';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'combat' | 'speed' | 'mastery' | 'creative';
  unlocked: boolean;
  unlockedAt?: number;
  coreReward?: number;
  claimed?: boolean;
}

export interface GameSettings {
  soundEnabled: boolean; // Master Audio On/Off (default: true)
  volume: number; // Master Volume 0.0 to 1.0 (default: 0.5)
  musicEnabled: boolean; // Background music On/Off (default: false)
  sfxEnabled: boolean; // Gameplay Action Sounds On/Off (default: true)
  clickSoundEnabled: boolean; // Button & Menu Clicks On/Off (default: true)
  vibrate: boolean; // Haptic Vibration (default: true)
  gyroscope: boolean;
  gyroSensitivity: number; // 0.05 to 0.7
  wasmParticles?: boolean;
  ballSkin?: BallSkin;
}

export type ActiveTab = 'local' | 'online' | 'armory' | 'create' | 'profile' | 'shop' | 'leaderboard';

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
