import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 31 - 35
 * Sector 04: Cyber Bastion Part 1
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level31: LevelData = createLevel({
  id: '31',
  name: 'Level 31: Crossed Sabers',
  creator: 'sourav',
  playCount: 616,
  startRow: 1,
  grid: [
    '4       4', // row 1
    ' 4     4 ', // row 2
    '  3   3  ', // row 3
    '   383   ', // row 4
    '  2   2  ', // row 5
  ],
});

export const level32: LevelData = createLevel({
  id: '32',
  name: 'Level 32: Chaos Lattice',
  creator: 'sourav',
  playCount: 614,
  startRow: 1,
  grid: [
    ' 8 8 8 8 ', // row 1
    '  5 7 5  ', // row 2
    ' 6  7  6 ', // row 3
    '  4   4  ', // row 4
    '   3 3   ', // row 5
  ],
});

export const level33: LevelData = createLevel({
  id: '33',
  name: 'Level 33: Pulse Bastion',
  creator: 'sourav',
  playCount: 629,
  startRow: 1,
  grid: [
    '647555746', // row 1
    '  38 83  ', // row 2
    '   343   ', // row 3
  ],
});

export const level34: LevelData = createLevel({
  id: '34',
  name: 'Level 34: Hypercube Warp',
  creator: 'sourav',
  playCount: 621,
  startRow: 1,
  grid: [
    '  56 65  ', // row 1
    ' 7  8  7 ', // row 2
    '  45 54  ', // row 3
    '   363   ', // row 4
  ],
});

export const level35: LevelData = createLevel({
  id: '35',
  name: 'Level 35: Omega Bastion',
  creator: 'sourav',
  playCount: 572,
  startRow: 1,
  grid: [
    '655 8 556', // row 1
    ' 7 6 6 7 ', // row 2
    '  5 5 5  ', // row 3
    '   484   ', // row 4
    '    5    ', // row 5
  ],
});

export const levels31to35: LevelData[] = [
  level31,
  level32,
  level33,
  level34,
  level35,
];
