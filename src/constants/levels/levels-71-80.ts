import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 71 - 80
 * Sector 08: Hyperion Grid (Quantum Supercomputer)
 */

export const level71: LevelData = createLevel({
  id: '71',
  name: 'Level 71: Checker Fortress',
  creator: 'sourav',
  playCount: 1103,
  startRow: 1,
  grid: [
    ['3', '.', '4', '.', '3', '.', '4', '.', '3'],
    ['.', 'W', '.', 'W', '.', 'W', '.', 'W', '.'],
    ['4', '.', '5', '.', '4', '.', '5', '.', '4'],
    ['.', 'W', '.', 'W', '.', 'W', '.', 'W', '.'],
    ['3', '.', '4', '.', '3', '.', '4', '.', '3'],
  ],
});

export const level72: LevelData = createLevel({
  id: '72',
  name: 'Level 72: Holo Pine',
  creator: 'sourav',
  playCount: 1096,
  startRow: 1,
  grid: [
    ['.', '.', '.', '.', 'E', '.', '.', '.', '.'],
    ['.', '.', '.', '1', '1', '1', '.', '.', '.'],
    ['.', '.', '1', '1', '1', '1', '1', '.', '.'],
    ['.', '.', '2', '2', '2', '2', '2', '.', '.'],
    ['.', '2', '2', '2', '2', '2', '2', '2', '.'],
    ['.', '3', '3', '3', '3', '3', '3', '3', '.'],
    ['3', '3', '3', '3', '3', '3', '3', '3', '3'],
    ['.', '.', '.', '.', 'W', '.', '.', '.', '.'],
  ],
});

export const level73: LevelData = createLevel({
  id: '73',
  name: 'Level 73: Neon Maze',
  creator: 'sourav',
  playCount: 1089,
  startRow: 1,
  grid: [
    ['5', '.', 'W', '.', '5', '.', 'W', '.', '5'],
    ['.', '4', '.', '4', '.', '4', '.', '4', '.'],
    ['W', '.', '5', '.', 'W', '.', '5', '.', 'W'],
    ['.', '4', '.', '4', '.', '4', '.', '4', '.'],
    ['5', '.', 'W', '.', '5', '.', 'W', '.', '5'],
  ],
});

export const level74: LevelData = createLevel({
  id: '74',
  name: 'Level 74: Twin Reactors',
  creator: 'sourav',
  playCount: 1082,
  startRow: 1,
  grid: [
    ['.', '.', '.', '4', '4', '4', '.', '.', '.'],
    ['.', '.', '.', '4', 'E', '4', '.', '.', '.'],
    ['.', '.', '.', '4', '4', '4', '.', '.', '.'],
    ['.', '.', 'W', 'W', 'W', 'W', 'W', '.', '.'],
    ['.', '.', '.', '5', '5', '5', '.', '.', '.'],
    ['.', '.', '.', '5', 'E', '5', '.', '.', '.'],
    ['.', '.', '.', '5', '5', '5', '.', '.', '.'],
  ],
});

export const level75: LevelData = createLevel({
  id: '75',
  name: 'Level 75: Gravity Well',
  creator: 'sourav',
  playCount: 1075,
  startRow: 1,
  grid: [
    ['P1', '.', '5', '5', '5', '5', '5', '.', 'P1'],
    ['.', '4', '.', '.', '.', '.', '.', '4', '.'],
    ['P2', '.', '4', '.', 'E', '.', '4', '.', 'P2'],
    ['.', '3', '.', '3', '.', '3', '.', '3', '.'],
    ['P3', '.', '5', '.', '5', '.', '5', '.', 'P3'],
  ],
});

export const level76: LevelData = createLevel({
  id: '76',
  name: 'Level 76: Titan Gauntlet',
  creator: 'sourav',
  playCount: 1068,
  startRow: 1,
  grid: [
    ['5', 'W', '5', 'W', '5', 'W', '5', 'W', '5'],
    ['.', '4', '.', 'E', '.', 'E', '.', '4', '.'],
    ['4', '.', '4', '.', '4', '.', '4', '.', '4'],
    ['.', '3', '.', '3', '.', '3', '.', '3', '.'],
    ['.', '.', '2', '.', '.', '.', '2', '.', '.'],
  ],
});

export const level77: LevelData = createLevel({
  id: '77',
  name: 'Level 77: Neon Butterfly',
  creator: 'sourav',
  playCount: 1061,
  startRow: 1,
  grid: [
    ['3', '3', '.', '.', '.', '.', '.', '3', '3'],
    ['3', '3', '3', '.', '4', '.', '3', '3', '3'],
    ['3', '3', 'E', '.', '4', '.', 'E', '3', '3'],
    ['.', '3', '3', '.', '4', '.', '3', '3', '.'],
    ['.', '.', '3', '.', '4', '.', '3', '.', '.'],
  ],
});

export const level78: LevelData = createLevel({
  id: '78',
  name: 'Level 78: Nova Burst',
  creator: 'sourav',
  playCount: 1054,
  startRow: 1,
  grid: [
    ['4', '.', '.', '.', '4', '.', '.', '.', '4'],
    ['.', '.', '4', '.', '5', '.', '4', '.', '.'],
    ['.', '.', '.', '3', '3', '3', '.', '.', '.'],
    ['5', '.', '4', '3', 'E', '3', '4', '.', '5'],
    ['.', '.', '.', '3', '3', '3', '.', '.', '.'],
    ['.', '.', '4', '.', '5', '.', '4', '.', '.'],
    ['4', '.', '.', '.', '4', '.', '.', '.', '4'],
  ],
});

export const level79: LevelData = createLevel({
  id: '79',
  name: 'Level 79: Prism Labyrinth',
  creator: 'sourav',
  playCount: 1047,
  startRow: 1,
  grid: [
    ['P1', '.', '5', '.', 'P2', '.', '5', '.', 'P1'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['P3', '.', 'E', '.', '5', '.', 'E', '.', 'P3'],
    ['.', '5', '.', '5', '.', '5', '.', '5', '.'],
    ['.', '.', '5', '.', 'P2', '.', '5', '.', '.'],
    ['.', '.', '.', '4', '.', '4', '.', '.', '.'],
  ],
});

export const level80: LevelData = createLevel({
  id: '80',
  name: 'Level 80: Hyperion Colossus',
  creator: 'sourav',
  playCount: 1040,
  startRow: 1,
  grid: [
    ['W', '5', '4', '4', '5', '4', '4', '5', 'W'],
    ['W', '4', 'E', '4', '.', '4', 'E', '4', 'W'],
    ['W', '.', '5', '.', '5', '.', '5', '.', 'W'],
    ['.', 'W', '.', '5', '.', '5', '.', 'W', '.'],
    ['.', '.', '4', '.', '4', '.', '4', '.', '.'],
    ['.', '.', '.', '3', 'E', '3', '.', '.', '.'],
    ['.', '.', '.', '.', '5', '.', '.', '.', '.'],
  ],
});

export const levels71to80: LevelData[] = [
  level71, level72, level73, level74, level75,
  level76, level77, level78, level79, level80,
];
