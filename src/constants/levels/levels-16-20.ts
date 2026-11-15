import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 16 - 20
 * Sector 02: Pulse Grid Part 2
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level16: LevelData = createLevel({
  id: '16',
  name: 'Level 16: EMP Labyrinth',
  creator: 'sourav',
  playCount: 1109,
  startRow: 1,
  grid: [
    ' 8  5  8 ', // row 1
    '  4 8 4  ', // row 2
    '5  6 6  5', // row 3
    ' 7  3  7 ', // row 4
  ],
});

export const level17: LevelData = createLevel({
  id: '17',
  name: 'Level 17: Fortress Moat',
  creator: 'sourav',
  playCount: 1039,
  startRow: 1,
  grid: [
    '667555766', // row 1
    '         ', // row 2
    '6 4 8 4 6', // row 3
    '   343   ', // row 4
  ],
});

export const level18: LevelData = createLevel({
  id: '18',
  name: 'Level 18: Stargate Nexus',
  creator: 'sourav',
  playCount: 981,
  startRow: 1,
  grid: [
    ' 644 446 ', // row 1
    '7 3 8 3 7', // row 2
    '   242   ', // row 3
  ],
});

export const level19: LevelData = createLevel({
  id: '19',
  name: 'Level 19: Quantum Cross',
  creator: 'sourav',
  playCount: 962,
  startRow: 0,
  grid: [
    '    5    ', // row 0
    '    4    ', // row 1
    '7 3 8 3 7', // row 2
    '    4    ', // row 3
    '    5    ', // row 4
  ],
});

export const level20: LevelData = createLevel({
  id: '20',
  name: 'Level 20: Genesis Arc',
  creator: 'sourav',
  playCount: 975,
  startRow: 2,
  grid: [
    ' 1111111 ', // row 2
    '  22222  ', // row 3
    '   111   ', // row 4
  ],
});

export const levels16to20: LevelData[] = [
  level16,
  level17,
  level18,
  level19,
  level20,
];
