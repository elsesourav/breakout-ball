import { BlockData, LevelData, LeaderboardEntry, GameSettings, UserProfile } from '../types/game';

export const CANVAS_WIDTH = 1152; // 128 * 9
export const CANVAS_HEIGHT = 2048; // 128 * 16
export const GRID_ROWS = 9; // 9 horizontal cells
export const GRID_COLS = 11; // 11 vertical block cells
export const BLOCK_WIDTH = CANVAS_WIDTH / GRID_ROWS; // 128
export const BLOCK_HEIGHT = 128 * 0.75; // 96

export const PADDLE_WIDTH = 128 * 2; // 256
export const PADDLE_HEIGHT = 128 * 0.4; // 51.2
export const PADDLE_Y = CANVAS_HEIGHT - 128 * 1.6; // Y position of paddle
export const BALL_RADIUS = 128 * 0.22; // ~28.16
export const BALL_SPEED = 15;

export const BLOCK_COLORS: Record<number, { bg: [string, string]; border: string; label: string; text: string }> = {
  1: { bg: ['#00f7ff', '#006caf'], border: '#4ffffc', label: '1', text: '#fff' },
  2: { bg: ['#eeff01', '#986300'], border: '#fcff59', label: '2', text: '#000' },
  3: { bg: ['#04ef00', '#03a900'], border: '#3bff48', label: '3', text: '#fff' },
  4: { bg: ['#b773ff', '#7028e4'], border: '#af4eff', label: '4', text: '#fff' },
  5: { bg: ['#ff0844', '#ff7e9e'], border: '#ff20c4', label: '5', text: '#fff' },
  6: { bg: ['#b0b7c1', '#eaeaea'], border: '#ffffff', label: '∞', text: '#333' }, // Wall (unbreakable)
  7: { bg: ['#7928ca', '#00f7ff'], border: '#00f7ff', label: '🌀', text: '#fff' }, // Quantum Portal
  8: { bg: ['#ff3b00', '#ff8800'], border: '#ffaa00', label: 'EMP', text: '#fff' }, // Countdown Reactor
};

export const AUDIO_PATHS = {
  click: '/audio/click.mp3',
  blockHit: '/audio/block-hit.mp3',
  sideHit: '/audio/side-hit.mp3',
  damage: '/audio/damage.mp3',
  win: '/audio/win.mp3',
  gameOver: '/audio/game-over.mp3',
  bg0: '/audio/bg0.mp3',
  bg1: '/audio/bg1.mp3',
};

export const DEFAULT_SETTINGS: GameSettings = {
  volume: 1.0,
  vibrate: true,
  gyroscope: false,
  gyroSensitivity: 0.4,
  wasmParticles: true,
};

export const DEFAULT_USER: UserProfile = {
  fullName: 'Anonymous',
  username: 'anonymous',
  email: '',
  isLoggedIn: false,
};

export { INITIAL_LOCAL_LEVELS } from './levels';

