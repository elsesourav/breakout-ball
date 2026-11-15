import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 26 - 30
 * Sector 03: Quantum Void Part 2
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level26: LevelData = createLevel({
  id: '26',
  name: 'Level 26: Shield Wall Delta',
  creator: 'sourav',
  playCount: 794,
  startRow: 1,
  grid: [
    '  66866  ', // row 1
    '  44 44  ', // row 2
    ' 3  5  3 ', // row 3
    '   2 2   ', // row 4
  ],
});

export const level27: LevelData = createLevel({
  id: '27',
  name: 'Level 27: Orbital Ring',
  creator: 'sourav',
  playCount: 806,
  startRow: 1,
  grid: [
    '   232   ', // row 1
    '  2 1 2  ', // row 2
    '  2 1 2  ', // row 3
    '   232   ', // row 4
  ],
});

export const level28: LevelData = createLevel({
  id: '28',
  name: 'Level 28: Quantum Cataclysm',
  creator: 'sourav',
  playCount: 787,
  startRow: 0,
  grid: [
    '    8    ', // row 0
    '7 5   5 7', // row 1
    ' 4 7 7 4 ', // row 2
    '  5 6 5  ', // row 3
    '   4 4   ', // row 4
    '    3    ', // row 5
  ],
});

export const level29: LevelData = createLevel({
  id: '29',
  name: 'Level 29: Quantum Lattice',
  creator: 'sourav',
  playCount: 728,
  startRow: 1,
  grid: [
    '7 5 5 5 7', // row 1
    ' 8 6 6 8 ', // row 2
    '  4 5 4  ', // row 3
    '   3 3   ', // row 4
  ],
});

export const level30: LevelData = createLevel({
  id: '30',
  name: 'Level 30: Dreadnought Bastion',
  creator: 'sourav',
  playCount: 658,
  startRow: 1,
  grid: [
    '655868556', // row 1
    ' 7     7 ', // row 2
    '  5 5 5  ', // row 3
    '   4 4   ', // row 4
  ],
});

export const levels26to30: LevelData[] = [
  level26,
  level27,
  level28,
  level29,
  level30,
];
