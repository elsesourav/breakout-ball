import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { levelSearchEngine } from '../services/search';
import { Search, Flame, Globe, User, X, ChevronLeft, ChevronRight, Boxes } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export const OnlineMode: React.FC = () => {
  const { onlineLevels, openPreview } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<'all' | 'popular'>('all');

  const filteredLevels = useMemo(() => {
    let list = levelSearchEngine.search(onlineLevels, searchTerm);
    if (filterMode === 'popular') {
      list = [...list].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }
    return list;
  }, [onlineLevels, searchTerm, filterMode]);

  const totalPages = Math.max(1, Math.ceil(filteredLevels.length / ITEMS_PER_PAGE));

  const pageLevels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLevels.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLevels, currentPage]);

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 py-4 gap-3 pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* Arena Header Bar */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span
              className="font-display font-black text-sm tracking-wider text-cyan-300"
              style={{ color: '#00f7ff' }}
            >
              GLOBAL ARENA
            </span>
          </div>
          <span className="font-tech text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            {filteredLevels.length} STAGES
          </span>
        </div>

        <p className="text-xs text-slate-400 font-ui">
          Challenge community-crafted breakout stages and climb global rankings.
        </p>

        {/* Live Search Input */}
        <div className="relative w-full mt-0.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Level, ID or Creator..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            spellCheck="false"
            autoComplete="off"
            className="w-full h-10 pl-9 pr-8 rounded-xl bg-[#090d24]/90 border border-white/15 focus:border-cyan-400 text-xs font-ui text-white placeholder-slate-400 outline-none transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-0.5">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-tech font-bold transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.3)]'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            ALL STAGES
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('popular')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-tech font-bold transition-all cursor-pointer ${
              filterMode === 'popular'
                ? 'bg-amber-500/20 border border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>TOP PLAYED</span>
          </button>
        </div>
      </div>

      {/* Arena Levels Grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-1">
        {pageLevels.map((lvl) => (
          <ArenaLevelCard
            key={lvl.id}
            level={lvl}
            onClick={() => openPreview(lvl)}
          />
        ))}
      </div>

      {/* No Results Fallback */}
      {pageLevels.length === 0 && (
        <div className="w-full max-w-sm rounded-2xl bg-[#090d24]/90 border border-white/10 p-6 flex flex-col items-center text-center gap-2 shadow-lg backdrop-blur-xl mt-4">
          <Search className="w-8 h-8 text-slate-500" />
          <h3 className="font-display font-bold text-sm text-white">NO STAGES FOUND</h3>
          <p className="font-ui text-xs text-slate-400">
            No community levels match "{searchTerm}". Try a different keyword!
          </p>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 mt-2 font-tech text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isActive = currentPage === pageNum;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.4)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const ArenaLevelCard: React.FC<{ level: LevelData; onClick: () => void }> = ({ level, onClick }) => {
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

  const brickCount = level.blocks.filter((b) => b.h > 0).length;

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col rounded-xl overflow-hidden bg-[#090d24]/90 border border-white/15 hover:border-cyan-400/50 active:scale-[0.98] transition-all cursor-pointer shadow-md group"
    >
      {/* HiDPI Canvas Preview */}
      <div className="w-full h-26 bg-[#040612] relative overflow-hidden border-b border-white/10">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '104px' }}
        />
      </div>

      {/* Details Bar */}
      <div className="p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-tech font-black text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
            {level.name || `Core #${level.id}`}
          </span>
          <span className="font-tech text-[10px] text-cyan-400 font-bold">
            #{level.id}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-ui text-slate-400 border-t border-white/5 pt-1">
          <span className="flex items-center gap-1 truncate text-slate-300">
            <User className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">@{level.creator}</span>
          </span>
          <span className="flex items-center gap-1 text-amber-300 font-tech font-bold flex-shrink-0">
            <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>{level.playCount || 0}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
