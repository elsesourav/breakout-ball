import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 21 - 25
 * Sector 03: Quantum Void Part 1
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - 'A' - 'D' : Paired Quantum Portals (A=Pair 1, B=Pair 2, C=Pair 3, D=Pair 4)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level21: LevelData = createLevel({
  id: '21',
  name: 'Level 21: Quantum Gateway',
  creator: 'sourav',
  playCount: 981,
  startRow: 1,
  grid: [
    'A       A', // row 1
    '  23332  ', // row 2
    '   222   ', // row 3
    '    1    ', // row 4
  ],
});

export const level22: LevelData = createLevel({
  id: '22',
  name: 'Level 22: Warp Diamond',
  creator: 'sourav',
  playCount: 950,
  startRow: 1,
  grid: [
    '    4    ', // row 1
    '   3 3   ', // row 2
    '  A 8 A  ', // row 3
    '   3 3   ', // row 4
    '    2    ', // row 5
  ],
});

export const level23: LevelData = createLevel({
  id: '23',
  name: 'Level 23: Dual Wormhole',
  creator: 'sourav',
  playCount: 884,
  startRow: 1,
  grid: [
    'A 4   4 B', // row 1
    '   383   ', // row 2
    'B 4   4 A', // row 3
    '    2    ', // row 4
  ],
});

export const level24: LevelData = createLevel({
  id: '24',
  name: 'Level 24: Asteroid Shards',
  creator: 'sourav',
  playCount: 818,
  startRow: 1,
  grid: [
    ' 5  5  5 ', // row 1
    '  4 A 4  ', // row 2
    '   8 8   ', // row 3
    '3   A   3', // row 4
  ],
});

export const level25: LevelData = createLevel({
  id: '25',
  name: 'Level 25: Quantum Apex Gate',
  creator: 'sourav',
  playCount: 787,
  startRow: 1,
  grid: [
    'A 5 8 5 A', // row 1
    ' 6 4 4 6 ', // row 2
    '  5 8 5  ', // row 3
    '   3 3   ', // row 4
  ],
});

export const levels21to25: LevelData[] = [
  level21,
  level22,
  level23,
  level24,
  level25,
];
