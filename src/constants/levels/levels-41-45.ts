import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 41 - 45
 * Sector 05: Hyper Core Overdrive Part 1
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level41: LevelData = createLevel({
  id: '41',
  name: 'Level 41: Hourglass Matrix',
  creator: 'sourav',
  playCount: 414,
  startRow: 1,
  grid: [
    ' 332 233 ', // row 1
    '  22 22  ', // row 2
    '    4    ', // row 3
    '  12 21  ', // row 4
    ' 11   11 ', // row 5
  ],
});

export const level42: LevelData = createLevel({
  id: '42',
  name: 'Level 42: Grand Apex Reactor',
  creator: 'sourav',
  playCount: 345,
  startRow: 1,
  grid: [
    ' 7 585 7 ', // row 1
    '  65856  ', // row 2
    '5 4   4 5', // row 3
    '   555   ', // row 4
    '    4    ', // row 5
  ],
});

export const level43: LevelData = createLevel({
  id: '43',
  name: 'Level 43: Singularity Overdrive',
  creator: 'sourav',
  playCount: 283,
  startRow: 1,
  grid: [
    '   565   ', // row 1
    ' 75 8 57 ', // row 2
    '  55 55  ', // row 3
    '   484   ', // row 4
    '    3    ', // row 5
  ],
});

export const level44: LevelData = createLevel({
  id: '44',
  name: 'Level 44: Space Invader',
  creator: 'sourav',
  playCount: 259,
  startRow: 1,
  grid: [
    '  3   3  ', // row 1
    '   3 3   ', // row 2
    ' 4448444 ', // row 3
    ' 2 6 6 2 ', // row 4
    '1 2   2 1', // row 5
  ],
});

export const level45: LevelData = createLevel({
  id: '45',
  name: 'Level 45: Laser Citadel',
  creator: 'sourav',
  playCount: 269,
  startRow: 1,
  grid: [
    '  55855  ', // row 1
    ' 6 7 7 6 ', // row 2
    '  4 6 4  ', // row 3
    '   343   ', // row 4
  ],
});

export const levels41to45: LevelData[] = [
  level41,
  level42,
  level43,
  level44,
  level45,
];
