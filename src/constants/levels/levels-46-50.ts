import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 46 - 50
 * Sector 05: Hyper Core Overdrive Part 2
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level46: LevelData = createLevel({
  id: '46',
  name: 'Level 46: Fortress Citadel 2',
  creator: 'sourav',
  playCount: 278,
  startRow: 1,
  grid: [
    ' 64   46 ', // row 1
    '5  6 6  5', // row 2
    ' 4  8  4 ', // row 3
    '  3   3  ', // row 4
  ],
});

export const level47: LevelData = createLevel({
  id: '47',
  name: 'Level 47: Titan Citadel Core',
  creator: 'sourav',
  playCount: 253,
  startRow: 1,
  grid: [
    '  65656  ', // row 1
    ' 5 8 8 5 ', // row 2
    '  5 5 5  ', // row 3
    '7  4 4  7', // row 4
    '    4    ', // row 5
  ],
});

export const level48: LevelData = createLevel({
  id: '48',
  name: 'Level 48: Cyber Skull',
  creator: 'sourav',
  playCount: 190,
  startRow: 1,
  grid: [
    '  45554  ', // row 1
    ' 4 6 6 4 ', // row 2
    ' 3  8  3 ', // row 3
    '  23 32  ', // row 4
  ],
});

export const level49: LevelData = createLevel({
  id: '49',
  name: 'Level 49: Plasma Supernova',
  creator: 'sourav',
  playCount: 121,
  startRow: 0,
  grid: [
    '    8    ', // row 0
    '   555   ', // row 1
    '  5 8 5  ', // row 2
    ' 4 5 5 4 ', // row 3
    '  4 5 4  ', // row 4
    '    3    ', // row 5
  ],
});

export const level50: LevelData = createLevel({
  id: '50',
  name: 'Level 50: Anvil Core',
  creator: 'sourav',
  playCount: 90,
  startRow: 1,
  grid: [
    ' 5555555 ', // row 1
    '   686   ', // row 2
    '   4 4   ', // row 3
    '  3 3 3  ', // row 4
  ],
});

export const levels46to50: LevelData[] = [
  level46,
  level47,
  level48,
  level49,
  level50,
];
