import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 61 - 70
 * Sector 07: Void Reactor (Sub-Atomic Fission Lab)
 */

export const level61: LevelData = createLevel({
  id: '61',
  name: 'Level 61: Orbit Gate',
  creator: 'sourav',
  playCount: 1173,
  startRow: 1,
  grid: [
    ['P1', '.', 'W', '5', 'W', '5', 'W', '.', 'P1'],
    ['.', '.', '4', '.', '4', '.', '4', '.', '.'],
    ['.', 'E', '.', '4', '.', '4', '.', 'E', '.'],
    ['.', '.', '5', '.', '5', '.', '5', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
  ],
});

export const level62: LevelData = createLevel({
  id: '62',
  name: 'Level 62: Crimson Crown',
  creator: 'sourav',
  playCount: 1166,
  startRow: 1,
  grid: [
    ['5', '.', '4', '.', '3', '.', '4', '.', '5'],
    ['5', '5', '4', '4', '3', '4', '4', '5', '5'],
    ['.', '3', '.', 'E', '.', 'E', '.', '3', '.'],
    ['.', '.', '2', '.', '2', '.', '2', '.', '.'],
  ],
});

export const level63: LevelData = createLevel({
  id: '63',
  name: 'Level 63: Mirror Maze',
  creator: 'sourav',
  playCount: 1159,
  startRow: 1,
  grid: [
    ['P1', '.', 'W', '.', '4', '.', 'W', '.', 'P1'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['P2', '.', 'E', '.', '4', '.', 'E', '.', 'P2'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['.', '.', '3', '.', '3', '.', '3', '.', '.'],
  ],
});

export const level64: LevelData = createLevel({
  id: '64',
  name: 'Level 64: Reactor Meltdown',
  creator: 'sourav',
  playCount: 1152,
  startRow: 1,
  grid: [
    ['4', '.', 'E', '.', '4', '.', 'E', '.', '4'],
    ['.', '4', '.', '4', '.', '4', '.', '4', '.'],
    ['E', '.', '5', '.', 'E', '.', '5', '.', 'E'],
    ['.', '4', '.', '4', '.', '4', '.', '4', '.'],
    ['4', '.', 'E', '.', '4', '.', 'E', '.', '4'],
  ],
});

export const level65: LevelData = createLevel({
  id: '65',
  name: 'Level 65: Bunker Siege',
  creator: 'sourav',
  playCount: 1145,
  startRow: 1,
  grid: [
    ['W', '4', '.', '4', '.', '4', '.', '4', 'W'],
    ['W', '.', '5', '.', 'E', '.', '5', '.', 'W'],
    ['W', '4', '.', '4', '.', '4', '.', '4', 'W'],
    ['W', '.', '3', '.', '3', '.', '3', '.', 'W'],
    ['.', '.', '.', '.', '5', '.', '.', '.', '.'],
  ],
});

export const level66: LevelData = createLevel({
  id: '66',
  name: 'Level 66: Wormhole Alley',
  creator: 'sourav',
  playCount: 1138,
  startRow: 1,
  grid: [
    ['P1', '.', '4', '.', '4', '.', '4', '.', 'P2'],
    ['.', '5', '.', '.', '.', '.', '.', '5', '.'],
    ['.', '.', '.', '5', 'E', '5', '.', '.', '.'],
    ['.', '4', '.', '.', '.', '.', '.', '4', '.'],
    ['P2', '.', '3', '.', '3', '.', '3', '.', 'P1'],
  ],
});

export const level67: LevelData = createLevel({
  id: '67',
  name: 'Level 67: Chevron Rush',
  creator: 'sourav',
  playCount: 1131,
  startRow: 1,
  grid: [
    ['4', '4', '.', '.', '.', '.', '.', '4', '4'],
    ['.', '.', '4', '4', '.', '4', '4', '.', '.'],
    ['.', '.', '.', '5', 'E', '5', '.', '.', '.'],
    ['.', '.', '3', '.', '3', '.', '3', '.', '.'],
    ['.', '2', '.', '2', '.', '2', '.', '2', '.'],
  ],
});

export const level68: LevelData = createLevel({
  id: '68',
  name: 'Level 68: Neon Eye',
  creator: 'sourav',
  playCount: 1124,
  startRow: 1,
  grid: [
    ['.', '.', '3', '3', '3', '3', '3', '.', '.'],
    ['.', '3', '.', '4', '.', '4', '.', '3', '.'],
    ['3', '.', '4', 'E', '4', 'E', '4', '.', '3'],
    ['.', '3', '.', '4', '.', '4', '.', '3', '.'],
    ['.', '.', '3', '3', '3', '3', '3', '.', '.'],
  ],
});

export const level69: LevelData = createLevel({
  id: '69',
  name: 'Level 69: Prism Core',
  creator: 'sourav',
  playCount: 1117,
  startRow: 1,
  grid: [
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
    ['.', '.', '.', '4', '.', '4', '.', '.', '.'],
    ['.', '.', '4', '.', '3', '.', '4', '.', '.'],
    ['.', '4', '.', '3', 'E', '3', '.', '4', '.'],
    ['.', '.', '4', '.', '3', '.', '4', '.', '.'],
    ['.', '.', '.', '4', '.', '4', '.', '.', '.'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const level70: LevelData = createLevel({
  id: '70',
  name: 'Level 70: Void Warden',
  creator: 'sourav',
  playCount: 1110,
  startRow: 1,
  grid: [
    ['W', '5', 'E', '5', 'W', '5', 'E', '5', 'W'],
    ['5', 'P1', '.', '.', '5', '.', '.', 'P1', '5'],
    ['.', '.', '5', '.', '5', '.', '5', '.', '.'],
    ['.', '5', '.', 'W', '.', 'W', '.', '5', '.'],
    ['.', '.', '4', '.', '4', '.', '4', '.', '.'],
    ['.', '.', '.', '5', '.', '5', '.', '.', '.'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const levels61to70: LevelData[] = [
  level61, level62, level63, level64, level65,
  level66, level67, level68, level69, level70,
];
