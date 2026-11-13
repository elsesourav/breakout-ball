import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { BlockData, LevelData } from '../types/game';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRID_ROWS,
  GRID_COLS,
  BLOCK_COLORS,
} from '../constants/game';
import { generateLevelId } from '../utils/helpers';
import { soundManager } from '../utils/audio';

export const LevelDesigner: React.FC = () => {
  const { setScreen, saveUserLevel, startPlayLevel, user, showAlert } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<number>(1); // 1-5: HP, 6: Wall, 0: Eraser
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  // 11 rows x 9 cols 2D grid
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(0))
  );

  const [history, setHistory] = useState<number[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const isMouseDownRef = useRef(false);

  // Initialize history
  useEffect(() => {
    const initialGrid = Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(0));
    setHistory([initialGrid]);
    setHistoryIndex(0);
  }, []);

  const pushState = useCallback((newGrid: number[][]) => {
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newGrid.map((r) => [...r])];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleCellAction = useCallback(
    (gridX: number, gridY: number) => {
      if (gridX < 0 || gridX >= GRID_ROWS || gridY < 0 || gridY >= GRID_COLS) return;

      setGrid((prev) => {
        if (prev[gridY][gridX] === selectedTool) return prev;
        const next = prev.map((row, rIdx) =>
          row.map((val, cIdx) => (rIdx === gridY && cIdx === gridX ? selectedTool : val))
        );
        pushState(next);
        soundManager.playClick();
        return next;
      });
    },
    [selectedTool, pushState]
  );

  // Keyboard shortcuts
  useEffect(() => {
    let spaceDown = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown = true;

      if (spaceDown) {
        if (e.key >= '1' && e.key <= '5') {
          setSelectedTool(parseInt(e.key, 10));
        } else if (e.key === 'w' || e.key === 'W') {
          setSelectedTool(6);
        } else if (e.key === 'e' || e.key === 'E') {
          setSelectedTool(0);
        } else if (e.key === 'z' || e.key === 'Z') {
          handleUndo();
        } else if (e.key === 'y' || e.key === 'Y') {
          handleRedo();
        } else if (e.key === 't' || e.key === 'T') {
          handleTestLevel();
        } else if (e.key === 's' || e.key === 'S') {
          handleSave();
        } else if (e.key === 'c' || e.key === 'C') {
          handleClose();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [grid, historyIndex, history]);

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setGrid(history[prevIdx].map((r) => [...r]));
      soundManager.playClick();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setGrid(history[nextIdx].map((r) => [...r]));
      soundManager.playClick();
    }
  };

  const getBlocksList = (): BlockData[] => {
    const list: BlockData[] = [];
    grid.forEach((row, y) => {
      row.forEach((h, x) => {
        if (h > 0) {
          list.push({ x, y, h });
        }
      });
    });
    return list;
  };

  const handleTestLevel = () => {
    const blocks = getBlocksList();
    const hasBreakable = blocks.some((b) => b.h >= 1 && b.h <= 5);
    if (!hasBreakable) {
      showAlert({
        title: "Level Can't Be Empty",
        message: 'You must add at least one destroyable block (HP 1-5). The level cannot be empty.',
        btn1Text: 'Okay',
        singleBtn: true,
      });
      return;
    }

    const testLevel: LevelData = {
      id: 'TEST',
      name: 'Custom Test Level',
      creator: user.username,
      playCount: 0,
      blocks,
    };
    startPlayLevel(testLevel);
  };

  const handleSave = () => {
    const blocks = getBlocksList();
    const hasBreakable = blocks.some((b) => b.h >= 1 && b.h <= 5);
    if (!hasBreakable) {
      showAlert({
        title: "Level Can't Be Empty",
        message: 'You must add at least one destroyable block (HP 1-5).',
        btn1Text: 'Okay',
        singleBtn: true,
      });
      return;
    }

    showAlert({
      title: 'Confirm Save Level',
      message: 'Are you sure you want to save this level?',
      btn1Text: 'Cancel',
      btn2Text: 'Save',
      btn2Color: '#1eff00',
      onConfirm: () => {
        const newLevel: LevelData = {
          id: generateLevelId(),
          name: `Custom Level`,
          creator: user.username,
          playCount: 0,
          blocks,
          isPublic: !isPrivate,
          createdAt: Date.now(),
        };
        saveUserLevel(newLevel);
        setScreen('menu');
      },
    });
  };

  const handleClose = () => {
    const blocks = getBlocksList();
    if (blocks.length > 0) {
      showAlert({
        title: 'Exit Level Creation',
        message: 'Are you sure you want to exit? Any unsaved edits will be discarded.',
        btn1Text: 'Cancel',
        btn2Text: 'Exit',
        btn2Color: '#ff0844',
        onConfirm: () => setScreen('menu'),
      });
    } else {
      setScreen('menu');
    }
  };

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Dark space background
    ctx.fillStyle = '#010015';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cellW = CANVAS_WIDTH / GRID_ROWS;
    const cellH = 128 * 0.75;
    const padding = 2;

    // Draw grid lines for block placement area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= GRID_COLS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(CANVAS_WIDTH, r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= GRID_ROWS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, GRID_COLS * cellH);
      ctx.stroke();
    }

    // Draw placed blocks
    grid.forEach((row, y) => {
      row.forEach((h, x) => {
        if (h <= 0) return;
        const config = BLOCK_COLORS[h] || BLOCK_COLORS[1];
        const bx = x * cellW + padding;
        const by = y * cellH + padding;
        const bw = cellW - padding * 2;
        const bh = cellH - padding * 2;
        const radius = Math.min(bw, bh) * 0.2;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, radius) : ctx.rect(bx, by, bw, bh);

        const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
        grad.addColorStop(0, config.bg[0]);
        grad.addColorStop(1, config.bg[1]);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = config.border;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = config.text;
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.label, bx + bw / 2, by + bh / 2);
        ctx.restore();
      });
    });

    // Draw hover outline or ghost
    if (hoverPos && hoverPos.y < GRID_COLS) {
      const bx = hoverPos.x * cellW + padding;
      const by = hoverPos.y * cellH + padding;
      const bw = cellW - padding * 2;
      const bh = cellH - padding * 2;

      ctx.save();
      ctx.strokeStyle = selectedTool === 0 ? '#ff0055' : '#00ffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(bx, by, bw, bh);

      if (selectedTool > 0) {
        ctx.globalAlpha = 0.35;
        const config = BLOCK_COLORS[selectedTool];
        ctx.fillStyle = config.bg[0];
        ctx.fillRect(bx, by, bw, bh);
      }
      ctx.restore();
    }
  }, [grid, hoverPos, selectedTool]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const cellW = CANVAS_WIDTH / GRID_ROWS;
    const cellH = 128 * 0.75;

    const gridX = Math.floor(canvasX / cellW);
    const gridY = Math.floor(canvasY / cellH);

    return { gridX, gridY };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    isMouseDownRef.current = true;
    const coords = getCanvasCoords(e);
    if (coords && coords.gridY < GRID_COLS) {
      handleCellAction(coords.gridX, coords.gridY);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    if (coords && coords.gridY < GRID_COLS) {
      setHoverPos({ x: coords.gridX, y: coords.gridY });
      if (isMouseDownRef.current) {
        handleCellAction(coords.gridX, coords.gridY);
      }
    } else {
      setHoverPos(null);
    }
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
  };

  return (
    <div id="levelDesigner" className="active">
      {/* Top Section: Tool Palette */}
      <div className="selection one">
        <p className="tag">BLOCKS</p>
        <div className="options">
          {[1, 2, 3, 4, 5].map((hp) => (
            <div
              key={hp}
              className={`option ${selectedTool === hp ? 'active' : ''}`}
              onClick={() => setSelectedTool(hp)}
            >
              <div className="block">
                <span>{hp}</span>
              </div>
              <div className="tool-tip-text">
                <i className="sbi-info-with-circle">
                  Hit Points(HP) <b>{hp}</b>
                </i>
                <i className="sbi-keyboard"> SPACE+{hp}</i>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="selection two">
        <div className="names">
          <p className="tag">WALL</p>
          <p className="tag">ERASER</p>
        </div>
        <div className="options">
          <div
            className={`option ${selectedTool === 6 ? 'active' : ''}`}
            onClick={() => setSelectedTool(6)}
          >
            <div className="block">
              <span></span>
            </div>
            <div className="tool-tip-text">
              <i className="sbi-info-with-circle">
                Hit Points(HP) <b>∞</b>
              </i>
              <i className="sbi-keyboard"> SPACE+W</i>
            </div>
          </div>

          <div
            className={`option ${selectedTool === 0 ? 'active' : ''}`}
            onClick={() => setSelectedTool(0)}
          >
            <div className="block eraser">
              <span>
                <i className="sbi-gavel1" />
              </span>
            </div>
            <div className="tool-tip-text">
              <i className="sbi-info-with-circle"> Remove Block & Wall</i>
              <i className="sbi-keyboard"> SPACE+E</i>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar 1 */}
      <div className="buttons one">
        <button
          className="btn"
          id="undoBtn"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          title="Undo (SPACE+Z)"
        >
          <i className="sbi-undo1" />
          <div className="tool-tip-text">
            <i className="sbi-info-with-circle"> Undo Edit</i>
            <i className="sbi-keyboard"> SPACE+Z</i>
          </div>
        </button>

        <button
          className="btn"
          id="redoBtn"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (SPACE+Y)"
        >
          <i className="sbi-undo1 rotate" />
          <div className="tool-tip-text">
            <i className="sbi-info-with-circle"> Redo Edit</i>
            <i className="sbi-keyboard"> SPACE+Y</i>
          </div>
        </button>

        <button
          className="btn"
          id="makeTesting"
          onClick={handleTestLevel}
          title="Run Level (SPACE+T)"
        >
          <i className="sbi-play-circle" />
          <div className="tool-tip-text">
            <i className="sbi-info-with-circle"> Run Level</i>
            <i className="sbi-keyboard"> SPACE+T</i>
          </div>
        </button>
      </div>

      {/* Action Buttons Toolbar 2 */}
      <div className="buttons two">
        <div className="switch-button">
          <input
            className="switch-button-checkbox"
            type="checkbox"
            name="privacy"
            id="designerPrivacy"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <label className="switch-button-label" htmlFor="designerPrivacy">
            <span className="switch-button-label-span">Private</span>
          </label>
        </div>

        <button className="btn" id="saveBtn" onClick={handleSave} title="Save Level (SPACE+S)">
          <i className="sbi-save2" />
          <div className="tool-tip-text">
            <i className="sbi-info-with-circle"> Save Level</i>
            <i className="sbi-keyboard"> SPACE+S</i>
          </div>
        </button>

        <button
          className="btn"
          id="closeBtn"
          onClick={handleClose}
          title="Close Making (SPACE+C)"
        >
          <i className="sbi-sign-out" />
          <div className="tool-tip-text">
            <i className="sbi-info-with-circle"> Close Making</i>
            <i className="sbi-keyboard"> SPACE+C</i>
          </div>
        </button>
      </div>

      {/* Interactive Editor Canvas */}
      <canvas
        ref={canvasRef}
        id="mainCanvas"
        className="active"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
};
