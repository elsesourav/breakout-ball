import React from 'react';
import { ArrowLeft, HelpCircle, Play, Save } from 'lucide-react';

interface DesignerFooterProps {
  onExit: () => void;
  onOpenInfo: () => void;
  onTestLevel: () => void;
  onOpenSave: () => void;
}

export const DesignerFooter: React.FC<DesignerFooterProps> = ({
  onExit,
  onOpenInfo,
  onTestLevel,
  onOpenSave,
}) => {
  return (
    <div className="w-full px-3 py-2 flex items-center justify-between z-20 shadow-2xl bg-[#06091c]/95 border-t border-cyan-500/25">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-xs text-slate-300 hover:text-white bg-white/5 border border-white/15 cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>EXIT</span>
        </button>

        <button
          type="button"
          onClick={onOpenInfo}
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
          onClick={onTestLevel}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-display font-black text-xs text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-500/50 hover:bg-emerald-900/60 cursor-pointer active:scale-95 transition-all shadow-[0_0_12px_rgba(16,185,129,0.35)]"
        >
          <Play className="w-3.5 h-3.5 fill-emerald-400" />
          <span>TEST</span>
        </button>

        <button
          type="button"
          onClick={onOpenSave}
          style={{
            backgroundColor: '#00f7ff',
            boxShadow: '0 0 16px rgba(0, 247, 255, 0.45)',
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-display font-black text-xs text-black cursor-pointer active:scale-95 transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>SAVE</span>
        </button>
      </div>
    </div>
  );
};
