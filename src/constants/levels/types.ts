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
 * - '7' or 'P': Quantum Portal (Paired Warp Gateway)
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
      if (ch >= '1' && ch <= '8') {
        h = parseInt(ch, 10);
      } else if (ch === 'W' || ch === 'w') {
        h = 6;
      } else if (ch === 'P' || ch === 'p') {
        h = 7;
      } else if (ch === 'E' || ch === 'e') {
        h = 8;
      }
      if (h > 0) {
        blocks.push({ x, y, h });
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
