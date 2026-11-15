import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 01 - 05
 * Sector 01: Neon Alley Part 1
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level01: LevelData = createLevel({
  id: '1',
  name: 'Level 1: EMP Sparks',
  creator: 'sourav',
  playCount: 1500,
  startRow: 1,
  grid: [
    '  12321  ', // row 1
    '   282   ', // row 2
    '  11 11  ', // row 3
  ],
});

export const level02: LevelData = createLevel({
  id: '2',
  name: 'Level 2: Binary Orbit',
  creator: 'sourav',
  playCount: 1510,
  startRow: 1,
  grid: [
    '  43 34  ', // row 1
    '  83 38  ', // row 2
    ' 7  6  7 ', // row 3
    '  2   2  ', // row 4
  ],
});

export const level03: LevelData = createLevel({
  id: '3',
  name: 'Level 3: Reactor Core Alpha',
  creator: 'sourav',
  playCount: 1485,
  startRow: 1,
  grid: [
    '    8    ', // row 1
    ' 4 7 7 4 ', // row 2
    '  3 6 3  ', // row 3
    '   2 2   ', // row 4
    '    1    ', // row 5
  ],
});

export const level04: LevelData = createLevel({
  id: '4',
  name: 'Level 4: Chronos Vault',
  creator: 'sourav',
  playCount: 1422,
  startRow: 1,
  grid: [
    ' 6667666 ', // row 1
    '  48 84  ', // row 2
    '   474   ', // row 3
    '    2    ', // row 4
  ],
});

export const level05: LevelData = createLevel({
  id: '5',
  name: 'Level 5: Diamond Core',
  creator: 'sourav',
  playCount: 1354,
  startRow: 1,
  grid: [
    '    4    ', // row 1
    '   3 3   ', // row 2
    '  2 6 2  ', // row 3
    '   2 2   ', // row 4
    '    1    ', // row 5
  ],
});

export const levels01to05: LevelData[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
];