export const INITIAL_ONLINE_LEVELS: LevelData[] = [
  {
    id: 'CYB01',
    name: 'Cyber Grid',
    creator: 'neo',
    playCount: 2314,
    isPublic: true,
    blocks: [
      { x: 0, y: 1, h: 1 }, { x: 2, y: 1, h: 2 }, { x: 4, y: 1, h: 3 }, { x: 6, y: 1, h: 2 }, { x: 8, y: 1, h: 1 },
      { x: 1, y: 2, h: 2 }, { x: 3, y: 2, h: 4 }, { x: 5, y: 2, h: 4 }, { x: 7, y: 2, h: 2 },
      { x: 2, y: 3, h: 3 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 3 },
    ],
  },
  {
    id: 'ARC88',
    name: 'Neon Invaders',
    creator: 'pixel_master',
    playCount: 1845,
    isPublic: true,
    blocks: [
      { x: 1, y: 1, h: 4 }, { x: 2, y: 1, h: 4 }, { x: 6, y: 1, h: 4 }, { x: 7, y: 1, h: 4 },
      { x: 0, y: 2, h: 3 }, { x: 3, y: 2, h: 5 }, { x: 4, y: 2, h: 5 }, { x: 5, y: 2, h: 5 }, { x: 8, y: 2, h: 3 },
      { x: 0, y: 3, h: 2 }, { x: 2, y: 3, h: 2 }, { x: 6, y: 3, h: 2 }, { x: 8, y: 3, h: 2 },
      { x: 3, y: 4, h: 6 }, { x: 4, y: 4, h: 1 }, { x: 5, y: 4, h: 6 },
    ],
  },
  {
    id: 'VORTX',
    name: 'Vortex',
    creator: 'zen_gamer',
    playCount: 1205,
    isPublic: true,
    blocks: [
      { x: 3, y: 1, h: 1 }, { x: 4, y: 1, h: 1 }, { x: 5, y: 1, h: 1 },
      { x: 2, y: 2, h: 2 }, { x: 6, y: 2, h: 2 },
      { x: 1, y: 3, h: 3 }, { x: 4, y: 3, h: 5 }, { x: 7, y: 3, h: 3 },
      { x: 2, y: 4, h: 4 }, { x: 6, y: 4, h: 4 },
      { x: 3, y: 5, h: 2 }, { x: 4, y: 5, h: 2 }, { x: 5, y: 5, h: 2 },
    ],
  },
  {
    id: 'STEEL',
    name: 'Iron Bunker',
    creator: 'tank_crush',
    playCount: 940,
    isPublic: true,
    blocks: [
      { x: 0, y: 2, h: 6 }, { x: 1, y: 2, h: 5 }, { x: 2, y: 2, h: 5 }, { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, { x: 6, y: 2, h: 5 }, { x: 7, y: 2, h: 5 }, { x: 8, y: 2, h: 6 },
      { x: 1, y: 3, h: 4 }, { x: 2, y: 3, h: 3 }, { x: 6, y: 3, h: 3 }, { x: 7, y: 3, h: 4 },
      { x: 3, y: 4, h: 2 }, { x: 4, y: 4, h: 1 }, { x: 5, y: 4, h: 2 },
    ],
  },
  {
    id: 'PYRAM',
    name: 'Ancient Gold',
    creator: 'pharaoh',
    playCount: 780,
    isPublic: true,
    blocks: [
      { x: 4, y: 1, h: 5 },
      { x: 3, y: 2, h: 4 }, { x: 4, y: 2, h: 4 }, { x: 5, y: 2, h: 4 },
      { x: 2, y: 3, h: 3 }, { x: 3, y: 3, h: 3 }, { x: 4, y: 3, h: 3 }, { x: 5, y: 3, h: 3 }, { x: 6, y: 3, h: 3 },
      { x: 1, y: 4, h: 2 }, { x: 2, y: 4, h: 2 }, { x: 3, y: 4, h: 2 }, { x: 4, y: 4, h: 2 }, { x: 5, y: 4, h: 2 }, { x: 6, y: 4, h: 2 }, { x: 7, y: 4, h: 2 },
    ],
  },
  {
    id: 'FLASH',
    name: 'Speed Demon',
    creator: 'speedy',
    playCount: 650,
    isPublic: true,
    blocks: [
      { x: 1, y: 2, h: 1 }, { x: 3, y: 2, h: 1 }, { x: 5, y: 2, h: 1 }, { x: 7, y: 2, h: 1 },
      { x: 2, y: 3, h: 2 }, { x: 4, y: 3, h: 2 }, { x: 6, y: 3, h: 2 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
      { x: 4, y: 5, h: 4 },
    ],
  },
];

export const MOCK_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  '1': [
    { rank: 1, username: 'sourav', time: 14.2 },
    { rank: 2, username: 'speedy_sam', time: 16.5 },
    { rank: 3, username: 'arcade_queen', time: 18.1 },
    { rank: 4, username: 'breakout_pro', time: 21.0 },
    { rank: 5, username: 'pixel_guy', time: 24.8 },
  ],
  default: [
    { rank: 1, username: 'sourav', time: 22.4 },
    { rank: 2, username: 'champion99', time: 25.1 },
    { rank: 3, username: 'brick_breaker', time: 29.8 },
    { rank: 4, username: 'ball_wizard', time: 34.2 },
    { rank: 5, username: 'retro_hero', time: 39.0 },
  ],
};
