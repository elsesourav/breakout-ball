import { LevelData } from '../../types/game';
import { createLevel } from './types';

/**
 * Cyber Breakout Levels 06 - 10
 * Sector 01: Neon Alley Part 2
 *
 * Visual Grid Format:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - 'A' - 'D' : Paired Quantum Portals (A=Pair 1, B=Pair 2, C=Pair 3, D=Pair 4)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' '       : Empty Slot
 */

export const level06: LevelData = createLevel({
  id: '6',
  name: 'Level 6: Helix Strand',
  creator: 'sourav',
  playCount: 1317,
  startRow: 1,
  grid: [
    ' 2     1 ', // row 1
    '  2   1  ', // row 2
    '   3 2   ', // row 3
    '  2   3  ', // row 4
    ' 1     2 ', // row 5
  ],
});

export const level07: LevelData = createLevel({
  id: '7',
  name: 'Level 7: Shield Row',
  creator: 'sourav',
  playCount: 1319,
  startRow: 1,
  grid: [
    '  22222  ', // row 1
    '    6    ', // row 2
    '  1   1  ', // row 3
    '   111   ', // row 4
  ],
});

export const level08: LevelData = createLevel({
  id: '8',
  name: 'Level 8: Cluster Core',
  creator: 'sourav',
  playCount: 1334,
  startRow: 1,
  grid: [
    '   323   ', // row 1
    '  32823  ', // row 2
    '   212   ', // row 3
    '    1    ', // row 4
  ],
});

export const level09: LevelData = createLevel({
  id: '9',
  name: 'Level 9: Twin Pillars',
  creator: 'sourav',
  playCount: 1321,
  startRow: 1,
  grid: [
    ' 3     3 ', // row 1
    ' 2  1  2 ', // row 2
    ' 2  1  2 ', // row 3
    ' 1     1 ', // row 4
  ],
});

export const level10: LevelData = createLevel({
  id: '10',
  name: 'Level 10: Gateway Alpha',
  creator: 'sourav',
  playCount: 1267,
  startRow: 1,
  grid: [
    ' A     A ', // row 1
    '  22222  ', // row 2
    '   181   ', // row 3
    '    1    ', // row 4
  ],
});

export const levels06to10: LevelData[] = [
  level06,
  level07,
  level08,
  level09,
  level10,
];
