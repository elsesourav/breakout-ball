import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 01 - 10
 * Sector 01: Neon Alley (Classic Energy Matrix)
 */

export const level01: LevelData = createLevel({
  id: '1',
  name: 'Level 1: First Strike',
  creator: 'sourav',
  playCount: 1593,
  startRow: 2,
  grid: [
    ['.', '.', '.', '.', '1', '.', '.', '.', '.'],
    ['.', '.', '.', '1', '1', '1', '.', '.', '.'],
    ['.', '.', '1', '1', '1', '1', '1', '.', '.'],
  ],
});

export const level02: LevelData = createLevel({
  id: '2',
  name: 'Level 2: Checker Pulse',
  creator: 'sourav',
  playCount: 1586,
  startRow: 1,
  grid: [
    ['1', '.', '1', '.', '1', '.', '1', '.', '1'],
    ['.', '1', '.', '1', '.', '1', '.', '1', '.'],
    ['1', '.', '1', '.', '1', '.', '1', '.', '1'],
  ],
});

export const level03: LevelData = createLevel({
  id: '3',
  name: 'Level 3: Neon Chevron',
  creator: 'sourav',
  playCount: 1579,
  startRow: 1,
  grid: [
    ['2', '.', '1', '.', '.', '.', '1', '.', '2'],
    ['.', '2', '.', '1', '.', '1', '.', '2', '.'],
    ['.', '.', '2', '.', '1', '.', '2', '.', '.'],
    ['.', '.', '.', '2', '.', '2', '.', '.', '.'],
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
  ],
});

export const level04: LevelData = createLevel({
  id: '4',
  name: 'Level 4: Diamond Shard',
  creator: 'sourav',
  playCount: 1572,
  startRow: 1,
  grid: [
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
    ['.', '.', '.', '2', '2', '2', '.', '.', '.'],
    ['.', '.', '2', '1', '1', '1', '2', '.', '.'],
    ['.', '.', '.', '2', '2', '2', '.', '.', '.'],
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
  ],
});

export const level05: LevelData = createLevel({
  id: '5',
  name: 'Level 5: Reactor Alpha',
  creator: 'sourav',
  playCount: 1565,
  startRow: 2,
  grid: [
    ['.', '.', '2', '2', '2', '2', '2', '.', '.'],
    ['.', '.', '1', '.', 'E', '.', '1', '.', '.'],
    ['.', '.', '2', '2', '2', '2', '2', '.', '.'],
  ],
});

export const level06: LevelData = createLevel({
  id: '6',
  name: 'Level 6: Helix Strand',
  creator: 'sourav',
  playCount: 1558,
  startRow: 1,
  grid: [
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
    ['.', '.', '1', '.', '.', '.', '2', '.', '.'],
    ['.', '1', '.', '.', '.', '.', '.', '2', '.'],
    ['.', '.', '1', '.', '.', '.', '2', '.', '.'],
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
    ['.', '.', '2', '.', '.', '.', '1', '.', '.'],
    ['.', '2', '.', '.', '.', '.', '.', '1', '.'],
    ['.', '.', '2', '.', '.', '.', '1', '.', '.'],
  ],
});

export const level07: LevelData = createLevel({
  id: '7',
  name: 'Level 7: Shield Row',
  creator: 'sourav',
  playCount: 1551,
  startRow: 1,
  grid: [
    ['.', '2', '2', '2', '2', '2', '2', '2', '.'],
    ['.', '.', 'W', '.', '.', '.', 'W', '.', '.'],
    ['.', '1', '.', '1', '.', '1', '.', '1', '.'],
    ['.', '.', '1', '.', '1', '.', '1', '.', '.'],
  ],
});

export const level08: LevelData = createLevel({
  id: '8',
  name: 'Level 8: Cluster Core',
  creator: 'sourav',
  playCount: 1544,
  startRow: 1,
  grid: [
    ['.', '.', '.', '3', '3', '3', '.', '.', '.'],
    ['.', '.', '2', '2', 'E', '2', '2', '.', '.'],
    ['.', '.', '.', '2', '2', '2', '.', '.', '.'],
    ['.', '.', '.', '.', '1', '.', '.', '.', '.'],
  ],
});

export const level09: LevelData = createLevel({
  id: '9',
  name: 'Level 9: Twin Pillars',
  creator: 'sourav',
  playCount: 1537,
  startRow: 1,
  grid: [
    ['.', '3', '.', '.', '2', '.', '.', '3', '.'],
    ['.', '2', '.', '.', '1', '.', '.', '2', '.'],
    ['.', '2', '.', '.', '1', '.', '.', '2', '.'],
    ['.', '2', '.', '.', '1', '.', '.', '2', '.'],
    ['.', '1', '.', '.', '.', '.', '.', '1', '.'],
  ],
});

export const level10: LevelData = createLevel({
  id: '10',
  name: 'Level 10: Gateway Alpha',
  creator: 'sourav',
  playCount: 1530,
  startRow: 1,
  grid: [
    ['P1', '.', '2', '2', '2', '2', '2', '.', 'P1'],
    ['.', '.', '1', 'E', '1', 'E', '1', '.', '.'],
    ['.', '.', '.', '.', '1', '.', '.', '.', '.'],
  ],
});

export const levels01to10: LevelData[] = [
  level01, level02, level03, level04, level05,
  level06, level07, level08, level09, level10,
];
