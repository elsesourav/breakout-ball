import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { Plus, Settings2, Play, Eye, EyeOff, Layers, Sparkles } from 'lucide-react';

export const CreateMode: React.FC = () => {
  const { userCreatedLevels, openDesigner, openPreview, openModifier } = useGame();

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 py-4 gap-3.5 pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* Studio Header Bar */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span
              className="font-display font-black text-sm tracking-wider text-cyan-300"
              style={{ color: '#00f7ff' }}
            >
              LEVEL STUDIO
            </span>
          </div>
          <span className="font-tech text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            {userCreatedLevels.length} DESIGNS
          </span>
        </div>

        <p className="text-xs text-slate-400 font-ui">
          Design, test, and publish custom Breakout block matrices.
        </p>

        {/* Primary CTA: Design New Level */}
        <button
          type="button"
          onClick={openDesigner}
          style={{
            borderRadius: '12px',
            backgroundColor: '#00e5ff',
            backgroundImage: 'linear-gradient(135deg, #00f7ff 0%, #6366f1 100%)',
            boxShadow: '0 0 20px rgba(0, 247, 255, 0.45)',
            border: '1.5px solid #a5f3fc',
          }}
          className="w-full h-11 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider text-black active:scale-[0.98] transition-all cursor-pointer mt-1"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>DESIGN NEW LEVEL</span>
        </button>
      </div>

      {/* Level Designs Grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-1">
        {userCreatedLevels.map((lvl) => (
          <StudioLevelCard
            key={lvl.id}
            level={lvl}
            onSelect={() => openPreview(lvl)}
            onSettings={(e) => {
              e.stopPropagation();
              openModifier(lvl);
            }}
          />
        ))}
      </div>

      {/* Clean Empty State */}
      {userCreatedLevels.length === 0 && (
        <div className="w-full max-w-sm rounded-2xl bg-[#090d24]/90 border border-white/10 p-6 flex flex-col items-center text-center gap-3 shadow-lg backdrop-blur-xl mt-4">
          <div className="w-14 h-14 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,247,255,0.3)]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-display font-bold text-sm text-white">
              NO CUSTOM MATRICES YET
            </h3>
            <p className="font-ui text-xs text-slate-400 leading-relaxed max-w-[240px]">
              Tap "DESIGN NEW LEVEL" to forge custom brick layouts, hit-points, and challenges!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const StudioLevelCard: React.FC<{
  level: LevelData;
  onSelect: () => void;
  onSettings: (e: React.MouseEvent) => void;
}> = ({ level, onSelect, onSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = canvas.clientWidth || 150;
      const displayH = canvas.clientHeight || 105;
      canvas.width = Math.round(displayW * dpr);
      canvas.height = Math.round(displayH * dpr);
      drawLevelPreviewOnCanvas(canvas, level.blocks, canvas.width, canvas.height);
    }
  }, [level]);

  return (
    <div
      onClick={onSelect}
      className="relative flex flex-col rounded-xl overflow-hidden bg-[#090d24]/90 border border-white/15 hover:border-cyan-400/50 active:scale-[0.98] transition-all cursor-pointer shadow-md group"
    >
      {/* Visibility Badge */}
      <div className="absolute top-1.5 right-1.5 z-10">
        <span
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-tech font-bold uppercase tracking-wider ${
            level.isPublic
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
          }`}
        >
          {level.isPublic ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
          <span>{level.isPublic ? 'PUB' : 'PRIV'}</span>
        </span>
      </div>

      {/* HiDPI Canvas Preview */}
      <div className="w-full h-26 bg-[#040612] relative overflow-hidden border-b border-white/10">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '104px' }}
        />
      </div>

      {/* Details Bar */}
      <div className="p-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-tech font-black text-xs text-cyan-300 truncate">
            {level.name || `Core #${level.id}`}
          </span>
          <button
            type="button"
            onClick={onSettings}
            className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Edit Level Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-tech text-slate-400 border-t border-white/5 pt-1">
          <span className="flex items-center gap-1 text-slate-300">
            <Play className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span>{level.playCount || 0}</span>
          </span>
          <span className="text-cyan-400 font-mono">
            {level.blocks.filter((b) => b.h > 0).length} Bricks
          </span>
        </div>
      </div>
    </div>
  );
};
