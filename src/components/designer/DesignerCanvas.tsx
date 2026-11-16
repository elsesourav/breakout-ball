import React, { useRef, useEffect, useCallback } from 'react';
import { draw3DBlock } from '../../utils/helpers';
import { GRID_ROWS, GRID_COLS } from '../../constants/game';
import {
  DESIGNER_CANVAS_WIDTH,
  DESIGNER_CANVAS_HEIGHT,
  GridCell,
  PendingPortalState,
  PORTAL_COLORS,
  isTouchDevice,
} from './DesignerTypes';

interface DraggedPortalInfo {
  fromX: number;
  fromY: number;
  pairId: number;
  currentX: number;
  currentY: number;
}

interface DesignerCanvasProps {
  grid: GridCell[][];
  selectedTool: number;
  pendingPortal: PendingPortalState | null;
  activePairs: { pairId: number; blocks: { x: number; y: number }[] }[];
  draggedPortal: DraggedPortalInfo | null;
  hoverPos: { x: number; y: number } | null;
  onApplyToolAt: (gridX: number, gridY: number) => void;
  onCommitStroke: () => void;
  onStartDragPortal: (fromX: number, fromY: number, pairId: number) => void;
  onUpdateDragPortal: (currentX: number, currentY: number) => void;
  onCommitPortalMove: (fromX: number, fromY: number, pairId: number, currentX: number, currentY: number) => void;
  onSetHoverPos: (pos: { x: number; y: number } | null) => void;
  onStrokeStart: () => void;
}

export const DesignerCanvas: React.FC<DesignerCanvasProps> = ({
  grid,
  selectedTool,
  pendingPortal,
  activePairs,
  draggedPortal,
  hoverPos,
  onApplyToolAt,
  onCommitStroke,
  onStartDragPortal,
  onUpdateDragPortal,
  onCommitPortalMove,
  onSetHoverPos,
  onStrokeStart,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseDownRef = useRef(false);
  const isTouchInputRef = useRef(isTouchDevice);

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
      ctx.shadowColor = PORTAL_COLORS[draggedPortal.pairId]?.border || '#00f7ff';
      ctx.shadowBlur = 18;
      draw3DBlock(ctx, bx, by, bw, bh, 7, 1.0, undefined, undefined, undefined, draggedPortal.pairId);

      ctx.strokeStyle = PORTAL_COLORS[draggedPortal.pairId]?.border || '#00f7ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(bx - 3, by - 3, bw + 6, bh + 6);

      const pairName = PORTAL_COLORS[draggedPortal.pairId]?.name || 'PORTAL';
      ctx.font = '900 12px monospace';
      ctx.fillStyle = PORTAL_COLORS[draggedPortal.pairId]?.border || '#00f7ff';
      ctx.textAlign = 'center';
      ctx.fillText(`MOVE ${pairName} GATE`, bx + bw / 2, by + bh + 18);
      ctx.restore();
    }

    // Render interactive hover preview cursor ONLY when on desktop with a mouse
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

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isTouchInputRef.current = false;
    isMouseDownRef.current = true;
    onStrokeStart();

    const coords = getCanvasCoordsFromPoint(e.clientX, e.clientY);
    if (!coords) return;

    const cell = grid[coords.gridY][coords.gridX];
    if (cell.h === 7 && cell.portalPairId !== undefined) {
      if (selectedTool === 0) {
        onApplyToolAt(coords.gridX, coords.gridY);
        return;
      }
      onStartDragPortal(coords.gridX, coords.gridY, cell.portalPairId);
      return;
    }

    onApplyToolAt(coords.gridX, coords.gridY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isTouchInputRef.current = false;
    const coords = getCanvasCoordsFromPoint(e.clientX, e.clientY);
    if (!coords) {
      onSetHoverPos(null);
      return;
    }

    onSetHoverPos({ x: coords.gridX, y: coords.gridY });

    if (draggedPortal) {
      if (coords.gridX !== draggedPortal.currentX || coords.gridY !== draggedPortal.currentY) {
        onUpdateDragPortal(coords.gridX, coords.gridY);
      }
      return;
    }

    if (isMouseDownRef.current && selectedTool !== 7) {
      onApplyToolAt(coords.gridX, coords.gridY);
    }
  };

  const handleMouseUp = () => {
    if (draggedPortal) {
      const { fromX, fromY, pairId, currentX, currentY } = draggedPortal;
      isMouseDownRef.current = false;
      onCommitPortalMove(fromX, fromY, pairId, currentX, currentY);
      return;
    }

    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      onCommitStroke();
    }
  };

  const handleMouseLeave = () => {
    onSetHoverPos(null);
    handleMouseUp();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    isTouchInputRef.current = true;
    onSetHoverPos(null);
    isMouseDownRef.current = true;
    onStrokeStart();

    const touch = e.touches[0];
    if (!touch) return;
    const coords = getCanvasCoordsFromPoint(touch.clientX, touch.clientY);
    if (!coords) return;

    const cell = grid[coords.gridY][coords.gridX];
    if (cell.h === 7 && cell.portalPairId !== undefined) {
      if (selectedTool === 0) {
        onApplyToolAt(coords.gridX, coords.gridY);
        return;
      }
      onStartDragPortal(coords.gridX, coords.gridY, cell.portalPairId);
      return;
    }

    onApplyToolAt(coords.gridX, coords.gridY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    isTouchInputRef.current = true;
    onSetHoverPos(null);

    if (!isMouseDownRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const coords = getCanvasCoordsFromPoint(touch.clientX, touch.clientY);
    if (!coords) return;

    if (draggedPortal) {
      if (coords.gridX !== draggedPortal.currentX || coords.gridY !== draggedPortal.currentY) {
        onUpdateDragPortal(coords.gridX, coords.gridY);
      }
      return;
    }

    if (selectedTool !== 7) {
      onApplyToolAt(coords.gridX, coords.gridY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.cancelable) e.preventDefault();
    isTouchInputRef.current = true;
    onSetHoverPos(null);
    handleMouseUp();
  };

  const handleTouchCancel = () => {
    onSetHoverPos(null);
    isMouseDownRef.current = false;
  };

  return (
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
  );
};
