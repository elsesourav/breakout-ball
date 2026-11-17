import React, { useRef, useEffect } from 'react';
import { Lock, Globe, Check, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { drawLevelPreviewOnCanvas } from '../../utils/helpers';
import { GridCell } from './DesignerTypes';
import { BlockData, LevelData } from '../../types/game';

interface DesignerSaveModalProps {
  grid: GridCell[][];
  activePairs: { pairId: number; blocks: { x: number; y: number }[] }[];
  placedBlocksCount: number;
  totalHp: number;
  levelName: string;
  isPrivate: boolean;
  isEditing?: boolean;
  existingLevels?: LevelData[];
  editingLevelId?: string | null;
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
  existingLevels = [],
  editingLevelId = null,
  onSetName,
  onSetPrivate,
  onConfirmSave,
  onClose,
}) => {
  const savePreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  const trimmed = (levelName || '').trim();
  const isEmpty = trimmed.length === 0;
  const isDuplicateName = existingLevels.some(
    (l) => l.id !== editingLevelId && (l.name || '').trim().toLowerCase() === trimmed.toLowerCase()
  );
  const isValid = !isEmpty && !isDuplicateName;

  const nameError = isEmpty
    ? 'Arena name cannot be empty'
    : isDuplicateName
    ? 'Another arena has this name. Enter a unique name.'
    : null;

  // Render Centered, High-DPI Matrix Preview for Save Dialog
  useEffect(() => {
    const canvas = savePreviewCanvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = canvas.clientWidth || 300;
    const displayH = canvas.clientHeight || 140;
    canvas.width = Math.round(displayW * dpr);
    canvas.height = Math.round(displayH * dpr);

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

    drawLevelPreviewOnCanvas(canvas, placedBlocks, canvas.width, canvas.height, {
      showGrid: true,
    });
  }, [grid]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in p-3 sm:p-5">
      <div
        style={{
          backgroundColor: 'rgba(7, 11, 28, 0.98)',
          border: '1.5px solid rgba(0, 247, 255, 0.45)',
          boxShadow: '0 0 35px rgba(0, 247, 255, 0.25), inset 0 0 20px rgba(0, 247, 255, 0.08)',
        }}
        className="w-full max-w-sm rounded-2xl flex flex-col gap-3 p-4 text-slate-200 max-h-[92vh] overflow-y-auto"
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
            style={{
              borderColor: nameError ? '#f43f5e' : isValid ? '#10b981' : 'rgba(0, 247, 255, 0.4)',
            }}
            className="w-full px-3 py-2 rounded-xl bg-cyan-950/40 border text-cyan-200 font-display font-bold text-sm focus:outline-none focus:shadow-[0_0_12px_rgba(0,247,255,0.4)] transition-colors"
            placeholder="Arena Name"
          />

          {/* Real-time Uniqueness Validation */}
          <div className="flex items-center justify-between text-[11px] font-tech min-h-[16px]">
            {nameError ? (
              <span className="text-rose-400 flex items-center gap-1 font-bold">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{nameError}</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <Check className="w-3 h-3 flex-shrink-0" />
                <span>Unique name verified</span>
              </span>
            )}
            <span className="text-slate-400 self-end ml-auto">
              {trimmed.length}/28
            </span>
          </div>
        </div>

        {/* Canvas Thumbnail Preview (Centered Tactical Matrix Screen) */}
        <div className="w-full flex flex-col items-center justify-center py-0.5">
          <div className="relative w-44 sm:w-48 aspect-[1152/1056] rounded-xl bg-[#030514] border border-cyan-500/40 overflow-hidden shadow-[0_0_20px_rgba(0,247,255,0.18)] flex items-center justify-center">
            <canvas
              ref={savePreviewCanvasRef}
              className="w-full h-full block rounded-xl"
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
              <span>PRIVATE DRAFT</span>
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
              <span>PUBLIC ARENA</span>
            </button>
          </div>
        </div>

        {/* Informative Policy Note (Public Lock vs Private Draft) */}
        {!isPrivate ? (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-2.5 text-[11px] font-tech text-amber-200 leading-tight">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">⚠️ PERMANENT PUBLIC LOCK</span>
              Once saved as Public, this arena will be published to the Community Arena and <strong>permanently locked</strong> from future edits and renaming. You can only duplicate or delete it.
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/50 flex items-start gap-2.5 text-[11px] font-tech text-cyan-200 leading-tight">
            <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300 block mb-0.5">🔒 EDITABLE PRIVATE DRAFT</span>
              Saved as a private draft in your Studio. You can freely edit blocks, change the name, test, and publish this arena whenever you are ready.
            </div>
          </div>
        )}

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
            disabled={!isValid}
            onClick={() => {
              if (isValid) onConfirmSave();
            }}
            style={{
              backgroundColor: isValid ? (!isPrivate ? '#00f7ff' : '#10b981') : '#1e293b',
              color: isValid ? '#000000' : '#64748b',
              boxShadow: isValid ? (!isPrivate ? '0 0 16px rgba(0, 247, 255, 0.5)' : '0 0 16px rgba(16, 185, 129, 0.5)') : 'none',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
            className="flex-1 py-2.5 rounded-xl font-display font-black text-xs tracking-wider transition-all active:scale-98 flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {!isPrivate
                ? 'PUBLISH & LOCK ARENA'
                : isEditing
                ? 'UPDATE DRAFT'
                : 'SAVE DRAFT'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
