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
  8: { bg: ['#ff3b00', '#ff8800'], border: '#ffaa00', label: '⚡', text: '#fff' }, // Kinetic Detonator Core
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
  soundEnabled: true, // Master sound is ON by default
  volume: 0.5, // Default volume is 50%
  musicEnabled: false, // Background music is OFF by default
  sfxEnabled: true, // Action sounds enabled when master audio is toggled ON
  clickSoundEnabled: true, // Button clicks enabled when master audio is toggled ON
  vibrate: true, // Haptic vibrator is ON by default
  gyroscope: false,
  gyroSensitivity: 0.4,
  wasmParticles: true,
};

export const DEFAULT_USER: UserProfile = {
  id: 'anonymous',
  fullName: 'Anonymous',
  username: 'anonymous',
  email: '',
  isLoggedIn: false,
};

export { INITIAL_LOCAL_LEVELS } from './levels';
export { INITIAL_ONLINE_LEVELS } from './onlineLevels';

export const MOCK_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  '1': [
    { rank: 1, username: 'cyber_ninja', displayName: 'Kenji Takahashi', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber_ninja&size=64', time: 13.0, score: 769 },
    { rank: 2, username: 'speedy_sam', displayName: 'Samantha Speed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=speedy_sam&size=64', time: 13.3, score: 752 },
    { rank: 3, username: 'hyper_dash', displayName: 'Lucas Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hyper_dash&size=64', time: 13.3, score: 752 },
    { rank: 4, username: 'neon_striker', displayName: 'Chloe Bennett', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=neon_striker&size=64', time: 13.6, score: 735 },
    { rank: 5, username: 'void_walker', displayName: 'Dante Cross', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=void_walker&size=64', time: 13.6, score: 735 },
    { rank: 6, username: 'arcade_queen', displayName: 'Elena Rostova', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=arcade_queen&size=64', time: 14.1, score: 709 },
    { rank: 7, username: 'sourav', displayName: 'Sourav Elsesourav', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=sourav&size=64', time: 14.2, score: 704 },
    { rank: 8, username: 'breakout_pro', displayName: 'Marcus Vance', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=breakout_pro&size=64', time: 14.8, score: 675 },
    { rank: 9, username: 'pixel_guy', displayName: 'Leo Martinez', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pixel_guy&size=64', time: 15.2, score: 657 },
    { rank: 10, username: 'quantum_ace', displayName: 'Devon Ward', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum_ace&size=64', time: 15.9, score: 628 },
  ],
};
