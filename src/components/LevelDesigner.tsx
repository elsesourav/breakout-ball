import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { BlockData } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_ROWS, GRID_COLS } from '../constants/game';
import { generateLevelId, draw3DBlock, calculateLevelHp } from '../utils/helpers';
import { soundManager } from '../utils/audio';

const DESIGNER_CANVAS_WIDTH = CANVAS_WIDTH; // 1152
const DESIGNER_CANVAS_HEIGHT = GRID_COLS * (128 * 0.75); // 1056 (11 rows * 96px)

import {
  Play,
  Save,
  ArrowLeft,
  Undo2,
  Redo2,
  Lock,
  Globe,
  Trash2,
  FlipHorizontal,
  Check,
  X,
  HelpCircle,
  Move,
  Info,
} from 'lucide-react';

const STANDARD_TOOLS = [1, 2, 3, 4, 5];
const SPECIAL_TOOLS = [
  { id: 6, label: 'TITANIUM', shortLabel: 'TITANIUM', color: '#94a3b8' },
  { id: 7, label: 'PORTAL', shortLabel: 'PORTAL', color: '#00f7ff' },
  { id: 8, label: 'DETONATOR', shortLabel: 'BLAST', color: '#ffaa00' },
  { id: 0, label: 'ERASER', shortLabel: 'ERASER', color: '#ff0055' },
];

const PORTAL_COLORS: Record<number, { border: string; bg: string; text: string }> = {
  1: { border: '#00f7ff', bg: 'rgba(0, 247, 255, 0.25)', text: '#00f7ff' },
  2: { border: '#e879f9', bg: 'rgba(232, 121, 249, 0.25)', text: '#e879f9' },
  3: { border: '#4ade80', bg: 'rgba(74, 222, 128, 0.25)', text: '#4ade80' },
  4: { border: '#facc15', bg: 'rgba(250, 204, 21, 0.25)', text: '#facc15' },
};

interface GridCell {
  h: number;
  portalPairId?: number;
}

interface PendingPortalState {
  x: number;
  y: number;
  pairId: number;
}

interface DesignerSnapshot {
  grid: GridCell[][];
  pendingPortal: PendingPortalState | null;
}

interface HistoryStack {
  past: DesignerSnapshot[];
  present: DesignerSnapshot;
  future: DesignerSnapshot[];
}

const createEmptyGrid = (): GridCell[][] =>
  Array.from({ length: GRID_COLS }, () =>
    Array.from({ length: GRID_ROWS }, () => ({ h: 0 }))
  );

/**
 * Compact Palette Block Canvas:
 * Renders the EXACT 3D physical in-game block with bevels, bolts, numbers, portal iris, or eraser
 */
const PaletteBlockCanvas: React.FC<{
  toolId: number;
  isSelected: boolean;
}> = ({ toolId, isSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (toolId === 0) {
      // Sleek Cyber Eraser Tile
      const w = canvas.width;
      const h = canvas.height;
      const pad = 2;

      ctx.fillStyle = isSelected ? '#2a0614' : '#14040c';
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.fill();

      // Subtle diagonal red hazard stripes
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.clip();
      ctx.strokeStyle = isSelected ? 'rgba(255, 0, 85, 0.35)' : 'rgba(255, 0, 85, 0.15)';
      ctx.lineWidth = 2;
      for (let x = -h; x < w + h; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = isSelected ? '#ff0055' : 'rgba(255, 0, 85, 0.4)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.stroke();

      // Crossed laser beams
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const cx = w / 2;
      const cy = h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 6);
      ctx.lineTo(cx + 8, cy + 6);
      ctx.moveTo(cx + 8, cy - 6);
      ctx.lineTo(cx - 8, cy + 6);
      ctx.stroke();
    } else {
      // Exact in-game 3D Armored Slab block
      const padX = 3;
      const padY = 2;
      draw3DBlock(
        ctx,
        padX,
        padY,
        canvas.width - padX * 2,
        canvas.height - padY * 2,
        toolId,
        1.0,
        undefined,
        undefined,
        undefined,
        toolId === 7 ? 1 : undefined
      );
    }
  }, [toolId, isSelected]);

  return (
    <canvas
      ref={canvasRef}
      width={88}
      height={48}
      className="w-full h-full object-contain block pointer-events-none"
    />
  );
};

/**
 * Real 3D In-Game Block Preview for Information Guide
 */
const BlockIconPreview: React.FC<{
  toolId: number;
  pairId?: number;
  width?: number;
  height?: number;
}> = ({ toolId, pairId, width = 54, height = 28 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (toolId === 0) {
      // Sleek Cyber Eraser Tile
      const w = canvas.width;
      const h = canvas.height;
      const pad = 2;

      ctx.fillStyle = '#1e0510';
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.fill();

      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.stroke();

      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const cx = w / 2;
      const cy = h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 6);
      ctx.lineTo(cx + 7, cy + 6);
      ctx.moveTo(cx + 7, cy - 6);
      ctx.lineTo(cx - 7, cy + 6);
      ctx.stroke();
    } else {
      draw3DBlock(
        ctx,
        2,
        2,
        canvas.width - 4,
        canvas.height - 4,
        toolId,
        1.0,
        undefined,
        undefined,
        undefined,
        pairId ?? (toolId === 7 ? 1 : undefined)
      );
    }
  }, [toolId, pairId]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="inline-block shrink-0 shadow-md rounded"
    />
  );
};

