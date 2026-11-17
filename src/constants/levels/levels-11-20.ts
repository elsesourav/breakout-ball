import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 11 - 20
 * Sector 02: Data Foundry (Synthwave Multi-Strike)
 */

export const level11: LevelData = createLevel({
  id: '11',
  name: 'Level 11: Circuit Breaker',
  creator: 'sourav',
  playCount: 1523,
  startRow: 1,
  grid: [
    ['1', '.', '2', '.', '3', '.', '2', '.', '1'],
    ['.', '1', '2', '2', 'E', '2', '2', '1', '.'],
    ['.', '.', '1', '1', '1', '1', '1', '.', '.'],
  ],
});

export const level12: LevelData = createLevel({
  id: '12',
  name: 'Level 12: Neon Heart',
  creator: 'sourav',
  playCount: 1516,
  startRow: 1,
  grid: [
    ['.', '2', '2', '2', '.', '2', '2', '2', '.'],
    ['.', '2', '2', '2', '2', '2', '2', '2', '.'],
    ['.', '1', '1', '2', 'E', '2', '1', '1', '.'],
    ['.', '.', '1', '1', '1', '1', '1', '.', '.'],
    ['.', '.', '.', '1', '1', '1', '.', '.', '.'],
    ['.', '.', '.', '.', '1', '.', '.', '.', '.'],
  ],
});

export const level13: LevelData = createLevel({
  id: '13',
  name: 'Level 13: Pulse Matrix',
  creator: 'sourav',
  playCount: 1509,
  startRow: 1,
  grid: [
    ['1', '.', '2', '.', '3', '.', '2', '.', '1'],
    ['.', '1', '.', 'E', '.', 'E', '.', '1', '.'],
    ['1', '.', '2', '.', '3', '.', '2', '.', '1'],
  ],
});

export const level14: LevelData = createLevel({
  id: '14',
  name: 'Level 14: Event Horizon',
  creator: 'sourav',
  playCount: 1502,
  startRow: 1,
  grid: [
    ['.', '.', 'W', 'W', 'W', 'W', 'W', '.', '.'],
    ['.', 'W', '.', 'E', '.', 'E', '.', 'W', '.'],
    ['P1', '.', '.', '.', '4', '.', '.', '.', 'P1'],
    ['.', '.', '.', '3', '3', '3', '.', '.', '.'],
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
  ],
});

export const level15: LevelData = createLevel({
  id: '15',
  name: 'Level 15: EMP Labyrinth',
  creator: 'sourav',
  playCount: 1495,
  startRow: 1,
  grid: [
    ['.', 'E', '.', '.', '3', '.', '.', 'E', '.'],
    ['.', '.', '3', '.', 'E', '.', '3', '.', '.'],
    ['.', '4', '.', 'W', '.', 'W', '.', '4', '.'],
    ['.', '.', '.', '2', '2', '2', '.', '.', '.'],
  ],
});

export const level16: LevelData = createLevel({
  id: '16',
  name: 'Level 16: Fortress Moat',
  creator: 'sourav',
  playCount: 1488,
  startRow: 1,
  grid: [
    ['W', 'W', '.', '4', '4', '4', '.', 'W', 'W'],
    ['.', '.', '.', '.', '.', '.', '.', '.', '.'],
    ['W', '.', '3', '.', 'E', '.', '3', '.', 'W'],
    ['.', '.', '.', '2', '3', '2', '.', '.', '.'],
  ],
});

export const level17: LevelData = createLevel({
  id: '17',
  name: 'Level 17: Stargate Nexus',
  creator: 'sourav',
  playCount: 1481,
  startRow: 1,
  grid: [
    ['P1', '.', '3', '3', '3', '3', '3', '.', 'P1'],
    ['.', 'W', '.', 'E', '.', 'E', '.', 'W', '.'],
    ['.', '.', '2', '4', '2', '4', '2', '.', '.'],
  ],
});

export const level18: LevelData = createLevel({
  id: '18',
  name: 'Level 18: Quantum Cross',
  creator: 'sourav',
  playCount: 1474,
  startRow: 1,
  grid: [
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
    ['P1', '2', '2', '2', 'E', '2', '2', '2', 'P1'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const level19: LevelData = createLevel({
  id: '19',
  name: 'Level 19: Binary Storm',
  creator: 'sourav',
  playCount: 1467,
  startRow: 1,
  grid: [
    ['.', 'E', '.', '.', '.', '.', '.', 'E', '.'],
    ['3', '3', '.', '3', '.', '3', '.', '3', '3'],
    ['.', '4', '4', '.', '.', '.', '4', '4', '.'],
    ['.', '.', '2', '.', '2', '.', '2', '.', '.'],
  ],
});

export const level20: LevelData = createLevel({
  id: '20',
  name: 'Level 20: Foundry Overlord',
  creator: 'sourav',
  playCount: 1460,
  startRow: 1,
  grid: [
    ['.', 'W', '3', '3', '3', '3', '3', 'W', '.'],
    ['.', '3', '2', '2', '2', '2', '2', '3', '.'],
    ['3', '2', '1', '.', 'E', '.', '1', '2', '3'],
    ['3', '2', '1', '.', '.', '.', '1', '2', '3'],
    ['3', '2', '1', '.', '.', '.', '1', '2', '3'],
  ],
});

export const levels11to20: LevelData[] = [
  level11, level12, level13, level14, level15,
  level16, level17, level18, level19, level20,
];
