import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 01 - 05
 * Sector 01: Neon Alley Part 1
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - 'A' - 'D' : Paired Quantum Portals (A=Pair 1, B=Pair 2, C=Pair 3, D=Pair 4)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level01: LevelData = createLevel({
  id: '1',
  name: 'Level 1: First Strike',
  creator: 'sourav',
  playCount: 1500,
  startRow: 2,
  grid: [
    '    1    ', // row 2
    '   1 1   ', // row 3
    '  11111  ', // row 4
  ],
});

export const level02: LevelData = createLevel({
  id: '2',
  name: 'Level 2: Binary Pulse',
  creator: 'sourav',
  playCount: 1510,
  startRow: 1,
  grid: [
    ' 1     1 ', // row 1
    ' 12   21 ', // row 2
    '  1   1  ', // row 3
  ],
});

export const level03: LevelData = createLevel({
  id: '3',
  name: 'Level 3: Neon Chevron',
  creator: 'sourav',
  playCount: 1485,
  startRow: 1,
  grid: [
    '2       2', // row 1
    ' 2     2 ', // row 2
    '  1   1  ', // row 3
    '   1 1   ', // row 4
    '    1    ', // row 5
  ],
});

export const level04: LevelData = createLevel({
  id: '4',
  name: 'Level 4: Diamond Shard',
  creator: 'sourav',
  playCount: 1422,
  startRow: 1,
  grid: [
    '    2    ', // row 1
    '   2 2   ', // row 2
    '  2   2  ', // row 3
    '   2 2   ', // row 4
    '    1    ', // row 5
  ],
});

export const level05: LevelData = createLevel({
  id: '5',
  name: 'Level 5: Reactor Alpha',
  creator: 'sourav',
  playCount: 1354,
  startRow: 1,
  grid: [
    '   181   ', // row 1
    '  2   2  ', // row 2
    '   111   ', // row 3
  ],
});

export const levels01to05: LevelData[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
];
