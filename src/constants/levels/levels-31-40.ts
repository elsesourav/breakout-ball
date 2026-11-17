import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 31 - 40
 * Sector 04: Cyber Citadel (Heavy Armor Fortress)
 */

export const level31: LevelData = createLevel({
  id: '31',
  name: 'Level 31: Crossed Sabers',
  creator: 'sourav',
  playCount: 1383,
  startRow: 1,
  grid: [
    ['4', '.', '.', '.', '.', '.', '.', '.', '4'],
    ['.', '4', '.', '.', '.', '.', '.', '4', '.'],
    ['.', '.', '3', '.', '.', '.', '3', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
    ['.', '.', '.', '.', 'E', '.', '.', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
    ['.', '.', '3', '.', '.', '.', '3', '.', '.'],
    ['.', '4', '.', '.', '.', '.', '.', '4', '.'],
    ['4', '.', '.', '.', '.', '.', '.', '.', '4'],
  ],
});

export const level32: LevelData = createLevel({
  id: '32',
  name: 'Level 32: Chaos Lattice',
  creator: 'sourav',
  playCount: 1376,
  startRow: 1,
  grid: [
    ['.', 'E', '.', 'E', '.', 'E', '.', 'E', '.'],
    ['.', '.', '5', '.', 'P1', '.', '5', '.', '.'],
    ['.', 'W', '.', '.', '.', '.', '.', 'W', '.'],
    ['.', '.', '4', '.', 'P1', '.', '4', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
  ],
});

export const level33: LevelData = createLevel({
  id: '33',
  name: 'Level 33: Pulse Bastion',
  creator: 'sourav',
  playCount: 1369,
  startRow: 1,
  grid: [
    ['W', '4', 'P1', '5', '5', '5', 'P1', '4', 'W'],
    ['.', '.', '3', 'E', '.', 'E', '3', '.', '.'],
    ['.', '.', '.', '3', '4', '3', '.', '.', '.'],
  ],
});

export const level34: LevelData = createLevel({
  id: '34',
  name: 'Level 34: Hypercube Warp',
  creator: 'sourav',
  playCount: 1362,
  startRow: 1,
  grid: [
    ['.', '.', '5', 'W', '.', 'W', '5', '.', '.'],
    ['.', 'P1', '.', '.', 'E', '.', '.', 'P1', '.'],
    ['.', '.', '4', '5', '.', '5', '4', '.', '.'],
    ['.', '.', '.', '3', 'W', '3', '.', '.', '.'],
  ],
});

export const level35: LevelData = createLevel({
  id: '35',
  name: 'Level 35: Omega Bastion',
  creator: 'sourav',
  playCount: 1355,
  startRow: 1,
  grid: [
    ['W', '5', '5', '.', 'E', '.', '5', '5', 'W'],
    ['.', 'P1', '.', 'W', '.', 'W', '.', 'P1', '.'],
    ['.', '.', '5', '.', '5', '.', '5', '.', '.'],
    ['.', '.', '.', '4', 'E', '4', '.', '.', '.'],
    ['.', '.', '.', '.', '5', '.', '.', '.', '.'],
  ],
});

export const level36: LevelData = createLevel({
  id: '36',
  name: 'Level 36: Titanium Vault Gate',
  creator: 'sourav',
  playCount: 1348,
  startRow: 1,
  grid: [
    ['.', 'W', 'W', '5', 'E', '5', 'W', 'W', '.'],
    ['.', 'W', '.', '.', '.', '.', '.', 'W', '.'],
    ['.', '.', '5', '.', 'W', '.', '5', '.', '.'],
    ['.', '.', '.', '4', '.', '4', '.', '.', '.'],
  ],
});

export const level37: LevelData = createLevel({
  id: '37',
  name: 'Level 37: Solar Flare',
  creator: 'sourav',
  playCount: 1341,
  grid: [
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
    ['.', '.', '3', '.', '5', '.', '3', '.', '.'],
    ['.', '2', '.', '4', 'E', '4', '.', '2', '.'],
    ['.', '.', '3', '.', '5', '.', '3', '.', '.'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const level38: LevelData = createLevel({
  id: '38',
  name: 'Level 38: Warp Fortress',
  creator: 'sourav',
  playCount: 1334,
  startRow: 1,
  grid: [
    ['.', '5', '5', '5', 'E', '5', '5', '5', '.'],
    ['.', '.', '4', 'P1', '.', 'P1', '4', '.', '.'],
    ['.', '.', '.', '5', 'W', '5', '.', '.', '.'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const level39: LevelData = createLevel({
  id: '39',
  name: 'Level 39: Cyber Trident',
  creator: 'sourav',
  playCount: 1327,
  startRow: 1,
  grid: [
    ['.', '4', '.', '.', 'E', '.', '.', '4', '.'],
    ['.', '3', '.', '.', '5', '.', '.', '3', '.'],
    ['.', '3', '.', '.', '5', '.', '.', '3', '.'],
    ['.', '2', '2', '2', '2', '2', '2', '2', '.'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
  ],
});

export const level40: LevelData = createLevel({
  id: '40',
  name: 'Level 40: Obsidian Monolith',
  creator: 'sourav',
  playCount: 1320,
  startRow: 1,
  grid: [
    ['.', '.', '.', '5', 'W', '5', '.', '.', '.'],
    ['.', '.', '5', 'E', 'W', 'E', '5', '.', '.'],
    ['.', '4', '.', '.', '.', '.', '.', '4', '.'],
    ['.', '.', '5', '.', 'E', '.', '5', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
  ],
});

export const levels31to40: LevelData[] = [
  level31, level32, level33, level34, level35,
  level36, level37, level38, level39, level40,
];
