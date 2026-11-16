import React, { useRef, useEffect } from 'react';
import { Lock, Globe, Check } from 'lucide-react';
import { draw3DBlock } from '../../utils/helpers';
import { GRID_ROWS, GRID_COLS } from '../../constants/game';
import { GridCell, PORTAL_COLORS } from './DesignerTypes';

interface DesignerSaveModalProps {
  grid: GridCell[][];
  activePairs: { pairId: number; blocks: { x: number; y: number }[] }[];
  placedBlocksCount: number;
  totalHp: number;
  levelName: string;
  isPrivate: boolean;
  isEditing?: boolean;
  onSetName: (name: string) => void;
  onSetPrivate: (isPrivate: boolean) => void;
  onConfirmSave: () => void;
  onClose: () => void;
}

export const DesignerSaveModal: React.FC<DesignerSaveModalProps> = ({
  grid,
  activePairs,
  placedBlocksCount,
  totalHp,
  levelName,
  isPrivate,
  isEditing = false,
  onSetName,
  onSetPrivate,
  onConfirmSave,
  onClose,
}) => {
  const savePreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render Mini Preview for Save Dialog
  useEffect(() => {
    const canvas = savePreviewCanvasRef.current;
    if (!canvas) return;
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
  }, [grid, activePairs]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-5">
      <div
        style={{
          backgroundColor: 'rgba(7, 11, 28, 0.98)',
          border: '1.5px solid rgba(0, 247, 255, 0.45)',
          boxShadow: '0 0 35px rgba(0, 247, 255, 0.25), inset 0 0 20px rgba(0, 247, 255, 0.08)',
        }}
        className="w-full max-w-sm rounded-2xl flex flex-col gap-3 p-4 text-slate-200"
      >
        <h3 className="font-display font-black text-sm text-[#00f7ff] tracking-wider text-center">
          {isEditing ? 'UPDATE ARENA MATRIX' : 'SAVE ARENA MATRIX'}
        </h3>

        {/* Level Name Input */}
        <div className="flex flex-col gap-1">
          <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
            ARENA NAME
          </label>
          <input
            type="text"
            value={levelName}
            maxLength={28}
            onChange={(e) => onSetName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 font-display font-bold text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,247,255,0.4)]"
            placeholder="Arena Name"
          />
        </div>

        {/* Canvas Thumbnail Preview */}
        <div className="w-full flex flex-col items-center gap-1">
          <div className="w-full h-28 rounded-xl bg-[#030514] border border-cyan-500/30 overflow-hidden flex items-center justify-center p-1 shadow-inner">
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
            <span className="text-cyan-300 font-black text-sm">{totalHp} HP</span>
          </div>
          <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col">
            <span className="text-slate-400 text-[10px]">TOTAL BLOCKS</span>
            <span className="text-cyan-300 font-black text-sm">{placedBlocksCount} Blocks</span>
          </div>
          <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col">
            <span className="text-slate-400 text-[10px]">QUANTUM PORTALS</span>
            <span className="text-purple-300 font-black text-sm">
              {activePairs.length} Complete Pairs
            </span>
          </div>
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col">
            <span className="text-slate-400 text-[10px]">VISIBILITY</span>
            <span className="text-amber-300 font-black text-sm">
              {isPrivate ? 'PRIVATE' : 'PUBLIC'}
            </span>
          </div>
        </div>

        {/* Network Visibility */}
        <div className="flex flex-col gap-1.5">
          <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
            NETWORK VISIBILITY
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSetPrivate(true)}
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
              onClick={() => onSetPrivate(false)}
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
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 font-display font-bold text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onConfirmSave}
            style={{
              backgroundColor: '#00f7ff',
              boxShadow: '0 0 16px rgba(0, 247, 255, 0.5)',
            }}
            className="flex-1 py-2.5 rounded-xl font-display font-black text-xs text-black tracking-wider transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isEditing ? 'UPDATE ARENA' : 'SAVE ARENA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