// Detect Mac vs Windows/Linux and touch input capabilities
const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const isTouchDevice =
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export const LevelDesigner: React.FC = () => {
  const { setScreen, saveUserLevel, startPlayLevel, user, showAlert } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const savePreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  const isTouchInputRef = useRef(isTouchDevice);

  const [selectedTool, setSelectedTool] = useState<number>(1);
  const selectedToolRef = useRef(1);

  // Canonical history stack
  const [historyState, setHistoryState] = useState<HistoryStack>(() => ({
    past: [],
    present: {
      grid: createEmptyGrid(),
      pendingPortal: null,
    },
    future: [],
  }));

  // Safe fallback state extraction
  const present = historyState?.present ?? {
    grid: createEmptyGrid(),
    pendingPortal: null,
  };
  const grid = present.grid;
  const pendingPortal = present.pendingPortal;

  // Drag stroke state
  const isMouseDownRef = useRef(false);
  const strokeStartSnapshotRef = useRef<DesignerSnapshot | null>(null);
  const strokeModifiedRef = useRef(false);

  // Canvas hover position
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  // Portal Dragging State
  const [draggedPortal, setDraggedPortal] = useState<{
    fromX: number;
    fromY: number;
    pairId: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const draggedPortalRef = useRef<{
    fromX: number;
    fromY: number;
    pairId: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const isDraggingPortalRef = useRef(false);

  // Info Guide Modal state
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Save Modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [levelName, setLevelName] = useState(`Matrix #${Math.floor(100 + Math.random() * 900)}`);
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  const canUndo = (historyState?.past?.length ?? 0) > 0;
  const canRedo = (historyState?.future?.length ?? 0) > 0;

  // ── UNDO / REDO ──────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    setHistoryState((curr) => {
      if (!curr || curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      soundManager.playClick();
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((curr) => {
      if (!curr || curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      soundManager.playClick();
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  // Keyboard shortcuts (Mac ⌘ & Windows/Linux Ctrl)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isModifier = e.metaKey || e.ctrlKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code;

      // 1. UNDO: Command+Z (Mac) or Ctrl+Z (Windows/Linux)
      if (isModifier && (key === 'z' || code === 'KeyZ')) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // 2. REDO: Command+Y / Command+Shift+Z (Mac) or Ctrl+Y / Ctrl+Shift+Z (Windows/Linux)
      if (isModifier && (key === 'y' || code === 'KeyY')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // 3. Block selection shortcuts (without modifier)
      if (!isModifier) {
        if (e.key >= '1' && e.key <= '5') {
          selectTool(parseInt(e.key, 10));
        } else if (e.key === '6') {
          selectTool(6);
        } else if (key === '7' || key === 'p') {
          selectTool(7);
        } else if (key === '8' || key === 'b') {
          selectTool(8);
        } else if (key === '0' || key === 'x' || key === 'e') {
          selectTool(0);
        } else if (key === 'm') {
          handleMirrorHorizontal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Find lowest available portal pair ID (1 to 4)
  const getNextAvailablePairId = (currentGrid: GridCell[][]): number | null => {
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
  };

  // Switch tool — auto-removes any unpaired portal silently
  const selectTool = (toolId: number) => {
    if (selectedToolRef.current === 7 && toolId !== 7 && present.pendingPortal) {
      const p = present.pendingPortal;
      const cleanGrid = present.grid.map((row, rIdx) =>
        row.map((cell, cIdx) => (rIdx === p.y && cIdx === p.x ? { h: 0 } : cell))
      );
      setHistoryState((curr) => ({
        past: [...curr.past, curr.present].slice(-40),
        present: { grid: cleanGrid, pendingPortal: null },
        future: [],
      }));
    }
    setSelectedTool(toolId);
    selectedToolRef.current = toolId;
    soundManager.playClick();
  };

  // ── CELL ACTION LOGIC (No intrusive modal alerts during placement) ─────────
  const applyToolAt = useCallback(
    (gridX: number, gridY: number) => {
      if (gridX < 0 || gridX >= GRID_ROWS || gridY < 0 || gridY >= GRID_COLS) return;
      const tool = selectedToolRef.current;

      setHistoryState((curr) => {
        if (!curr) return curr;
        const currentGrid = curr.present.grid;
        const currentPending = curr.present.pendingPortal;
        const currentCell = currentGrid[gridY][gridX];

        // ── 1. PORTAL TOOL (Tool 7) ──────────────────────────────────────────
        if (tool === 7) {
          // If tapped cell is already a portal, dragging is handled by pointerDown
          if (currentCell.h === 7) return curr;

          // Automatically spawn a complete linked portal pair
          const nextPairId = getNextAvailablePairId(currentGrid);
          if (nextPairId === null) {
            return curr;
          }

          // Find adjacent or nearest empty slot for Portal 2
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

          const nextGrid = currentGrid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              if (rIdx === gridY && cIdx === gridX) {
                return { h: 7, portalPairId: nextPairId };
              }
              if (rIdx === p2y && cIdx === p2x) {
                return { h: 7, portalPairId: nextPairId };
              }
              return cell;
            })
          );
          soundManager.playClick();

          // Immediately arm Portal 2 for drag so user can reposition it on the matrix
          draggedPortalRef.current = {
            fromX: p2x,
            fromY: p2y,
            pairId: nextPairId,
            currentX: p2x,
            currentY: p2y,
          };
          setDraggedPortal({
            fromX: p2x,
            fromY: p2y,
            pairId: nextPairId,
            currentX: p2x,
            currentY: p2y,
          });
          isDraggingPortalRef.current = true;

          return {
            past: [...curr.past, curr.present].slice(-50),
            present: { grid: nextGrid, pendingPortal: null },
            future: [],
          };
        }

        // ── 2. ERASER TOOL (Tool 0) ──────────────────────────────────────────
        if (tool === 0) {
          if (currentCell.h === 0) return curr;

          // If erasing the pending portal
          if (currentPending && currentPending.x === gridX && currentPending.y === gridY) {
            const nextGrid = currentGrid.map((row, rIdx) =>
              row.map((cell, cIdx) => (rIdx === gridY && cIdx === gridX ? { h: 0 } : cell))
            );
            soundManager.playClick();
            return {
              ...curr,
              present: { grid: nextGrid, pendingPortal: null },
            };
          }

          // If erasing a portal that is part of a complete pair -> erase BOTH portals in that pair
          if (currentCell.h === 7 && currentCell.portalPairId !== undefined) {
            const targetPairId = currentCell.portalPairId;
            const nextGrid = currentGrid.map((row) =>
              row.map((cell) =>
                cell.h === 7 && cell.portalPairId === targetPairId ? { h: 0 } : cell
              )
            );
            soundManager.playClick();
            strokeModifiedRef.current = true;
            return {
              ...curr,
              present: { grid: nextGrid, pendingPortal: null },
            };
          }

          // Standard block erase
          const nextGrid = currentGrid.map((row, rIdx) =>
            row.map((cell, cIdx) => (rIdx === gridY && cIdx === gridX ? { h: 0 } : cell))
          );
          soundManager.playClick();
          strokeModifiedRef.current = true;
          return {
            ...curr,
            present: { ...curr.present, grid: nextGrid },
          };
        }

        // ── 3. STANDARD & SPECIAL BLOCKS (1-5, 6, 8) ─────────────────────────
        if (currentCell.h === tool) return curr;

        // If placing over an existing portal with a pair, erase its partner too
        const nextGrid = currentGrid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            if (rIdx === gridY && cIdx === gridX) {
              return { h: tool };
            }
            if (
              currentCell.h === 7 &&
              currentCell.portalPairId !== undefined &&
              cell.h === 7 &&
              cell.portalPairId === currentCell.portalPairId
            ) {
              return { h: 0 };
            }
            return cell;
          })
        );

        let nextPending = currentPending;
        if (currentPending) {
          nextGrid[currentPending.y][currentPending.x] = { h: 0 };
          nextPending = null;
        }

        soundManager.playClick();
        strokeModifiedRef.current = true;
        return {
          ...curr,
          present: { grid: nextGrid, pendingPortal: nextPending },
        };
      });
    },
    []
  );

  // Active placed blocks
  const placedBlocks: BlockData[] = [];
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.h > 0) {
        placedBlocks.push({
          x,
          y,
          h: cell.h,
          ...(cell.portalPairId !== undefined ? { portalPairId: cell.portalPairId } : {}),
        });
      }
    });
  });

  const stats = calculateLevelHp(placedBlocks);
  const breakableCount = stats.breakableCount;

  // Active portal pairs
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

  // Validation function
  const validateLevel = (): { valid: boolean; error?: string } => {
    if (breakableCount === 0) {
      return {
        valid: false,
        error: 'Add at least one breakable core (HP 1-5 or Detonator Core) to the arena.',
      };
    }
    if (pendingPortal) {
      return {
        valid: false,
        error: `Portal Pair ${pendingPortal.pairId} is incomplete! Place its matching partner or remove it before proceeding.`,
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
  };

  // Clear Matrix (with undo support)
  const handleClearMatrix = () => {
    if (placedBlocks.length === 0) return;
    showAlert({
      title: 'CLEAR ARENA MATRIX',
      message: 'Are you sure you want to erase all placed blocks and portals?',
      btn1Text: 'CANCEL',
      btn2Text: 'CLEAR ALL',
      btn2Color: '#ff0055',
      onConfirm: () => {
        setHistoryState((curr) => ({
          past: [...curr.past, curr.present].slice(-40),
          present: { grid: createEmptyGrid(), pendingPortal: null },
          future: [],
        }));
        soundManager.playClick();
      },
    });
  };

  // Horizontal Mirror (with undo support)
  const handleMirrorHorizontal = () => {
    if (placedBlocks.length === 0) return;

    setHistoryState((curr) => {
      const currentGrid = curr.present.grid;
      const nextGrid = currentGrid.map((row) => {
        const newRow = row.map((c) => ({ ...c }));
        for (let x = 0; x < 4; x++) {
          const mirrorX = 8 - x;
          const leftCell = newRow[x];
          newRow[mirrorX] = { ...leftCell };
        }
        return newRow;
      });
      soundManager.playClick();
      return {
        past: [...curr.past, curr.present].slice(-40),
        present: { grid: nextGrid, pendingPortal: null },
        future: [],
      };
    });
  };

  // Test Level
  const handleTestLevel = () => {
    const val = validateLevel();
    if (!val.valid) {
      showAlert({
        title: 'VALIDATION ERROR',
        message: val.error || 'Matrix is incomplete.',
        btn1Text: 'OKAY',
        singleBtn: true,
      });
      return;
    }
    startPlayLevel({
      id: 'TEST',
      name: levelName || 'Custom Test Level',
      creator: user.username,
      playCount: 0,
      blocks: placedBlocks,
    });
  };

  // Open Save Modal
  const handleOpenSaveModal = () => {
    const val = validateLevel();
    if (!val.valid) {
      showAlert({
        title: 'CANNOT SAVE ARENA',
        message: val.error || 'Please fix errors before saving.',
        btn1Text: 'OKAY',
        singleBtn: true,
      });
      return;
    }
    setShowSaveModal(true);
  };

  // Confirm Save Level
  const handleConfirmSave = () => {
    const trimmedName = levelName.trim() || `Matrix #${Math.floor(100 + Math.random() * 900)}`;
    saveUserLevel({
      id: generateLevelId(),
      name: trimmedName,
      creator: user.username,
      playCount: 0,
      blocks: placedBlocks,
      isPublic: !isPrivate,
      createdAt: Date.now(),
    });
    setShowSaveModal(false);
    setScreen('menu');
  };

  const handleClose = () => {
    if (placedBlocks.length > 0) {
      showAlert({
        title: 'EXIT LEVEL STUDIO',
        message: 'Are you sure you want to exit? Any unsaved edits will be discarded.',
        btn1Text: 'CANCEL',
        btn2Text: 'DISCARD & EXIT',
        btn2Color: '#ff0844',
        onConfirm: () => setScreen('menu'),
      });
    } else {
      setScreen('menu');
    }
  };

  // ── CANVAS DRAWING ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030514';
    ctx.fillRect(0, 0, DESIGNER_CANVAS_WIDTH, DESIGNER_CANVAS_HEIGHT);

    const cellW = DESIGNER_CANVAS_WIDTH / GRID_ROWS;
    const cellH = DESIGNER_CANVAS_HEIGHT / GRID_COLS;
    const padding = Math.max(1, cellW * 0.05);

    // Subtle Gridlines
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= GRID_COLS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(DESIGNER_CANVAS_WIDTH, r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= GRID_ROWS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, DESIGNER_CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Playfield matrix bounding line
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, DESIGNER_CANVAS_WIDTH - 4, DESIGNER_CANVAS_HEIGHT - 4);

    // Draw connecting dashed lines between complete portal pairs
    activePairs.forEach((pair) => {
      if (pair.blocks.length === 2) {
        let p1 = { ...pair.blocks[0] };
        let p2 = { ...pair.blocks[1] };

        // If one of these portals is being dragged, update line to current drag position
        if (draggedPortal && draggedPortal.pairId === pair.pairId) {
          if (draggedPortal.fromX === p1.x && draggedPortal.fromY === p1.y) {
            p1 = { x: draggedPortal.currentX, y: draggedPortal.currentY };
          } else if (draggedPortal.fromX === p2.x && draggedPortal.fromY === p2.y) {
            p2 = { x: draggedPortal.currentX, y: draggedPortal.currentY };
          }
        }

        const p1x = p1.x * cellW + cellW / 2;
        const p1y = p1.y * cellH + cellH / 2;
        const p2x = p2.x * cellW + cellW / 2;
        const p2y = p2.y * cellH + cellH / 2;

        const colorCfg = PORTAL_COLORS[pair.pairId] || PORTAL_COLORS[1];
        ctx.save();
        ctx.strokeStyle = colorCfg.border;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([10, 8]);
        ctx.shadowColor = colorCfg.border;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Render placed blocks
    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.h <= 0) return;
        const bx = x * cellW + padding;
        const by = y * cellH + padding;
        const bw = cellW - padding * 2;
        const bh = cellH - padding * 2;

        // If this portal is currently being dragged, draw ghost at source
        const isBeingDragged = draggedPortal && draggedPortal.fromX === x && draggedPortal.fromY === y;
        const alpha = isBeingDragged ? 0.3 : 1.0;

        draw3DBlock(ctx, bx, by, bw, bh, cell.h, alpha, undefined, undefined, undefined, cell.portalPairId);
      });
    });

    // Render actively dragged portal following cursor
    if (draggedPortal) {
      const bx = draggedPortal.currentX * cellW + padding;
      const by = draggedPortal.currentY * cellH + padding;
      const bw = cellW - padding * 2;
      const bh = cellH - padding * 2;

      ctx.save();
      // Drop Shadow & Glow
      ctx.shadowColor = PORTAL_COLORS[draggedPortal.pairId]?.border || '#00f7ff';
      ctx.shadowBlur = 18;
      draw3DBlock(ctx, bx, by, bw, bh, 7, 1.0, undefined, undefined, undefined, draggedPortal.pairId);

      // Glowing active drag border
      ctx.strokeStyle = PORTAL_COLORS[draggedPortal.pairId]?.border || '#00f7ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bx - 3, by - 3, bw + 6, bh + 6);

      // HUD Telemetry label
      ctx.font = '900 13px monospace';
      ctx.fillStyle = PORTAL_COLORS[draggedPortal.pairId]?.border || '#00f7ff';
      ctx.textAlign = 'center';
      ctx.fillText(`MOVE GATE #${draggedPortal.pairId}`, bx + bw / 2, by + bh + 18);
      ctx.restore();
    }

    // Render interactive hover preview cursor ONLY when on desktop with a mouse (NOT on touch devices)
    if (!isTouchInputRef.current && !isTouchDevice && !draggedPortal && hoverPos && hoverPos.y < GRID_COLS) {
      const bx = hoverPos.x * cellW + padding;
      const by = hoverPos.y * cellH + padding;
      const bw = cellW - padding * 2;
      const bh = cellH - padding * 2;

      ctx.save();
      if (selectedTool === 0) {
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
        ctx.fillRect(bx, by, bw, bh);
      } else {
        draw3DBlock(ctx, bx, by, bw, bh, selectedTool, 0.55, undefined, undefined, undefined, undefined);
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bx, by, bw, bh);
      }
      ctx.restore();
    }
  }, [grid, hoverPos, selectedTool, pendingPortal, activePairs, draggedPortal]);

  // Mini Preview for Save Dialog
  useEffect(() => {
    if (!showSaveModal || !savePreviewCanvasRef.current) return;
    const canvas = savePreviewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#050716';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellW = canvas.width / GRID_ROWS;
    const cellH = canvas.height / GRID_COLS;
    const pad = 1.5;

    activePairs.forEach((pair) => {
      if (pair.blocks.length === 2) {
        const p1 = pair.blocks[0];
        const p2 = pair.blocks[1];
        ctx.strokeStyle = PORTAL_COLORS[pair.pairId]?.border || '#00f7ff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(p1.x * cellW + cellW / 2, p1.y * cellH + cellH / 2);
        ctx.lineTo(p2.x * cellW + cellW / 2, p2.y * cellH + cellH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    grid.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.h <= 0) return;
        draw3DBlock(
          ctx,
          x * cellW + pad,
          y * cellH + pad,
          cellW - pad * 2,
          cellH - pad * 2,
          cell.h,
          1.0,
          undefined,
          undefined,
          undefined,
          cell.portalPairId
        );
      });
    });
  }, [showSaveModal, grid, activePairs]);

  // Screen client coordinates to grid cell calculator
  const getCanvasCoordsFromPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const scale = Math.min(rect.width / DESIGNER_CANVAS_WIDTH, rect.height / DESIGNER_CANVAS_HEIGHT);
    const renderedW = DESIGNER_CANVAS_WIDTH * scale;
    const renderedH = DESIGNER_CANVAS_HEIGHT * scale;
    const offsetX = (rect.width - renderedW) / 2;
    const offsetY = (rect.height - renderedH) / 2;

    const relX = clientX - rect.left - offsetX;
    const relY = clientY - rect.top - offsetY;
    if (relX < 0 || relX >= renderedW || relY < 0 || relY >= renderedH) return null;

    const canvasX = relX / scale;
    const canvasY = relY / scale;
    const gridX = Math.floor(canvasX / (DESIGNER_CANVAS_WIDTH / GRID_ROWS));
    const gridY = Math.floor(canvasY / (DESIGNER_CANVAS_HEIGHT / GRID_COLS));
    if (gridX < 0 || gridX >= GRID_ROWS || gridY < 0 || gridY >= GRID_COLS) return null;

    return { gridX, gridY };
  }, []);

  const commitPortalMove = useCallback((fromX: number, fromY: number, pairId: number, currentX: number, currentY: number) => {
    if ((currentX !== fromX || currentY !== fromY) && currentX >= 0 && currentX < GRID_ROWS && currentY >= 0 && currentY < GRID_COLS) {
      setHistoryState((curr) => {
        const currentGrid = curr.present.grid;
        const targetCell = currentGrid[currentY][currentX];
        if (targetCell.h === 7 && targetCell.portalPairId === pairId) return curr;

        const nextGrid = currentGrid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            if (rIdx === currentY && cIdx === currentX) {
              return { h: 7, portalPairId: pairId };
            }
            if (rIdx === fromY && cIdx === fromX) {
              return targetCell.h > 0 && targetCell.h !== 7 ? { ...targetCell } : { h: 0 };
            }
            return cell;
          })
        );
        soundManager.playClick();
        return {
          past: [...curr.past, curr.present].slice(-50),
          present: { grid: nextGrid, pendingPortal: null },
          future: [],
        };
      });
    }
  }, []);

  const commitStroke = useCallback(() => {
    if (strokeModifiedRef.current && strokeStartSnapshotRef.current) {
      setHistoryState((curr) => ({
        past: [...curr.past, strokeStartSnapshotRef.current!].slice(-50),
        present: curr.present,
        future: [],
      }));
      strokeModifiedRef.current = false;
      strokeStartSnapshotRef.current = null;
    }
  }, []);

  // ── MOUSE EVENT HANDLERS (Desktop with Hover Preview) ─────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isTouchInputRef.current = false;
    isMouseDownRef.current = true;
    strokeStartSnapshotRef.current = present;
    strokeModifiedRef.current = false;

    const coords = getCanvasCoordsFromPoint(e.clientX, e.clientY);
    if (!coords) return;

    const cell = grid[coords.gridY][coords.gridX];
    if (cell.h === 7 && cell.portalPairId !== undefined) {
      if (selectedToolRef.current === 0) {
        applyToolAt(coords.gridX, coords.gridY);
        return;
      }
      draggedPortalRef.current = {
        fromX: coords.gridX,
        fromY: coords.gridY,
        pairId: cell.portalPairId,
        currentX: coords.gridX,
        currentY: coords.gridY,
      };
      setDraggedPortal({ ...draggedPortalRef.current });
      isDraggingPortalRef.current = true;
      soundManager.playClick();
      return;
    }

    applyToolAt(coords.gridX, coords.gridY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isTouchInputRef.current = false;
    const coords = getCanvasCoordsFromPoint(e.clientX, e.clientY);
    if (!coords) {
      setHoverPos(null);
      return;
    }

    setHoverPos({ x: coords.gridX, y: coords.gridY });

    if (isDraggingPortalRef.current && draggedPortalRef.current) {
      if (coords.gridX !== draggedPortalRef.current.currentX || coords.gridY !== draggedPortalRef.current.currentY) {
        draggedPortalRef.current = {
          ...draggedPortalRef.current,
          currentX: coords.gridX,
          currentY: coords.gridY,
        };
        setDraggedPortal({ ...draggedPortalRef.current });
      }
      return;
    }

    if (isMouseDownRef.current && selectedToolRef.current !== 7) {
      applyToolAt(coords.gridX, coords.gridY);
    }
  };

  const handleMouseUp = () => {
    if (isDraggingPortalRef.current && draggedPortalRef.current) {
      const { fromX, fromY, pairId, currentX, currentY } = draggedPortalRef.current;
      isDraggingPortalRef.current = false;
      draggedPortalRef.current = null;
      setDraggedPortal(null);
      isMouseDownRef.current = false;
      commitPortalMove(fromX, fromY, pairId, currentX, currentY);
      return;
    }

    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      commitStroke();
    }
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
    handleMouseUp();
  };

  // ── TOUCH EVENT HANDLERS (Touch Devices: touchstart, touchmove, touchend) ──
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    isTouchInputRef.current = true;
    setHoverPos(null); // Explicitly disable hover highlight on touch
    isMouseDownRef.current = true;
    strokeStartSnapshotRef.current = present;
    strokeModifiedRef.current = false;

    const touch = e.touches[0];
    if (!touch) return;
    const coords = getCanvasCoordsFromPoint(touch.clientX, touch.clientY);
    if (!coords) return;

    const cell = grid[coords.gridY][coords.gridX];
    if (cell.h === 7 && cell.portalPairId !== undefined) {
      if (selectedToolRef.current === 0) {
        applyToolAt(coords.gridX, coords.gridY);
        return;
      }
      draggedPortalRef.current = {
        fromX: coords.gridX,
        fromY: coords.gridY,
        pairId: cell.portalPairId,
        currentX: coords.gridX,
        currentY: coords.gridY,
      };
      setDraggedPortal({ ...draggedPortalRef.current });
      isDraggingPortalRef.current = true;
      soundManager.playClick();
      return;
    }

    applyToolAt(coords.gridX, coords.gridY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    isTouchInputRef.current = true;
    setHoverPos(null);

    if (!isMouseDownRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const coords = getCanvasCoordsFromPoint(touch.clientX, touch.clientY);
    if (!coords) return;

    if (isDraggingPortalRef.current && draggedPortalRef.current) {
      if (coords.gridX !== draggedPortalRef.current.currentX || coords.gridY !== draggedPortalRef.current.currentY) {
        draggedPortalRef.current = {
          ...draggedPortalRef.current,
          currentX: coords.gridX,
          currentY: coords.gridY,
        };
        setDraggedPortal({ ...draggedPortalRef.current });
      }
      return;
    }

    if (selectedToolRef.current !== 7) {
      applyToolAt(coords.gridX, coords.gridY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    isTouchInputRef.current = true;
    setHoverPos(null);
    handleMouseUp();
  };

  const handleTouchCancel = () => {
    setHoverPos(null);
    isDraggingPortalRef.current = false;
    draggedPortalRef.current = null;
    setDraggedPortal(null);
    isMouseDownRef.current = false;
  };

  return (
    <div
      id="levelDesigner"
      className="active relative w-full h-full flex flex-col bg-[#02030a] overflow-hidden select-none"
    >
      {/* ── CLEAN, COMPACT TOP PALETTE (REAL 3D BLOCKS) ───────────────────── */}
      <div className="w-full px-2 py-1.5 flex flex-col gap-1.5 z-20 shadow-xl bg-[#06091c]/98 border-b border-cyan-500/25">
        {/* Compact Header: Title, Undo, Redo, Mirror, Clear, Info, Brick Count */}
        <div className="flex items-center justify-between">
          <span className="font-display font-black text-xs tracking-wider text-[#00f7ff] [text-shadow:0_0_8px_rgba(0,247,255,0.4)]">
            MATRIX FORGE
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              title={isTouchDevice ? 'Undo' : isMac ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
              className="w-6 h-6 rounded-md flex items-center justify-center text-cyan-300 hover:text-white bg-[#080c22] border border-cyan-500/35 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              title={isTouchDevice ? 'Redo' : isMac ? 'Redo (⌘⇧Z / ⌘Y)' : 'Redo (Ctrl+Y)'}
              className="w-6 h-6 rounded-md flex items-center justify-center text-cyan-300 hover:text-white bg-[#080c22] border border-cyan-500/35 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Redo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleMirrorHorizontal}
              title={isTouchDevice ? 'Mirror Horizontally' : 'Mirror Horizontally (M)'}
              className="w-6 h-6 rounded-md flex items-center justify-center text-purple-300 hover:text-white bg-[#130d2e] border border-purple-500/40 active:scale-95 transition-all cursor-pointer"
            >
              <FlipHorizontal className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleClearMatrix}
              title={isTouchDevice ? 'Clear Arena' : 'Clear Arena (C)'}
              className="w-6 h-6 rounded-md flex items-center justify-center text-rose-400 hover:text-white bg-[#220713] border border-rose-500/40 active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <span className="font-tech text-[9px] text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 ml-0.5">
              {placedBlocks.length} BRICKS
            </span>
          </div>
        </div>

        {/* ── ROW 1: STANDARD CORES (HP 1 - 5) ── */}
        <div className="grid grid-cols-5 gap-1">
          {STANDARD_TOOLS.map((hp) => {
            const isSelected = selectedTool === hp;
            return (
              <button
                key={hp}
                type="button"
                data-tool-id={hp}
                onClick={() => selectTool(hp)}
                style={{
                  backgroundColor: isSelected ? 'rgba(0, 247, 255, 0.18)' : 'rgba(8, 13, 36, 0.9)',
                  border: isSelected ? '2px solid #00f7ff' : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isSelected
                    ? '0 0 12px rgba(0, 247, 255, 0.5), inset 0 0 4px rgba(0, 247, 255, 0.25)'
                    : 'none',
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}
                className="flex flex-col items-center justify-center rounded-lg p-0.5 transition-all cursor-pointer h-10 relative"
              >
                <div className="w-full h-5 relative flex items-center justify-center">
                  <PaletteBlockCanvas toolId={hp} isSelected={isSelected} />
                </div>
                <span
                  style={{ color: isSelected ? '#00f7ff' : '#94a3b8' }}
                  className="font-tech text-[8px] font-black uppercase tracking-wider"
                >
                  {hp}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── ROW 2: TACTICAL MATRIX (Titanium, Portal, Detonator, Eraser) ── */}
        <div className="grid grid-cols-4 gap-1">
          {SPECIAL_TOOLS.map((tool) => {
            const isSelected = selectedTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                data-tool-id={tool.id}
                onClick={() => selectTool(tool.id)}
                title={tool.label}
                style={{
                  backgroundColor: isSelected ? 'rgba(0, 247, 255, 0.18)' : 'rgba(8, 13, 36, 0.9)',
                  border: isSelected ? `2px solid ${tool.color}` : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isSelected
                    ? `0 0 12px ${tool.color}70, inset 0 0 4px ${tool.color}30`
                    : 'none',
                  transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                }}
                className="flex flex-col items-center justify-center rounded-lg p-0.5 transition-all cursor-pointer h-10 relative"
              >
                <div className="w-full h-5 relative flex items-center justify-center">
                  <PaletteBlockCanvas toolId={tool.id} isSelected={isSelected} />
                </div>
                <span
                  style={{ color: isSelected ? tool.color : '#94a3b8' }}
                  className="font-tech text-[8px] font-black uppercase tracking-wider truncate w-full text-center"
                >
                  {tool.shortLabel}
                </span>
                {tool.id === 7 && pendingPortal && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── INTERACTIVE CANVAS AREA (Grid Fills Available Space Without Dead Void) ── */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-1 sm:p-2">
        <canvas
          ref={canvasRef}
          id="mainCanvas"
          className="w-full h-full object-contain block cursor-crosshair touch-none shadow-[0_0_20px_rgba(0,247,255,0.15)] rounded-lg select-none"
          width={DESIGNER_CANVAS_WIDTH}
          height={DESIGNER_CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        />
      </div>

      {/* ── CLEAN, BALANCED BOTTOM BAR ─────────────────────────────────────── */}
      <div className="w-full px-3 py-2 flex items-center justify-between z-20 shadow-2xl bg-[#06091c]/95 border-t border-cyan-500/25">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs text-slate-300 hover:text-white bg-white/5 border border-white/15 cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            title="Studio Guide & Block Intel"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs text-cyan-300 hover:text-white bg-cyan-950/50 border border-cyan-500/40 cursor-pointer active:scale-95 transition-all shadow-[0_0_8px_rgba(0,247,255,0.2)]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>INFO</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestLevel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs text-white tracking-wider cursor-pointer active:scale-95 transition-all bg-emerald-600 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>TEST</span>
          </button>

          <button
            type="button"
            onClick={handleOpenSaveModal}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-display font-black text-xs text-black tracking-wider cursor-pointer active:scale-95 transition-all bg-cyan-400 border border-cyan-200 shadow-[0_0_12px_rgba(0,247,255,0.45)]"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SAVE</span>
          </button>
        </div>
      </div>

      {/* ── SAVE ARENA MODAL (Public/Private selection is ONLY here) ─────────── */}
      {showSaveModal && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-0 sm:p-4">
          <div
            style={{
              backgroundColor: 'rgba(9, 14, 38, 0.96)',
              border: '1.5px solid #00f7ff',
              boxShadow: '0 0 30px rgba(0, 247, 255, 0.4), inset 0 0 15px rgba(0, 247, 255, 0.1)',
            }}
            className="w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-slide-up"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/25 pb-3">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-black text-sm tracking-wider text-cyan-300">
                  SAVE ARENA MATRIX
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Arena Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
                ARENA DESIGNATION
              </label>
              <input
                type="text"
                value={levelName}
                maxLength={30}
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="Enter arena name..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030616] border border-cyan-500/40 text-cyan-200 font-tech font-bold text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,247,255,0.4)] transition-all"
              />
            </div>

            {/* Visual Mini Preview Canvas */}
            <div className="flex flex-col gap-1.5">
              <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
                TACTICAL MATRIX PREVIEW
              </label>
              <div className="w-full h-32 rounded-xl bg-[#020410] border border-cyan-500/25 flex items-center justify-center overflow-hidden relative">
                <canvas
                  ref={savePreviewCanvasRef}
                  width={270}
                  height={135}
                  className="w-full h-full object-contain block"
                />
              </div>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="grid grid-cols-2 gap-2 font-tech text-xs">
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col">
                <span className="text-slate-400 text-[10px]">TOTAL ENERGY HP</span>
                <span className="text-cyan-300 font-black text-sm">{stats.totalHp} HP</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col">
                <span className="text-slate-400 text-[10px]">TOTAL BLOCKS</span>
                <span className="text-cyan-300 font-black text-sm">{placedBlocks.length} Blocks</span>
              </div>
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col">
                <span className="text-slate-400 text-[10px]">QUANTUM PORTALS</span>
                <span className="text-purple-300 font-black text-sm">
                  {activePairs.length} Complete Pairs
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col">
                <span className="text-slate-400 text-[10px]">DETONATOR CORES</span>
                <span className="text-amber-300 font-black text-sm">
                  {placedBlocks.filter((b) => b.h === 8).length} Cores
                </span>
              </div>
            </div>

            {/* Network Visibility (ONLY shown here when saving) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
                NETWORK VISIBILITY
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  style={{
                    backgroundColor: isPrivate ? 'rgba(255, 170, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isPrivate ? '#ffa500' : 'rgba(255, 255, 255, 0.15)',
                    color: isPrivate ? '#ffd700' : '#94a3b8',
                  }}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl border font-tech font-bold text-xs transition-all cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>PRIVATE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  style={{
                    backgroundColor: !isPrivate ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: !isPrivate ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                    color: !isPrivate ? '#34d399' : '#94a3b8',
                  }}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl border font-tech font-bold text-xs transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>PUBLIC</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-cyan-500/25">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 font-display font-bold text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                style={{
                  backgroundColor: '#00f7ff',
                  boxShadow: '0 0 16px rgba(0, 247, 255, 0.5)',
                }}
                className="flex-1 py-2.5 rounded-xl font-display font-black text-xs text-black tracking-wider transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>SAVE ARENA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STUDIO MANUAL & BLOCK INTEL MODAL ────────────────────────────── */}
      {showInfoModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-5">
          <div
            style={{
              backgroundColor: 'rgba(7, 11, 28, 0.98)',
              border: '1.5px solid rgba(0, 247, 255, 0.45)',
              boxShadow: '0 0 35px rgba(0, 247, 255, 0.25), inset 0 0 20px rgba(0, 247, 255, 0.08)',
            }}
            className="w-full max-w-lg max-h-[90vh] rounded-2xl flex flex-col overflow-hidden text-slate-200"
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-[#0a1030] border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-[#00f7ff] tracking-wider">
                    STUDIO GUIDE
                  </h3>
                  <p className="font-tech text-[10px] text-cyan-300/70">
                    BLOCKS & EDITOR MANUAL
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs font-sans">
              {/* SECTION 1: BLOCKS GUIDE */}
              <div>
                <h4 className="font-display font-black text-xs text-cyan-300 tracking-wider uppercase mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
                  Blocks Guide
                </h4>
                <div className="space-y-2.5">
                  {/* Standard Blocks HP 1-5 */}
                  <div className="p-3 rounded-xl bg-[#0b1232] border border-cyan-500/25 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[1, 2, 3, 4, 5].map((hp) => (
                        <BlockIconPreview key={hp} toolId={hp} width={42} height={22} />
                      ))}
                      <span className="font-display font-black text-xs text-cyan-300 ml-1">
                        Standard Blocks (1 to 5 Hits)
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Break when hit by the ball. The number shows how many hits are needed to destroy the block (1 to 5). Breaking blocks awards points and can drop power-up items.
                    </p>
                  </div>

                  {/* Titanium Block */}
                  <div className="p-3 rounded-xl bg-[#0b1232] border border-slate-500/25 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <BlockIconPreview toolId={6} width={50} height={24} />
                      <span className="font-display font-black text-xs text-slate-200">
                        Titanium Block (Unbreakable)
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Indestructible metal block. Balls always bounce off it at full speed. Use this to create walls, deflection funnels, and bounce corridors.
                    </p>
                  </div>

                  {/* Portal Gate */}
                  <div className="p-3 rounded-xl bg-[#0b1232] border border-cyan-500/35 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <BlockIconPreview toolId={7} pairId={1} width={50} height={24} />
                      <span className="font-display font-black text-xs text-[#00f7ff]">
                        Portal Gate (Teleports Balls)
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Teleports the ball between two linked gates. Portals are always placed in matching pairs (1 to 4 pairs). When a ball enters one portal, it instantly emerges from its partner preserving speed and trajectory!
                    </p>
                    <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/35 text-[11px] text-cyan-200 flex items-center gap-1.5 mt-0.5">
                      <strong className="text-cyan-400 shrink-0">💡 Drag & Move:</strong>
                      <span>Touch and drag any placed portal to reposition entrance and exit anywhere on the grid!</span>
                    </div>
                  </div>

                  {/* Blast Detonator */}
                  <div className="p-3 rounded-xl bg-[#0b1232] border border-amber-500/35 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <BlockIconPreview toolId={8} width={50} height={24} />
                      <span className="font-display font-black text-xs text-amber-300">
                        Blast Detonator (Explosive Bomb)
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Explodes immediately on impact! Releases a shockwave dealing 2 damage to all nearby blocks in a radius. If another detonator is nearby, it triggers a chain explosion!
                    </p>
                  </div>

                  {/* Eraser */}
                  <div className="p-3 rounded-xl bg-[#0b1232] border border-rose-500/25 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <BlockIconPreview toolId={0} width={50} height={24} />
                      <span className="font-display font-black text-xs text-rose-400">
                        Eraser (Remove Blocks)
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Tap or drag across blocks to erase them from the matrix. Erasing either portal in a pair automatically removes its partner too.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: STUDIO TOOLS */}
              <div>
                <h4 className="font-display font-black text-xs text-cyan-300 tracking-wider uppercase mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
                  Editor Tools
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Undo & Redo</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      {isTouchDevice ? (
                        'Step backward or forward through your edits.'
                      ) : isMac ? (
                        <>
                          Step backward or forward through your edits. (Shortcuts:{' '}
                          <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                            ⌘Z
                          </kbd>{' '}
                          /{' '}
                          <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                            ⌘⇧Z
                          </kbd>{' '}
                          or{' '}
                          <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                            ⌘Y
                          </kbd>
                          )
                        </>
                      ) : (
                        <>
                          Step backward or forward through your edits. (Shortcuts:{' '}
                          <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                            Ctrl+Z
                          </kbd>{' '}
                          /{' '}
                          <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/20 text-cyan-300 text-[10px]">
                            Ctrl+Y
                          </kbd>
                          )
                        </>
                      )}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Horizontal Mirror</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Copies the left half of the grid over to the right half for instant symmetry.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Grid</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Erases all placed blocks so you can start a fresh design from scratch.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Play className="w-3.5 h-3.5 fill-emerald-400" />
                      <span>Test Level</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Play your level immediately with real paddle physics, ball speeds, and power-ups.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#080d26] border border-cyan-500/20 flex flex-col gap-0.5 sm:col-span-2">
                    <div className="flex items-center gap-1.5 text-[#00f7ff] font-bold">
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Arena</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Name your custom level and choose <strong>Private</strong> (only in your blueprints) or <strong>Public</strong> (shared with the community in Online Arena).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-[#0a1030] border-t border-cyan-500/20 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="px-6 py-2 rounded-xl font-display font-black text-xs bg-cyan-400 hover:bg-cyan-300 text-black cursor-pointer shadow-[0_0_12px_rgba(0,247,255,0.4)] transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>GOT IT</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
