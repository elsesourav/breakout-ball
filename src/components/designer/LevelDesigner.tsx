import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { BlockData } from '../../types/game';
import { GRID_ROWS, GRID_COLS } from '../../constants/game';
import { generateLevelId, calculateLevelHp } from '../../utils/helpers';
import { soundManager } from '../../audio';
import {
  GridCell,
  HistoryStack,
  DesignerSnapshot,
  createEmptyGrid,
} from './DesignerTypes';
import {
  getNextAvailablePairId,
  findAdjacentPortalSlot,
  extractActivePairs,
  validateDesignerLevel,
} from './designerLogic';
import { DesignerHeader } from './DesignerHeader';
import { DesignerPalette } from './DesignerPalette';
import { DesignerCanvas } from './DesignerCanvas';
import { DesignerFooter } from './DesignerFooter';
import { DesignerSaveModal } from './DesignerSaveModal';
import { DesignerInfoModal } from './DesignerInfoModal';

export const LevelDesigner: React.FC = () => {
  const { setScreen, saveUserLevel, startPlayLevel, user, showAlert } = useGame();

  const [selectedTool, setSelectedTool] = useState<number>(1);
  const selectedToolRef = useRef(1);

  const [historyState, setHistoryState] = useState<HistoryStack>(() => ({
    past: [],
    present: {
      grid: createEmptyGrid(),
      pendingPortal: null,
    },
    future: [],
  }));

  const present = historyState?.present ?? {
    grid: createEmptyGrid(),
    pendingPortal: null,
  };
  const grid = present.grid;
  const pendingPortal = present.pendingPortal;

  const strokeStartSnapshotRef = useRef<DesignerSnapshot | null>(null);
  const strokeModifiedRef = useRef(false);

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const [draggedPortal, setDraggedPortal] = useState<{
    fromX: number;
    fromY: number;
    pairId: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [levelName, setLevelName] = useState(`Matrix #${Math.floor(100 + Math.random() * 900)}`);
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  const canUndo = (historyState?.past?.length ?? 0) > 0;
  const canRedo = (historyState?.future?.length ?? 0) > 0;

  const handleUndo = useCallback(() => {
    setHistoryState((curr) => {
      if (!curr || curr.past.length === 0) return curr;
      soundManager.playClick();
      return {
        past: curr.past.slice(0, curr.past.length - 1),
        present: curr.past[curr.past.length - 1],
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setHistoryState((curr) => {
      if (!curr || curr.future.length === 0) return curr;
      soundManager.playClick();
      return {
        past: [...curr.past, curr.present],
        present: curr.future[0],
        future: curr.future.slice(1),
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const isModifier = e.metaKey || e.ctrlKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code;

      if (isModifier && (key === 'z' || code === 'KeyZ')) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }

      if (isModifier && (key === 'y' || code === 'KeyY')) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (!isModifier) {
        if (e.key >= '1' && e.key <= '5') selectTool(parseInt(e.key, 10));
        else if (e.key === '6') selectTool(6);
        else if (key === '7' || key === 'p') selectTool(7);
        else if (key === '8' || key === 'b') selectTool(8);
        else if (key === '0' || key === 'x' || key === 'e') selectTool(0);
        else if (key === 'm') handleMirrorHorizontal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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

  const applyToolAt = useCallback(
    (gridX: number, gridY: number) => {
      if (gridX < 0 || gridX >= GRID_ROWS || gridY < 0 || gridY >= GRID_COLS) return;
      const tool = selectedToolRef.current;

      setHistoryState((curr) => {
        if (!curr) return curr;
        const currentGrid = curr.present.grid;
        const currentPending = curr.present.pendingPortal;
        const currentCell = currentGrid[gridY][gridX];

        if (tool === 7) {
          if (currentCell.h === 7) return curr;
          const nextPairId = getNextAvailablePairId(currentGrid);
          if (nextPairId === null) return curr;

          const { p2x, p2y } = findAdjacentPortalSlot(currentGrid, gridX, gridY);

          const nextGrid = currentGrid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              if (rIdx === gridY && cIdx === gridX) return { h: 7, portalPairId: nextPairId };
              if (rIdx === p2y && cIdx === p2x) return { h: 7, portalPairId: nextPairId };
              return cell;
            })
          );
          soundManager.playClick();

          setDraggedPortal({
            fromX: p2x,
            fromY: p2y,
            pairId: nextPairId,
            currentX: p2x,
            currentY: p2y,
          });

          return {
            past: [...curr.past, curr.present].slice(-50),
            present: { grid: nextGrid, pendingPortal: null },
            future: [],
          };
        }

        if (tool === 0) {
          if (currentCell.h === 0) return curr;

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

        if (currentCell.h === tool) return curr;

        const nextGrid = currentGrid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            if (rIdx === gridY && cIdx === gridX) return { h: tool };
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
  const activePairs = extractActivePairs(grid);

  const validateLevel = () => validateDesignerLevel(stats.breakableCount, pendingPortal, activePairs);

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

  const handleMirrorHorizontal = () => {
    if (placedBlocks.length === 0) return;
    setHistoryState((curr) => {
      const currentGrid = curr.present.grid;
      const nextGrid = currentGrid.map((row) => {
        const newRow = row.map((c) => ({ ...c }));
        for (let x = 0; x < 4; x++) {
          newRow[8 - x] = { ...newRow[x] };
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

  const commitPortalMove = useCallback((fromX: number, fromY: number, pairId: number, currentX: number, currentY: number) => {
    setDraggedPortal(null);
    if ((currentX !== fromX || currentY !== fromY) && currentX >= 0 && currentX < GRID_ROWS && currentY >= 0 && currentY < GRID_COLS) {
      setHistoryState((curr) => {
        const currentGrid = curr.present.grid;
        const targetCell = currentGrid[currentY][currentX];
        if (targetCell.h === 7 && targetCell.portalPairId === pairId) return curr;

        const nextGrid = currentGrid.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            if (rIdx === currentY && cIdx === currentX) return { h: 7, portalPairId: pairId };
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

  return (
    <div
      id="levelDesigner"
      className="active relative w-full h-full flex flex-col bg-[#02030a] overflow-hidden select-none"
    >
      <div className="w-full px-2 py-1.5 flex flex-col gap-1.5 z-20 shadow-xl bg-[#06091c]/98 border-b border-cyan-500/25">
        <DesignerHeader
          canUndo={canUndo}
          canRedo={canRedo}
          brickCount={placedBlocks.length}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onMirrorHorizontal={handleMirrorHorizontal}
          onClearMatrix={handleClearMatrix}
        />
        <DesignerPalette
          selectedTool={selectedTool}
          hasPendingPortal={!!pendingPortal}
          onSelectTool={selectTool}
        />
      </div>

      <DesignerCanvas
        grid={grid}
        selectedTool={selectedTool}
        pendingPortal={pendingPortal}
        activePairs={activePairs}
        draggedPortal={draggedPortal}
        hoverPos={hoverPos}
        onApplyToolAt={applyToolAt}
        onCommitStroke={commitStroke}
        onStartDragPortal={(fromX, fromY, pairId) => {
          setDraggedPortal({ fromX, fromY, pairId, currentX: fromX, currentY: fromY });
          soundManager.playClick();
        }}
        onUpdateDragPortal={(currentX, currentY) => {
          setDraggedPortal((prev) => prev ? { ...prev, currentX, currentY } : null);
        }}
        onCommitPortalMove={commitPortalMove}
        onSetHoverPos={setHoverPos}
        onStrokeStart={() => {
          strokeStartSnapshotRef.current = present;
          strokeModifiedRef.current = false;
        }}
      />

      <DesignerFooter
        onExit={handleClose}
        onOpenInfo={() => setShowInfoModal(true)}
        onTestLevel={handleTestLevel}
        onOpenSave={handleOpenSaveModal}
      />

      {showSaveModal && (
        <DesignerSaveModal
          grid={grid}
          activePairs={activePairs}
          placedBlocksCount={placedBlocks.length}
          totalHp={stats.totalHp}
          levelName={levelName}
          isPrivate={isPrivate}
          onSetName={setLevelName}
          onSetPrivate={setIsPrivate}
          onConfirmSave={handleConfirmSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {showInfoModal && (
        <DesignerInfoModal onClose={() => setShowInfoModal(false)} />
      )}
    </div>
  );
};
