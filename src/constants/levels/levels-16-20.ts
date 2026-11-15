import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 16 - 20
 * Sector 02: Pulse Grid Part 2
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - 'A' - 'D' : Paired Quantum Portals (A=Pair 1, B=Pair 2, C=Pair 3, D=Pair 4)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level16: LevelData = createLevel({
  id: '16',
  name: 'Level 16: Fortress Moat',
  creator: 'sourav',
  playCount: 1109,
  startRow: 1,
  grid: [
    '66 444 66', // row 1
    '         ', // row 2
    '6 3 8 3 6', // row 3
    '   232   ', // row 4
  ],
});

export const level17: LevelData = createLevel({
  id: '17',
  name: 'Level 17: Stargate Nexus',
  creator: 'sourav',
  playCount: 1039,
  startRow: 1,
  grid: [
    ' 644 446 ', // row 1
    'A 3 8 3 A', // row 2
    '   242   ', // row 3
  ],
});

export const level18: LevelData = createLevel({
  id: '18',
  name: 'Level 18: Quantum Cross',
  creator: 'sourav',
  playCount: 981,
  startRow: 0,
  grid: [
    '    4    ', // row 0
    '    3    ', // row 1
    'A 3 8 3 A', // row 2
    '    3    ', // row 3
    '    4    ', // row 4
  ],
});

export const level19: LevelData = createLevel({
  id: '19',
  name: 'Level 19: Binary Storm',
  creator: 'sourav',
  playCount: 962,
  startRow: 1,
  grid: [
    '  8   8  ', // row 1
    ' 333 333 ', // row 2
    '  4   4  ', // row 3
    '   2 2   ', // row 4
  ],
});

export const level20: LevelData = createLevel({
  id: '20',
  name: 'Level 20: Genesis Arc',
  creator: 'sourav',
  playCount: 975,
  startRow: 1,
  grid: [
    ' 1333331 ', // row 1
    '  22222  ', // row 2
    '   111   ', // row 3
  ],
});

export const levels16to20: LevelData[] = [
  level16,
  level17,
  level18,
  level19,
  level20,
];
