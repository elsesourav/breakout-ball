import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 41 - 50
 * Sector 05: Orbital Apex (High-Orbit Platform)
 */

export const level41: LevelData = createLevel({
  id: '41',
  name: 'Level 41: Hourglass Matrix',
  creator: 'sourav',
  playCount: 1313,
  startRow: 1,
  grid: [
    ['.', '2', '2', '2', '2', '2', '2', '2', '.'],
    ['.', '.', '1', '1', '1', '1', '1', '.', '.'],
    ['.', '.', '.', '1', '1', '1', '.', '.', '.'],
    ['.', '.', '.', '.', 'E', '.', '.', '.', '.'],
    ['.', '.', '.', '1', '1', '1', '.', '.', '.'],
    ['.', '.', '1', '1', '1', '1', '1', '.', '.'],
    ['.', '2', '2', '2', '2', '2', '2', '2', '.'],
  ],
});

export const level42: LevelData = createLevel({
  id: '42',
  name: 'Level 42: Grand Apex Reactor',
  creator: 'sourav',
  playCount: 1306,
  startRow: 1,
  grid: [
    ['.', 'P1', '.', '5', 'E', '5', '.', 'P1', '.'],
    ['.', '.', 'W', '5', 'E', '5', 'W', '.', '.'],
    ['5', '.', '4', '.', '.', '.', '4', '.', '5'],
    ['.', '.', '.', '5', '5', '5', '.', '.', '.'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const level43: LevelData = createLevel({
  id: '43',
  name: 'Level 43: Singularity Overdrive',
  creator: 'sourav',
  playCount: 1299,
  startRow: 1,
  grid: [
    ['.', '.', '.', '5', 'W', '5', '.', '.', '.'],
    ['.', 'P1', '5', '.', 'E', '.', '5', 'P2', '.'],
    ['.', '.', '5', '5', '.', '5', '5', '.', '.'],
    ['.', 'P2', '.', '4', 'E', '4', '.', 'P1', '.'],
    ['.', '.', '.', '.', '3', '.', '.', '.', '.'],
  ],
});

export const level44: LevelData = createLevel({
  id: '44',
  name: 'Level 44: Space Invader',
  creator: 'sourav',
  playCount: 1292,
  startRow: 1,
  grid: [
    ['.', '.', '1', '.', '.', '.', '1', '.', '.'],
    ['.', '.', '.', '1', '.', '1', '.', '.', '.'],
    ['.', '.', '2', '2', '2', '2', '2', '.', '.'],
    ['.', '2', '2', '.', '2', '.', '2', '2', '.'],
    ['2', '2', '2', '2', 'E', '2', '2', '2', '2'],
    ['2', '.', '2', '2', '2', '2', '2', '.', '2'],
    ['2', '.', '1', '.', '.', '.', '1', '.', '2'],
    ['.', '.', '.', '1', '1', '1', '.', '.', '.'],
  ],
});

export const level45: LevelData = createLevel({
  id: '45',
  name: 'Level 45: Laser Citadel',
  creator: 'sourav',
  playCount: 1285,
  startRow: 1,
  grid: [
    ['.', '.', '5', '5', 'E', '5', '5', '.', '.'],
    ['.', 'W', 'P1', '.', '.', '.', 'P1', 'W', '.'],
    ['.', '.', '4', '.', 'W', '.', '4', '.', '.'],
    ['.', '.', '.', '3', '4', '3', '.', '.', '.'],
  ],
});

export const level46: LevelData = createLevel({
  id: '46',
  name: 'Level 46: Fortress Citadel II',
  creator: 'sourav',
  playCount: 1278,
  startRow: 1,
  grid: [
    ['.', 'W', '4', '.', 'P1', '.', '4', 'W', '.'],
    ['5', '.', '.', 'W', '.', 'W', '.', '.', '5'],
    ['.', '4', '.', '.', 'E', '.', '.', '4', '.'],
    ['.', '.', '3', '.', 'P1', '.', '3', '.', '.'],
  ],
});

export const level47: LevelData = createLevel({
  id: '47',
  name: 'Level 47: Titan Citadel Core',
  creator: 'sourav',
  playCount: 1271,
  startRow: 1,
  grid: [
    ['.', '.', 'W', '5', 'W', '5', 'W', '.', '.'],
    ['.', '5', '.', 'E', '.', 'E', '.', '5', '.'],
    ['.', '.', '5', '.', '5', '.', '5', '.', '.'],
    ['P1', '.', '.', '4', '.', '4', '.', '.', 'P1'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const level48: LevelData = createLevel({
  id: '48',
  name: 'Level 48: Cyber Skull',
  creator: 'sourav',
  playCount: 1264,
  startRow: 1,
  grid: [
    ['.', '.', '3', '3', '3', '3', '3', '.', '.'],
    ['.', '3', '3', '3', '3', '3', '3', '3', '.'],
    ['.', '3', '3', 'E', '3', 'E', '3', '3', '.'],
    ['.', '.', '3', '.', '3', '.', '3', '.', '.'],
    ['.', '.', '2', '.', '2', '.', '2', '.', '.'],
  ],
});

export const level49: LevelData = createLevel({
  id: '49',
  name: 'Level 49: Plasma Supernova',
  creator: 'sourav',
  playCount: 1257,
  startRow: 1,
  grid: [
    ['.', '.', '.', '.', 'E', '.', '.', '.', '.'],
    ['.', '.', '.', '5', '5', '5', '.', '.', '.'],
    ['.', '.', '5', '.', 'E', '.', '5', '.', '.'],
    ['.', 'P1', '.', '5', '.', '5', '.', 'P2', '.'],
    ['.', '.', '4', '.', '5', '.', '4', '.', '.'],
    ['.', 'P2', '.', '.', '3', '.', '.', 'P1', '.'],
  ],
});

export const level50: LevelData = createLevel({
  id: '50',
  name: 'Level 50: Anvil Core',
  creator: 'sourav',
  playCount: 1250,
  startRow: 1,
  grid: [
    ['.', 'W', '5', '5', '5', '5', '5', 'W', '.'],
    ['.', '.', 'W', '.', 'E', '.', 'W', '.', '.'],
    ['.', 'P1', '.', '5', 'W', '5', '.', 'P1', '.'],
    ['.', '.', '4', '.', '.', '.', '4', '.', '.'],
    ['.', 'P2', '.', '3', 'E', '3', '.', 'P2', '.'],
    ['.', '.', '.', '.', '4', '.', '.', '.', '.'],
  ],
});

export const levels41to50: LevelData[] = [
  level41, level42, level43, level44, level45,
  level46, level47, level48, level49, level50,
];
