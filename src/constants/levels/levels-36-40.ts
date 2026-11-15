import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 36 - 40
 * Sector 04: Cyber Bastion Part 2
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level36: LevelData = createLevel({
  id: '36',
  name: 'Level 36: Titanium Vault Gate',
  creator: 'sourav',
  playCount: 501,
  startRow: 1,
  grid: [
    ' 6658566 ', // row 1
    ' 6     6 ', // row 2
    '  5 6 5  ', // row 3
    '   4 4   ', // row 4
  ],
});

export const level37: LevelData = createLevel({
  id: '37',
  name: 'Level 37: Solar Flare',
  creator: 'sourav',
  playCount: 447,
  startRow: 0,
  grid: [
    '    4    ', // row 0
    '  3 5 3  ', // row 1
    ' 2 484 2 ', // row 2
    '  3 5 3  ', // row 3
    '    4    ', // row 4
  ],
});

export const level38: LevelData = createLevel({
  id: '38',
  name: 'Level 38: Genesis Overdrive',
  creator: 'sourav',
  playCount: 435,
  startRow: 1,
  grid: [
    ' 5558555 ', // row 1
    '  47 74  ', // row 2
    '   565   ', // row 3
    '    4    ', // row 4
  ],
});

export const level39: LevelData = createLevel({
  id: '39',
  name: 'Level 39: Cyber Trident Core',
  creator: 'sourav',
  playCount: 449,
  startRow: 0,
  grid: [
    '    8    ', // row 0
    '5   5   5', // row 1
    ' 4  5  4 ', // row 2
    '  6 4 6  ', // row 3
    '   323   ', // row 4
  ],
});

export const level40: LevelData = createLevel({
  id: '40',
  name: 'Level 40: Obsidian Monolith',
  creator: 'sourav',
  playCount: 451,
  startRow: 0,
  grid: [
    '    6    ', // row 0
    '   565   ', // row 1
    '  58685  ', // row 2
    ' 4     4 ', // row 3
    '  5 8 5  ', // row 4
    '   3 3   ', // row 5
  ],
});

export const levels36to40: LevelData[] = [
  level36,
  level37,
  level38,
  level39,
  level40,
];
