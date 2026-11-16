import { GRID_ROWS, GRID_COLS } from '../../constants/game';
import { GridCell, PendingPortalState } from './DesignerTypes';

export function getNextAvailablePairId(currentGrid: GridCell[][]): number | null {
  const usedIds = new Set<number>();
  currentGrid.forEach((row) => {
    row.forEach((cell) => {
      if (cell.h === 7 && cell.portalPairId !== undefined) {
        usedIds.add(cell.portalPairId);
      }
    });
  });
  for (let id = 1; id <= 4; id++) {
    if (!usedIds.has(id)) return id;
  }
  return null;
}

export function findAdjacentPortalSlot(
  currentGrid: GridCell[][],
  gridX: number,
  gridY: number
): { p2x: number; p2y: number } {
  let p2x = gridX + 1;
  let p2y = gridY;

  if (p2x >= GRID_ROWS || currentGrid[p2y][p2x].h !== 0) {
    if (gridX - 1 >= 0 && currentGrid[gridY][gridX - 1].h === 0) {
      p2x = gridX - 1;
      p2y = gridY;
    } else if (gridY + 1 < GRID_COLS && currentGrid[gridY + 1][gridX].h === 0) {
      p2x = gridX;
      p2y = gridY + 1;
    } else if (gridY - 1 >= 0 && currentGrid[gridY - 1][gridX].h === 0) {
      p2x = gridX;
      p2y = gridY - 1;
    } else {
      let foundEmpty = false;
      for (let r = 0; r < GRID_COLS && !foundEmpty; r++) {
        for (let c = 0; c < GRID_ROWS && !foundEmpty; c++) {
          if ((r !== gridY || c !== gridX) && currentGrid[r][c].h === 0) {
            p2x = c;
            p2y = r;
            foundEmpty = true;
          }
        }
      }
      if (!foundEmpty) {
        p2x = gridX + 1 < GRID_ROWS ? gridX + 1 : gridX - 1;
        p2y = gridY;
      }
    }
  }
  return { p2x, p2y };
}

export function extractActivePairs(grid: GridCell[][]) {
  const activePairs: { pairId: number; blocks: { x: number; y: number }[] }[] = [];
  const pairGroupMap = new Map<number, { x: number; y: number }[]>();
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.h === 7 && cell.portalPairId !== undefined) {
        if (!pairGroupMap.has(cell.portalPairId)) {
          pairGroupMap.set(cell.portalPairId, []);
        }
        pairGroupMap.get(cell.portalPairId)!.push({ x, y });
      }
    });
  });
  pairGroupMap.forEach((blocks, pairId) => {
    activePairs.push({ pairId, blocks });
  });
  activePairs.sort((a, b) => a.pairId - b.pairId);
  return activePairs;
}

export function validateDesignerLevel(
  breakableCount: number,
  pendingPortal: PendingPortalState | null,
  activePairs: { pairId: number; blocks: { x: number; y: number }[] }[]
): { valid: boolean; error?: string } {
  if (breakableCount === 0) {
    return {
      valid: false,
      error: 'Add at least one breakable core (HP 1-5 or Detonator Core) to the arena.',
    };
  }
  if (pendingPortal) {
    return {
      valid: false,
      error: `Portal Pair ${pendingPortal.pairId} is incomplete! Place partner or remove it.`,
    };
  }
  for (const pair of activePairs) {
    if (pair.blocks.length !== 2) {
      return {
        valid: false,
        error: `Portal Pair ${pair.pairId} has ${pair.blocks.length}/2 portals. Each portal must have a partner.`,
      };
    }
  }
  return { valid: true };
}

export function movePortalInGrid(
  currentGrid: GridCell[][],
  fromX: number,
  fromY: number,
  pairId: number,
  currentX: number,
  currentY: number
): GridCell[][] | null {
  if (
    currentX === fromX && currentY === fromY ||
    currentX < 0 || currentX >= GRID_ROWS ||
    currentY < 0 || currentY >= GRID_COLS
  ) {
    return null;
  }
  const targetCell = currentGrid[currentY][currentX];
  if (targetCell.h === 7 && targetCell.portalPairId === pairId) return null;

  return currentGrid.map((row, rIdx) =>
    row.map((cell, cIdx) => {
      if (rIdx === currentY && cIdx === currentX) return { h: 7, portalPairId: pairId };
      if (rIdx === fromY && cIdx === fromX) {
        return targetCell.h > 0 && targetCell.h !== 7 ? { ...targetCell } : { h: 0 };
      }
      return cell;
    })
  );
}
