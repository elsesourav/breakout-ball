import React from 'react';
import { Undo2, Redo2, FlipHorizontal, Trash2 } from 'lucide-react';
import { isMac, isTouchDevice } from './DesignerTypes';

interface DesignerHeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  brickCount: number;
  isEditing?: boolean;
  editingName?: string;
  onUndo: () => void;
  onRedo: () => void;
  onMirrorHorizontal: () => void;
  onClearMatrix: () => void;
}

export const DesignerHeader: React.FC<DesignerHeaderProps> = ({
  canUndo,
  canRedo,
  brickCount,
  isEditing = false,
  editingName,
  onUndo,
  onRedo,
  onMirrorHorizontal,
  onClearMatrix,
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="font-display font-black text-xs tracking-wider text-[#00f7ff] [text-shadow:0_0_8px_rgba(0,247,255,0.4)] truncate max-w-[150px] sm:max-w-[180px]">
        {isEditing ? `EDIT: ${editingName || 'ARENA'}` : 'MATRIX FORGE'}
      </span>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
          title={isTouchDevice ? 'Undo' : isMac ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-all cursor-pointer ${
            canUndo
              ? 'text-cyan-300 hover:text-white bg-[#0a1030] border border-cyan-400/60 shadow-[0_0_8px_rgba(0,247,255,0.25)] active:scale-95'
              : 'text-slate-500 bg-[#080c22]/50 border border-slate-700/30 opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
          title={isTouchDevice ? 'Redo' : isMac ? 'Redo (⌘⇧Z / ⌘Y)' : 'Redo (Ctrl+Y)'}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-all cursor-pointer ${
            canRedo
              ? 'text-cyan-300 hover:text-white bg-[#0a1030] border border-cyan-400/60 shadow-[0_0_8px_rgba(0,247,255,0.25)] active:scale-95'
              : 'text-slate-500 bg-[#080c22]/50 border border-slate-700/30 opacity-30 cursor-not-allowed pointer-events-none'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          type="button"
          onClick={onMirrorHorizontal}
          aria-label="Mirror Horizontally"
          title={isTouchDevice ? 'Mirror Horizontally' : 'Mirror Horizontally (M)'}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-purple-300 hover:text-white bg-[#130d2e] border border-purple-500/40 active:scale-95 transition-all cursor-pointer"
        >
          <FlipHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          type="button"
          onClick={onClearMatrix}
          aria-label="Clear Arena"
          title={isTouchDevice ? 'Clear Arena' : 'Clear Arena (C)'}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center text-rose-400 hover:text-white bg-[#220713] border border-rose-500/40 active:scale-95 transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <span className="font-tech text-[9px] text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 ml-0.5">
          {brickCount} BRICKS
        </span>
      </div>
    </div>
  );
};
