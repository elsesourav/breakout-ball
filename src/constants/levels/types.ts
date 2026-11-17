import { BlockData, LevelData } from '../../types/game';

export interface LevelTemplate {
  id: string;
  name: string;
  creator: string;
  playCount: number;
  startRow?: number; // Row index where grid[0] starts (defaults to 1)
  grid: string[] | string[][]; // Array of 9-col ASCII strings or cell token arrays
  isPublic?: boolean;
  createdAt?: number;
}

/**
 * Parses a visual 9-column grid layout into standard Breakout Ball BlockData[].
 * Supported character mapping:
 * - '1' - '5' : Destructible Crystal Bricks (HP 1 to 5)
 * - '6' or 'W': Titanium Wall (Indestructible Barrier)
 * - '7' or 'P': Quantum Portal (Legacy, Auto-Paired)
 * - 'P1' / 'A': Quantum Portal Pair 1 (portalPairId = 1)
 * - 'P2' / 'B': Quantum Portal Pair 2 (portalPairId = 2)
 * - 'P3' / 'C': Quantum Portal Pair 3 (portalPairId = 3)
 * - 'P4' / 'D': Quantum Portal Pair 4 (portalPairId = 4)
 * - '8' or 'E': Countdown EMP Detonator (Kinetic Shockwave)
 * - ' ' or '.' or '-': Empty slot
 */
export function gridToBlocks(grid: string[] | string[][], startRow: number = 1): BlockData[] {
  const blocks: BlockData[] = [];
  grid.forEach((row, rIdx) => {
    const y = startRow + rIdx;
    const cells = Array.isArray(row) ? row : row.split('');
    for (let x = 0; x < cells.length && x < 9; x++) {
      const ch = cells[x].trim();
      let h = 0;
      let portalPairId: number | undefined;

      if (ch >= '1' && ch <= '5') {
        h = parseInt(ch, 10);
      } else if (ch === '6' || ch === 'W' || ch === 'w') {
        h = 6;
      } else if (ch === '7' || ch === 'P' || ch === 'p') {
        h = 7;
      } else if (ch === 'P1' || ch === 'p1' || ch === 'A' || ch === 'a') {
        h = 7;
        portalPairId = 1;
      } else if (ch === 'P2' || ch === 'p2' || ch === 'B' || ch === 'b') {
        h = 7;
        portalPairId = 2;
      } else if (ch === 'P3' || ch === 'p3' || ch === 'C' || ch === 'c') {
        h = 7;
        portalPairId = 3;
      } else if (ch === 'P4' || ch === 'p4' || ch === 'D' || ch === 'd') {
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
