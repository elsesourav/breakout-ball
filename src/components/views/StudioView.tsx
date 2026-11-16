import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { LevelData } from '../../types/game';
import { drawLevelPreviewOnCanvas, calculateLevelHp } from '../../utils/helpers';
import { Plus, Settings2, Play, Eye, EyeOff, Layers } from 'lucide-react';
import { StudioMatrixForgeIcon } from '../navigation/NavIcons';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';

export const StudioView: React.FC = () => {
  const { userCreatedLevels, openDesigner, openPreview, openModifier, setActiveTab } = useGame();

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 py-4 gap-3.5 pb-10 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* Studio Header Bar */}
      <div className="w-full max-w-sm -mt-4 -mx-3.5 mb-2">
        <PageHeaderWithBack
          title="ARENA STUDIO"
          subtitle={`${userCreatedLevels.length} CUSTOM ARENAS`}
          onBack={() => setActiveTab('local')}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-2">
        <p className="text-xs text-slate-400 font-ui text-center">
          Design, test, and publish custom Breakout arenas for the community.
        </p>

        {/* Primary CTA: Design New Arena */}
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
          <span>DESIGN NEW ARENA</span>
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
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,247,255,0.25)] relative">
            <StudioMatrixForgeIcon className="w-11 h-11" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-display font-bold text-sm text-white tracking-wide">
              NO CUSTOM ARENAS YET
            </h3>
            <p className="font-ui text-xs text-slate-400 leading-relaxed max-w-[240px]">
              Tap "DESIGN NEW ARENA" to forge custom brick layouts, hit-points, and challenges!
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
  const [isHovered, setIsHovered] = useState(false);

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

  const stats = calculateLevelHp(level.blocks);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'rgba(8, 13, 36, 0.94)',
        border: isHovered
          ? '1.5px solid #00f7ff'
          : '1.5px solid rgba(0, 247, 255, 0.22)',
        boxShadow: isHovered
          ? '0 0 18px rgba(0, 247, 255, 0.35), inset 0 0 10px rgba(0, 247, 255, 0.08)'
          : '0 4px 12px rgba(0, 0, 0, 0.4)',
        borderRadius: '14px',
      }}
      className="relative flex flex-col overflow-hidden active:scale-[0.98] transition-all duration-200 cursor-pointer group"
    >
      {/* Visibility Badge */}
      <div className="absolute top-2 right-2 z-10">
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
      <div className="w-full h-26 bg-[#040614] relative overflow-hidden border-b border-cyan-500/20">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '104px' }}
        />
        {/* Subtle Cyber Grid Lines inside preview */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 247, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 247, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* Details Bar */}
      <div className="p-2.5 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <span className="font-tech font-black text-xs text-cyan-300 truncate min-w-0 flex-1 mr-1.5">
            {level.name || `Core #${level.id}`}
          </span>
          <button
            type="button"
            onClick={onSettings}
            className="p-1 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer flex-shrink-0"
            title="Edit Level Settings"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-tech text-slate-400 border-t border-white/10 pt-1.5">
          <span className="flex items-center gap-1 text-slate-300">
            <Play className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span>{level.playCount || 0}</span>
          </span>
          <span className="text-cyan-400 font-tech font-bold text-[9px]">
            {stats.totalHp} HP ({stats.breakableCount})
          </span>
        </div>
      </div>
    </div>
  );
};

export const CreateMode = StudioView;
