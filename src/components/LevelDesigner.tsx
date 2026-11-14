import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { BlockData } from '../types/game';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_ROWS, GRID_COLS, BLOCK_COLORS } from '../constants/game';
import { generateLevelId, draw3DBlock } from '../utils/helpers';
import { soundManager } from '../utils/audio';
import { Play, Save, ArrowLeft, Undo2, Redo2, Lock, Globe, Eraser, Sparkles, Infinity, Atom, Zap } from 'lucide-react';

const STANDARD_TOOLS = [1, 2, 3, 4, 5];
const SPECIAL_TOOLS = [
  { id: 6, label: '∞', name: 'Titanium Wall (Unbreakable)', color: '#94a3b8', Icon: Infinity },
  { id: 7, label: '🌀', name: 'Quantum Portal', color: '#00f7ff', Icon: Atom },
  { id: 8, label: '⚡', name: 'EMP Reactor Core', color: '#ffaa00', Icon: Zap },
  { id: 0, label: '⌫', name: 'Eraser', color: '#ff0055', Icon: Eraser },
];

export const LevelDesigner: React.FC = () => {
  const { setScreen, saveUserLevel, startPlayLevel, user, showAlert } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<number>(1);
  const selectedToolRef = useRef(1);

  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(0))
  );
  const [history, setHistory] = useState<number[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const initialGrid = Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(0));
    setHistory([initialGrid]);
    setHistoryIndex(0);
  }, []);

  const pushState = useCallback((newGrid: number[][]) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newGrid.map((r) => [...r])]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const selectTool = (toolId: number) => {
    setSelectedTool(toolId);
    selectedToolRef.current = toolId;
    soundManager.playClick();
  };

  const handleCellAction = useCallback((gridX: number, gridY: number) => {
    if (gridX < 0 || gridX >= GRID_ROWS || gridY < 0 || gridY >= GRID_COLS) return;
    const tool = selectedToolRef.current;
    setGrid((prev) => {
      if (prev[gridY][gridX] === tool) return prev;
      const next = prev.map((row, rIdx) =>
        row.map((val, cIdx) => (rIdx === gridY && cIdx === gridX ? tool : val))
      );
      pushState(next);
      soundManager.playClick();
      return next;
    });
  }, [pushState]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGrid(history[historyIndex - 1].map((r) => [...r]));
      soundManager.playClick();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGrid(history[historyIndex + 1].map((r) => [...r]));
      soundManager.playClick();
    }
  };

  const placedBlocks: BlockData[] = [];
  grid.forEach((row, y) => {
    row.forEach((h, x) => {
      if (h > 0) placedBlocks.push({ x, y, h });
    });
  });

  const breakableCount = placedBlocks.filter((b) => (b.h >= 1 && b.h <= 5) || b.h === 8).length;

  const handleTestLevel = () => {
    if (breakableCount === 0) {
      showAlert({
        title: 'MATRIX INCOMPLETE',
        message: 'Add at least one breakable core (HP 1-5 or EMP Reactor) to test this level.',
        btn1Text: 'OKAY',
        singleBtn: true,
      });
      return;
    }
    startPlayLevel({
      id: 'TEST',
      name: 'Custom Test Level',
      creator: user.username,
      playCount: 0,
      blocks: placedBlocks,
    });
  };

  const handleSave = () => {
    if (breakableCount === 0) {
      showAlert({
        title: 'MATRIX INCOMPLETE',
        message: 'Add at least one breakable core (HP 1-5 or EMP Reactor) before saving.',
        btn1Text: 'OKAY',
        singleBtn: true,
      });
      return;
    }
    showAlert({
      title: 'CONFIRM MATRIX SAVE',
      message: `Save custom breakout level with ${placedBlocks.length} blocks as ${isPrivate ? 'PRIVATE' : 'PUBLIC'}?`,
      btn1Text: 'CANCEL',
      btn2Text: 'SAVE LEVEL',
      btn2Color: '#00f7ff',
      onConfirm: () => {
        saveUserLevel({
          id: generateLevelId(),
          name: `Matrix #${Math.floor(100 + Math.random() * 900)}`,
          creator: user.username,
          playCount: 0,
          blocks: placedBlocks,
          isPublic: !isPrivate,
          createdAt: Date.now(),
        });
        setScreen('menu');
      },
    });
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

  // Canvas Drawing with 3D Beveled Blocks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#030514';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const cellW = CANVAS_WIDTH / GRID_ROWS;
    const cellH = 128 * 0.75;
    const padding = Math.max(1, cellW * 0.05);

    // Subtle Gridlines
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.08)';
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

    // Playfield matrix bounding line
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, CANVAS_WIDTH - 4, GRID_COLS * cellH);

    // Paddle launch zone guide
    ctx.fillStyle = 'rgba(0, 247, 255, 0.02)';
    ctx.fillRect(0, GRID_COLS * cellH, CANVAS_WIDTH, CANVAS_HEIGHT - GRID_COLS * cellH);
    ctx.font = '600 24px monospace';
    ctx.fillStyle = 'rgba(0, 247, 255, 0.15)';
    ctx.textAlign = 'center';
    ctx.fillText('▼ PADDLE LAUNCH & REBOUND ZONE ▼', CANVAS_WIDTH / 2, GRID_COLS * cellH + 60);

    // Render placed blocks using 3D block renderer
    grid.forEach((row, y) => {
      row.forEach((h, x) => {
        if (h <= 0) return;
        draw3DBlock(ctx, x * cellW + padding, y * cellH + padding, cellW - padding * 2, cellH - padding * 2, h);
      });
    });

    // Render interactive hover preview cursor
    if (hoverPos && hoverPos.y < GRID_COLS) {
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
        draw3DBlock(ctx, bx, by, bw, bh, selectedTool, 0.5);
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(bx, by, bw, bh);
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

    const scale = Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT);
    const renderedW = CANVAS_WIDTH * scale;
    const renderedH = CANVAS_HEIGHT * scale;
    const offsetX = (rect.width - renderedW) / 2;
    const offsetY = (rect.height - renderedH) / 2;

    const relX = clientX - rect.left - offsetX;
    const relY = clientY - rect.top - offsetY;
    if (relX < 0 || relX >= renderedW || relY < 0 || relY >= renderedH) return null;

    const canvasX = relX / scale;
    const canvasY = relY / scale;
    return {
      gridX: Math.floor(canvasX / (CANVAS_WIDTH / GRID_ROWS)),
      gridY: Math.floor(canvasY / (128 * 0.75)),
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    isMouseDownRef.current = true;
    const coords = getCanvasCoords(e);
    if (coords && coords.gridY < GRID_COLS) handleCellAction(coords.gridX, coords.gridY);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    if (coords && coords.gridY < GRID_COLS) {
      setHoverPos({ x: coords.gridX, y: coords.gridY });
      if (isMouseDownRef.current) handleCellAction(coords.gridX, coords.gridY);
    } else {
      setHoverPos(null);
    }
  };

  return (
    <div id="levelDesigner" className="active relative w-full h-full flex flex-col bg-[#02030a] overflow-hidden select-none">
      {/* Top Cyber Palette Bar */}
      <div className="w-full px-3 py-2 flex flex-col gap-1.5 z-20 shadow-lg bg-[#06091c]/95 border-b border-cyan-500/25">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-display font-black text-xs tracking-wider text-[#00f7ff] [text-shadow:0_0_8px_rgba(0,247,255,0.4)]">
              MATRIX FORGE
            </span>
          </div>

          {/* Integrated Undo, Redo, and Bricks Counter */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo"
              className="w-6 h-6 rounded-md flex items-center justify-center text-cyan-300 hover:text-white bg-[#080c22] border border-cyan-500/35 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Undo2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
              className="w-6 h-6 rounded-md flex items-center justify-center text-cyan-300 hover:text-white bg-[#080c22] border border-cyan-500/35 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Redo2 className="w-3 h-3" />
            </button>
            <span className="font-tech text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 ml-1">
              {placedBlocks.length} BRICKS
            </span>
          </div>
        </div>

        {/* Dual Tool Columns: Standard Bricks & Special Matrix */}
        <div className="grid grid-cols-2 gap-2">
          {/* Standard HP 1-5 Bricks */}
          <div className="flex flex-col gap-1">
            <span className="font-tech text-[9px] font-bold text-slate-400 uppercase tracking-wider">STANDARD (HP)</span>
            <div className="flex items-center gap-1">
              {STANDARD_TOOLS.map((hp) => {
                const config = BLOCK_COLORS[hp];
                const isSelected = selectedTool === hp;
                return (
                  <button
                    key={hp}
                    type="button"
                    data-tool-id={hp}
                    onClick={() => selectTool(hp)}
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${config.bg[0]} 0%, ${config.bg[1]} 100%)`,
                      border: isSelected ? '2px solid #ffffff' : `1.5px solid ${config.border}88`,
                      boxShadow: isSelected ? `0 0 14px ${config.border}, inset 0 1px 1px #fff` : '0 2px 4px rgba(0,0,0,0.5)',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }}
                    className="flex-1 h-7 rounded-lg flex items-center justify-center font-tech font-black text-xs transition-all cursor-pointer"
                  >
                    <span style={{ color: config.text, textShadow: '0 1px 2px #000' }}>{hp}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Elements */}
          <div className="flex flex-col gap-1">
            <span className="font-tech text-[9px] font-bold text-pink-400 uppercase tracking-wider">SPECIAL MATRIX</span>
            <div className="flex items-center gap-1">
              {SPECIAL_TOOLS.map((tool) => {
                const isSelected = selectedTool === tool.id;
                const IconComponent = tool.Icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    data-tool-id={tool.id}
                    onClick={() => selectTool(tool.id)}
                    title={tool.name}
                    style={{
                      backgroundColor: isSelected ? 'rgba(0, 247, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? `2px solid ${tool.color}` : '1.5px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: isSelected ? `0 0 14px ${tool.color}88, inset 0 1px 1px #fff` : '0 2px 4px rgba(0,0,0,0.5)',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }}
                    className="flex-1 h-7 rounded-lg flex items-center justify-center font-tech font-black text-xs transition-all cursor-pointer"
                  >
                    <IconComponent className="w-3.5 h-3.5" style={{ color: tool.color }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Editor Canvas with Object-Contain */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          id="mainCanvas"
          className="w-full h-full object-contain block cursor-crosshair touch-none"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={() => { isMouseDownRef.current = false; }}
          onMouseLeave={() => { isMouseDownRef.current = false; }}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={() => { isMouseDownRef.current = false; }}
        />
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full px-3 py-2.5 flex items-center justify-between z-20 shadow-2xl bg-[#06091c]/95 border-t border-cyan-500/25">
        <button
          type="button"
          onClick={() => { setIsPrivate((p) => !p); soundManager.playClick(); }}
          style={{
            backgroundColor: isPrivate ? 'rgba(255, 170, 0, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: isPrivate ? '1.5px solid #ffa500' : '1.5px solid #10b981',
            color: isPrivate ? '#ffd700' : '#34d399',
            boxShadow: isPrivate ? '0 0 10px rgba(255, 170, 0, 0.3)' : '0 0 10px rgba(16, 185, 129, 0.3)',
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-tech font-bold rounded-xl transition-all cursor-pointer active:scale-95"
        >
          {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          <span>{isPrivate ? 'PRIVATE' : 'PUBLIC'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestLevel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs text-white tracking-wider cursor-pointer active:scale-95 transition-all bg-emerald-600 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>TEST</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs text-black tracking-wider cursor-pointer active:scale-95 transition-all bg-cyan-400 border border-cyan-200 shadow-[0_0_12px_rgba(0,247,255,0.45)]"
          >
            <Save className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>SAVE</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-bold text-xs text-slate-300 hover:text-white bg-white/5 border border-white/15 cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>EXIT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
