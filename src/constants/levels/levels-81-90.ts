import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 81 - 90
 * Sector 09: Singularity Depths (Event Horizon Gateway)
 */

export const level81: LevelData = createLevel({
  id: '81',
  name: 'Level 81: Wormhole Tunnel',
  creator: 'sourav',
  playCount: 1033,
  startRow: 1,
  grid: [
    ['P1', '.', '5', '5', '5', '5', '5', '.', 'P1'],
    ['.', '4', '.', '4', '.', '4', '.', '4', '.'],
    ['P2', '.', 'W', '.', 'E', '.', 'W', '.', 'P2'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['P3', '.', '5', '5', '5', '5', '5', '.', 'P3'],
  ],
});

export const level82: LevelData = createLevel({
  id: '82',
  name: 'Level 82: Crystal Cathedral',
  creator: 'sourav',
  playCount: 1026,
  startRow: 1,
  grid: [
    ['.', '.', '5', '4', '5', '4', '5', '.', '.'],
    ['.', '5', '.', '.', 'E', '.', '.', '5', '.'],
    ['.', '5', '.', '4', '.', '4', '.', '5', '.'],
    ['.', '5', '.', '.', '.', '.', '.', '5', '.'],
    ['.', 'W', '.', '3', '.', '3', '.', 'W', '.'],
    ['.', '.', '5', '.', '5', '.', '5', '.', '.'],
  ],
});

export const level83: LevelData = createLevel({
  id: '83',
  name: 'Level 83: Matrix Rain',
  creator: 'sourav',
  playCount: 1019,
  startRow: 1,
  grid: [
    ['4', '.', '5', '.', '4', '.', '5', '.', '4'],
    ['4', '.', '5', '.', '4', '.', '5', '.', '4'],
    ['3', '.', '4', '.', '3', '.', '4', '.', '3'],
    ['3', '.', '4', '.', '3', '.', '4', '.', '3'],
    ['2', '.', '3', '.', '2', '.', '3', '.', '2'],
    ['1', '.', '2', '.', 'E', '.', '2', '.', '1'],
  ],
});

export const level84: LevelData = createLevel({
  id: '84',
  name: 'Level 84: Dark Matter',
  creator: 'sourav',
  playCount: 1012,
  startRow: 1,
  grid: [
    ['.', '.', '.', '5', '5', '5', '.', '.', '.'],
    ['.', '.', '5', '.', '.', '.', '5', '.', '.'],
    ['.', '5', '.', '.', '.', '.', '.', '5', '.'],
    ['.', '5', '.', 'P1', 'E', 'P1', '.', '5', '.'],
    ['.', '5', '.', '.', '.', '.', '.', '5', '.'],
    ['.', '.', '5', '.', '.', '.', '5', '.', '.'],
    ['.', '.', '.', '5', '5', '5', '.', '.', '.'],
  ],
});

export const level85: LevelData = createLevel({
  id: '85',
  name: 'Level 85: Chain Reaction',
  creator: 'sourav',
  playCount: 1005,
  startRow: 1,
  grid: [
    ['E', '.', '5', '.', 'E', '.', '5', '.', 'E'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['5', '.', 'E', '.', '5', '.', 'E', '.', '5'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['E', '.', '5', '.', 'E', '.', '5', '.', 'E'],
  ],
});

export const level86: LevelData = createLevel({
  id: '86',
  name: 'Level 86: Fortress Gamma',
  creator: 'sourav',
  playCount: 998,
  startRow: 1,
  grid: [
    ['W', 'W', '5', '5', '5', '5', '5', 'W', 'W'],
    ['W', '.', '5', '.', 'E', '.', '5', '.', 'W'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['.', '.', 'W', '.', '.', '.', 'W', '.', '.'],
    ['.', '.', '5', '.', '5', '.', '5', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
  ],
});

export const level87: LevelData = createLevel({
  id: '87',
  name: 'Level 87: Pulsar Gate',
  creator: 'sourav',
  playCount: 991,
  startRow: 1,
  grid: [
    ['5', '.', '.', '.', 'P1', '.', '.', '.', '5'],
    ['.', '.', '5', '.', '.', '.', '5', '.', '.'],
    ['.', '.', '.', '5', '.', '5', '.', '.', '.'],
    ['5', 'P2', '.', '4', 'E', '4', '.', 'P2', '5'],
    ['.', '.', '.', '5', '.', '5', '.', '.', '.'],
    ['.', '.', '5', '.', '.', '.', '5', '.', '.'],
    ['5', '.', '.', '.', 'P1', '.', '.', '.', '5'],
  ],
});

export const level88: LevelData = createLevel({
  id: '88',
  name: 'Level 88: Shadow Citadel',
  creator: 'sourav',
  playCount: 984,
  startRow: 1,
  grid: [
    ['W', '.', 'W', '.', 'W', '.', 'W', '.', 'W'],
    ['5', '4', '5', '4', '5', '4', '5', '4', '5'],
    ['5', '.', '4', '.', 'E', '.', '4', '.', '5'],
    ['5', '.', '.', '4', '4', '4', '.', '.', '5'],
    ['.', '.', '3', '.', '3', '.', '3', '.', '.'],
  ],
});

export const level89: LevelData = createLevel({
  id: '89',
  name: 'Level 89: Vortex Ring',
  creator: 'sourav',
  playCount: 977,
  startRow: 1,
  grid: [
    ['.', '3', '3', '3', '3', '3', '3', '3', '.'],
    ['.', '3', '.', '.', '.', '.', '.', '3', '.'],
    ['.', '3', '.', '4', '4', '4', '.', '3', '.'],
    ['.', '3', '.', '4', 'E', '4', '.', '3', '.'],
    ['.', '3', '.', '4', '4', '4', '.', '3', '.'],
    ['.', '3', '3', '3', '.', '3', '3', '3', '.'],
  ],
});

export const level90: LevelData = createLevel({
  id: '90',
  name: 'Level 90: Singularity Engine',
  creator: 'sourav',
  playCount: 970,
  startRow: 1,
  grid: [
    ['W', '5', 'E', '5', 'W', '5', 'E', '5', 'W'],
    ['P1', '.', '5', '.', '5', '.', '5', '.', 'P1'],
    ['.', '5', '.', 'W', '.', 'W', '.', '5', '.'],
    ['P2', '.', '4', '.', 'E', '.', '4', '.', 'P2'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['P3', '.', '5', '.', '5', '.', '5', '.', 'P3'],
    ['.', '.', '.', '5', '.', '5', '.', '.', '.'],
  ],
});

export const levels81to90: LevelData[] = [
  level81, level82, level83, level84, level85,
  level86, level87, level88, level89, level90,
];
