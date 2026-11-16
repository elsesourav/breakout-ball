import React from 'react';
import { Undo2, Redo2, FlipHorizontal, Trash2 } from 'lucide-react';
import { isMac, isTouchDevice } from './DesignerTypes';

interface DesignerHeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  brickCount: number;
  onUndo: () => void;
  onRedo: () => void;
  onMirrorHorizontal: () => void;
  onClearMatrix: () => void;
}

export const DesignerHeader: React.FC<DesignerHeaderProps> = ({
  canUndo,
  canRedo,
  brickCount,
  onUndo,
  onRedo,
  onMirrorHorizontal,
  onClearMatrix,
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="font-display font-black text-xs tracking-wider text-[#00f7ff] [text-shadow:0_0_8px_rgba(0,247,255,0.4)]">
        MATRIX FORGE
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title={isTouchDevice ? 'Undo' : isMac ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
          className="w-6 h-6 rounded-md flex items-center justify-center text-cyan-300 hover:text-white bg-[#080c22] border border-cyan-500/35 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <Undo2 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title={isTouchDevice ? 'Redo' : isMac ? 'Redo (⌘⇧Z / ⌘Y)' : 'Redo (Ctrl+Y)'}
          className="w-6 h-6 rounded-md flex items-center justify-center text-cyan-300 hover:text-white bg-[#080c22] border border-cyan-500/35 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <Redo2 className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onMirrorHorizontal}
          title={isTouchDevice ? 'Mirror Horizontally' : 'Mirror Horizontally (M)'}
          className="w-6 h-6 rounded-md flex items-center justify-center text-purple-300 hover:text-white bg-[#130d2e] border border-purple-500/40 active:scale-95 transition-all cursor-pointer"
        >
          <FlipHorizontal className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onClearMatrix}
          title={isTouchDevice ? 'Clear Arena' : 'Clear Arena (C)'}
          className="w-6 h-6 rounded-md flex items-center justify-center text-rose-400 hover:text-white bg-[#220713] border border-rose-500/40 active:scale-95 transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <span className="font-tech text-[9px] text-cyan-300 font-bold px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 ml-0.5">
          {brickCount} BRICKS
        </span>
      </div>
    </div>
  );
};
