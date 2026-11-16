import { CANVAS_WIDTH, GRID_COLS } from '../../constants/game';
import { BlockData } from '../../types/game';

export const DESIGNER_CANVAS_WIDTH = CANVAS_WIDTH; // 1152
export const DESIGNER_CANVAS_HEIGHT = GRID_COLS * (128 * 0.75); // 1056 (11 rows * 96px)

export const STANDARD_TOOLS = [1, 2, 3, 4, 5];

export const SPECIAL_TOOLS = [
  { id: 6, label: 'TITANIUM', shortLabel: 'TITANIUM', color: '#94a3b8' },
  { id: 7, label: 'PORTAL', shortLabel: 'PORTAL', color: '#00f7ff' },
  { id: 8, label: 'DETONATOR', shortLabel: 'BLAST', color: '#ffaa00' },
  { id: 0, label: 'ERASER', shortLabel: 'ERASER', color: '#ff0055' },
];

export const PORTAL_COLORS: Record<number, { border: string; bg: string; text: string; name: string }> = {
  1: { border: '#00f7ff', bg: 'rgba(0, 247, 255, 0.25)', text: '#00f7ff', name: 'CYAN' },
  2: { border: '#e879f9', bg: 'rgba(232, 121, 249, 0.25)', text: '#e879f9', name: 'MAGENTA' },
  3: { border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.25)', text: '#fbbf24', name: 'AMBER' },
  4: { border: '#34d399', bg: 'rgba(52, 211, 153, 0.25)', text: '#34d399', name: 'EMERALD' },
};

export interface GridCell {
  h: number;
  portalPairId?: number;
}

export interface PendingPortalState {
  x: number;
  y: number;
  pairId: number;
}

export interface DesignerSnapshot {
  grid: GridCell[][];
  pendingPortal: PendingPortalState | null;
}

export interface HistoryStack {
  past: DesignerSnapshot[];
  present: DesignerSnapshot;
  future: DesignerSnapshot[];
}

export const createEmptyGrid = (cols = GRID_COLS, rows = 9): GridCell[][] =>
  Array.from({ length: cols }, () =>
    Array.from({ length: rows }, () => ({ h: 0 }))
  );

export const cloneGrid = (grid: GridCell[][]): GridCell[][] =>
  grid.map((row) => row.map((cell) => ({ ...cell })));

export const cloneSnapshot = (snapshot: DesignerSnapshot): DesignerSnapshot => ({
  grid: cloneGrid(snapshot.grid),
  pendingPortal: snapshot.pendingPortal ? { ...snapshot.pendingPortal } : null,
});

export const blocksToGrid = (blocks: BlockData[] = []): GridCell[][] => {
  const grid = createEmptyGrid();
  blocks.forEach((b) => {
    if (b.y >= 0 && b.y < GRID_COLS && b.x >= 0 && b.x < 9) {
      grid[b.y][b.x] = {
        h: b.h,
        ...(b.portalPairId !== undefined ? { portalPairId: b.portalPairId } : {}),
      };
    }
  });
  return grid;
};

export const isMac =
  typeof window !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);
