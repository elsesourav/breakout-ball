import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 11 - 15
 * Sector 02: Pulse Grid Part 1
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level11: LevelData = createLevel({
  id: '11',
  name: 'Level 11: Cyber Chevron',
  creator: 'sourav',
  playCount: 1196,
  startRow: 1,
  grid: [
    '    3    ', // row 1
    '   2 2   ', // row 2
    '  21212  ', // row 3
    ' 1     1 ', // row 4
  ],
});

export const level12: LevelData = createLevel({
  id: '12',
  name: 'Level 12: Neon Heart',
  creator: 'sourav',
  playCount: 1147,
  startRow: 1,
  grid: [
    '  34 43  ', // row 1
    ' 3  8  3 ', // row 2
    ' 2  5  2 ', // row 3
    '  2   2  ', // row 4
    '   1 1   ', // row 5
    '    1    ', // row 6
  ],
});

export const level13: LevelData = createLevel({
  id: '13',
  name: 'Level 13: Event Horizon',
  creator: 'sourav',
  playCount: 1140,
  startRow: 1,
  grid: [
    '   666   ', // row 1
    '  68 86  ', // row 2
    ' 7  5  7 ', // row 3
    '  54 45  ', // row 4
    '    3    ', // row 5
  ],
});

export const level14: LevelData = createLevel({
  id: '14',
  name: 'Level 14: Prism Crown',
  creator: 'sourav',
  playCount: 1155,
  startRow: 1,
  grid: [
    '    3    ', // row 1
    '   232   ', // row 2
    '  12321  ', // row 3
    ' 11   11 ', // row 4
  ],
});

export const level15: LevelData = createLevel({
  id: '15',
  name: 'Level 15: Twin Reactor Nexus',
  creator: 'sourav',
  playCount: 1153,
  startRow: 1,
  grid: [
    '  8 7 8  ', // row 1
    ' 5 6 6 5 ', // row 2
    '  4 7 4  ', // row 3
    '   3 3   ', // row 4
  ],
});

export const levels11to15: LevelData[] = [
  level11,
  level12,
  level13,
  level14,
  level15,
];
