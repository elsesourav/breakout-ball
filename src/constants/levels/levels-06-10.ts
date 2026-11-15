import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 06 - 10
 * Sector 01: Neon Alley Part 2
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level06: LevelData = createLevel({
  id: '6',
  name: 'Level 6: Helix Accelerator',
  creator: 'sourav',
  playCount: 1317,
  startRow: 1,
  grid: [
    ' 5     5 ', // row 1
    '  4   4  ', // row 2
    '   868   ', // row 3
    '  3   3  ', // row 4
    ' 2     2 ', // row 5
  ],
});

export const level07: LevelData = createLevel({
  id: '7',
  name: 'Level 7: Cluster Detonator',
  creator: 'sourav',
  playCount: 1319,
  startRow: 1,
  grid: [
    '  3 4 3  ', // row 1
    ' 383 383 ', // row 2
    '  2   2  ', // row 3
  ],
});

export const level08: LevelData = createLevel({
  id: '8',
  name: 'Level 8: Double Helix',
  creator: 'sourav',
  playCount: 1334,
  startRow: 1,
  grid: [
    '  4   4  ', // row 1
    ' 1 4 4 1 ', // row 2
    '    8    ', // row 3
    '   3 3   ', // row 4
    '  2   2  ', // row 5
  ],
});

export const level09: LevelData = createLevel({
  id: '9',
  name: 'Level 9: Twin Pillars',
  creator: 'sourav',
  playCount: 1321,
  startRow: 1,
  grid: [
    ' 2     2 ', // row 1
    ' 2 131 2 ', // row 2
    ' 2 222 2 ', // row 3
    ' 2     2 ', // row 4
  ],
});

export const level10: LevelData = createLevel({
  id: '10',
  name: 'Level 10: Doomsday Matrix',
  creator: 'sourav',
  playCount: 1267,
  startRow: 1,
  grid: [
    '  8 5 8  ', // row 1
    ' 6 5 5 6 ', // row 2
    '  5 8 5  ', // row 3
    '7  4 4  7', // row 4
    '    4    ', // row 5
  ],
});

export const levels06to10: LevelData[] = [
  level06,
  level07,
  level08,
  level09,
  level10,
];
