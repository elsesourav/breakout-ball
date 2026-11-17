import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 21 - 30
 * Sector 03: Quantum Core (Portal Wormhole Nexus)
 */

export const level21: LevelData = createLevel({
  id: '21',
  name: 'Level 21: Quantum Gateway',
  creator: 'sourav',
  playCount: 1453,
  startRow: 1,
  grid: [
    ['P1', '.', '.', '.', '.', '.', '.', '.', 'P1'],
    ['.', '.', '3', '3', '3', '3', '3', '.', '.'],
    ['.', '1', '.', '2', '2', '2', '.', '1', '.'],
    ['.', '.', '.', '.', '1', '.', '.', '.', '.'],
  ],
});

export const level22: LevelData = createLevel({
  id: '22',
  name: 'Level 22: Warp Diamond',
  creator: 'sourav',
  playCount: 1446,
  startRow: 1,
  grid: [
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
    ['.', '.', 'P1', '.', 'E', '.', 'P1', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
  ],
});

export const level23: LevelData = createLevel({
  id: '23',
  name: 'Level 23: Dual Wormhole',
  creator: 'sourav',
  playCount: 1439,
  startRow: 1,
  grid: [
    ['P1', '.', '4', '.', '.', '.', '4', '.', 'P2'],
    ['.', '.', '.', '3', 'E', '3', '.', '.', '.'],
    ['P2', '.', '4', '.', '.', '.', '4', '.', 'P1'],
    ['.', '.', '.', '.', '2', '.', '.', '.', '.'],
    ['.', '.', '.', '1', '.', '1', '.', '.', '.'],
  ],
});

export const level24: LevelData = createLevel({
  id: '24',
  name: 'Level 24: Asteroid Shards',
  creator: 'sourav',
  playCount: 1432,
  startRow: 1,
  grid: [
    ['.', '5', '.', '.', '5', '.', '.', '5', '.'],
    ['.', '.', '4', '.', 'P1', '.', '4', '.', '.'],
    ['.', '.', '.', 'E', '.', 'E', '.', '.', '.'],
    ['3', '.', '.', '.', 'P1', '.', '.', '.', '3'],
  ],
});

export const level25: LevelData = createLevel({
  id: '25',
  name: 'Level 25: Quantum Apex Gate',
  creator: 'sourav',
  playCount: 1425,
  startRow: 1,
  grid: [
    ['P1', '.', '5', '.', 'E', '.', '5', '.', 'P1'],
    ['.', 'W', '.', '4', '.', '4', '.', 'W', '.'],
    ['.', '.', '5', '.', 'E', '.', '5', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
  ],
});

export const level26: LevelData = createLevel({
  id: '26',
  name: 'Level 26: Shielded Bunker',
  creator: 'sourav',
  playCount: 1418,
  startRow: 1,
  grid: [
    ['.', '.', 'W', 'W', 'W', 'W', 'W', '.', '.'],
    ['.', '.', 'W', '5', '5', '5', 'W', '.', '.'],
    ['.', '.', 'W', '4', 'E', '4', 'W', '.', '.'],
    ['.', '2', '.', '.', '.', '.', '.', '2', '.'],
    ['1', '.', '.', '.', '1', '.', '.', '.', '1'],
  ],
});

export const level27: LevelData = createLevel({
  id: '27',
  name: 'Level 27: Orbital Ring',
  creator: 'sourav',
  playCount: 1411,
  startRow: 1,
  grid: [
    ['.', '.', '.', '2', '3', '2', '.', '.', '.'],
    ['.', '.', '2', '.', '.', '.', '2', '.', '.'],
    ['.', '3', '.', '.', 'E', '.', '.', '3', '.'],
    ['.', '.', '2', '.', '.', '.', '2', '.', '.'],
    ['.', '.', '.', '2', '3', '2', '.', '.', '.'],
  ],
});

export const level28: LevelData = createLevel({
  id: '28',
  name: 'Level 28: Quantum Cataclysm',
  creator: 'sourav',
  playCount: 1404,
  startRow: 1,
  grid: [
    ['P1', '.', '5', '.', 'E', '.', '5', '.', 'P1'],
    ['.', '4', '.', 'P2', '.', 'P2', '.', '4', '.'],
    ['.', '.', '5', '.', 'W', '.', '5', '.', '.'],
    ['.', '.', '.', '4', '.', '4', '.', '.', '.'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
  ],
});

export const level29: LevelData = createLevel({
  id: '29',
  name: 'Level 29: Quantum Lattice',
  creator: 'sourav',
  playCount: 1397,
  startRow: 1,
  grid: [
    ['P1', '.', '5', '.', '5', '.', '5', '.', 'P1'],
    ['.', 'E', '.', 'W', '.', 'W', '.', 'E', '.'],
    ['.', '.', '4', '.', '5', '.', '4', '.', '.'],
    ['.', '.', '.', '3', '.', '3', '.', '.', '.'],
  ],
});

export const level30: LevelData = createLevel({
  id: '30',
  name: 'Level 30: Dreadnought Bastion',
  creator: 'sourav',
  playCount: 1390,
  startRow: 1,
  grid: [
    ['W', '5', '5', 'E', '.', 'E', '5', '5', 'W'],
    ['.', 'P1', '.', '.', '.', '.', '.', 'P1', '.'],
    ['.', '.', '5', '.', '5', '.', '5', '.', '.'],
    ['.', '.', '.', '4', '.', '4', '.', '.', '.'],
    ['.', '.', '.', '.', '5', '.', '.', '.', '.'],
  ],
});

export const levels21to30: LevelData[] = [
  level21, level22, level23, level24, level25,
  level26, level27, level28, level29, level30,
];
