import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 21 - 25
 * Sector 03: Quantum Void Part 1
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level21: LevelData = createLevel({
  id: '21',
  name: 'Level 21: Quantum Gateway Alpha',
  creator: 'sourav',
  playCount: 981,
  startRow: 1,
  grid: [
    ' 7     7 ', // row 1
    '  23332  ', // row 2
    '   222   ', // row 3
    '    1    ', // row 4
  ],
});

export const level22: LevelData = createLevel({
  id: '22',
  name: 'Level 22: Asteroid Shards',
  creator: 'sourav',
  playCount: 950,
  startRow: 1,
  grid: [
    ' 5  5  5 ', // row 1
    '  4 7 4  ', // row 2
    '   8 8   ', // row 3
    '3   7   3', // row 4
  ],
});

export const level23: LevelData = createLevel({
  id: '23',
  name: 'Level 23: Quantum Apex Gate',
  creator: 'sourav',
  playCount: 884,
  startRow: 1,
  grid: [
    '7 5 8 5 7', // row 1
    ' 6 4 4 6 ', // row 2
    '  5 8 5  ', // row 3
    '   3 3   ', // row 4
  ],
});

export const level24: LevelData = createLevel({
  id: '24',
  name: 'Level 24: Bastion Ramparts',
  creator: 'sourav',
  playCount: 818,
  startRow: 1,
  grid: [
    ' 55 7 55 ', // row 1
    '6  8 8  6', // row 2
    ' 4  7  4 ', // row 3
    '  3   3  ', // row 4
  ],
});

export const level25: LevelData = createLevel({
  id: '25',
  name: 'Level 25: Shielded Bunker',
  creator: 'sourav',
  playCount: 787,
  startRow: 1,
  grid: [
    '  66666  ', // row 1
    '  65556  ', // row 2
    '  64846  ', // row 3
    ' 2     2 ', // row 4
  ],
});

export const levels21to25: LevelData[] = [
  level21,
  level22,
  level23,
  level24,
  level25,
];
