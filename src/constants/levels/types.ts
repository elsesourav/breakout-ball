import { BlockData, LevelData } from '../../types/game';

export interface LevelTemplate {
  id: string;
  name: string;
  creator: string;
  playCount: number;
  startRow?: number; // Row index where grid[0] starts (defaults to 1)
  grid: string[];    // Array of 9-column ASCII grid strings
  isPublic?: boolean;
  createdAt?: number;
}

/**
 * Parses a visual 9-column grid layout into standard Breakout Ball BlockData[].
 * Supported character mapping:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Legacy, Auto-Paired)
 * - 'A' or 'a': Quantum Portal Pair 1 (portalPairId = 1)
 * - 'B' or 'b': Quantum Portal Pair 2 (portalPairId = 2)
 * - 'C' or 'c': Quantum Portal Pair 3 (portalPairId = 3)
 * - 'D' or 'd': Quantum Portal Pair 4 (portalPairId = 4)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' ' or '.' or '-': Empty slot
 */
export function gridToBlocks(grid: string[], startRow: number = 1): BlockData[] {
  const blocks: BlockData[] = [];
  grid.forEach((rowStr, rIdx) => {
    const y = startRow + rIdx;
    for (let x = 0; x < rowStr.length && x < 9; x++) {
      const ch = rowStr[x];
      let h = 0;
      let portalPairId: number | undefined;

      if (ch >= '1' && ch <= '5') {
        h = parseInt(ch, 10);
      } else if (ch === '6' || ch === 'W' || ch === 'w') {
        h = 6;
      } else if (ch === '7' || ch === 'P' || ch === 'p') {
        h = 7;
      } else if (ch === 'A' || ch === 'a') {
        h = 7;
        portalPairId = 1;
      } else if (ch === 'B' || ch === 'b') {
        h = 7;
        portalPairId = 2;
      } else if (ch === 'C' || ch === 'c') {
        h = 7;
        portalPairId = 3;
      } else if (ch === 'D' || ch === 'd') {
        h = 7;
        portalPairId = 4;
      } else if (ch === '8' || ch === 'E' || ch === 'e') {
        h = 8;
      }

      if (h > 0) {
        blocks.push({ x, y, h, ...(portalPairId !== undefined ? { portalPairId } : {}) });
      }
    }
  });
  return blocks;
}

/**
 * Creates a fully typed LevelData object from a visual ASCII grid template.
 */
export function createLevel(template: LevelTemplate): LevelData {
  return {
    id: template.id,
    name: template.name,
    creator: template.creator,
    playCount: template.playCount,
    blocks: gridToBlocks(template.grid, template.startRow ?? 1),
    isPublic: template.isPublic ?? true,
    createdAt: template.createdAt,
  };
}
