import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { drawLevelPreviewOnCanvas, calculateLevelHp } from '../utils/helpers';
import { levelSearchEngine } from '../services/search';
import { Search, Flame, Globe, User, X, ChevronLeft, ChevronRight, Boxes } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export const OnlineMode: React.FC = () => {
  const { onlineLevels, openPreview } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<'all' | 'popular'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
              className="font-display font-black text-sm tracking-wider"
              style={{ color: '#00f7ff', textShadow: '0 0 10px rgba(0, 247, 255, 0.4)' }}
            >
              GLOBAL ARENA
            </span>
          </div>
          <span
            style={{
              backgroundColor: 'rgba(0, 247, 255, 0.12)',
              border: '1px solid rgba(0, 247, 255, 0.4)',
              color: '#00f7ff',
            }}
            className="font-tech text-xs font-bold px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(0,247,255,0.2)]"
          >
            {filteredLevels.length} STAGES
          </span>
        </div>

        <p className="text-xs text-slate-400 font-ui leading-relaxed">
          Challenge community-crafted breakout stages and climb global rankings.
        </p>

        {/* Cyber Search Terminal Input */}
        <div className="relative w-full mt-1">
          <div
            className="flex items-center w-full h-11 px-3.5 rounded-xl transition-all duration-200"
            style={{
              backgroundColor: 'rgba(8, 14, 38, 0.95)',
              border: isSearchFocused
                ? '1.5px solid #00f7ff'
                : '1.5px solid rgba(0, 247, 255, 0.35)',
              boxShadow: isSearchFocused
                ? '0 0 18px rgba(0, 247, 255, 0.4), inset 0 0 8px rgba(0, 247, 255, 0.15)'
                : '0 2px 10px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
            }}
          >
            <Search
              className="w-4 h-4 mr-2.5 flex-shrink-0 transition-colors duration-200"
              style={{ color: isSearchFocused ? '#00f7ff' : '#22d3ee' }}
            />
            <input
              type="text"
              placeholder="Search by Level, ID or Creator..."
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              spellCheck="false"
              autoComplete="off"
              className="w-full text-xs font-tech tracking-wide text-white"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                boxShadow: 'none',
                outline: 'none',
                padding: 0,
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 rounded-md text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all cursor-pointer flex-shrink-0 ml-1"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-1">
          <button
            type="button"
            onClick={() => {
              setFilterMode('all');
              setCurrentPage(1);
            }}
            style={
              filterMode === 'all'
                ? {
                    backgroundColor: 'rgba(0, 247, 255, 0.18)',
                    border: '1.5px solid #00f7ff',
                    color: '#00f7ff',
                    boxShadow: '0 0 14px rgba(0, 247, 255, 0.4)',
                    borderRadius: '10px',
                  }
                : {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    borderRadius: '10px',
                  }
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-tech font-bold transition-all cursor-pointer active:scale-95"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>ALL STAGES</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterMode('popular');
              setCurrentPage(1);
            }}
            style={
              filterMode === 'popular'
                ? {
                    backgroundColor: 'rgba(255, 170, 0, 0.18)',
                    border: '1.5px solid #ffa500',
                    color: '#ffd700',
                    boxShadow: '0 0 14px rgba(255, 170, 0, 0.4)',
                    borderRadius: '10px',
                  }
                : {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1.5px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    borderRadius: '10px',
                  }
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-tech font-bold transition-all cursor-pointer active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
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
        <div
          style={{
            backgroundColor: 'rgba(8, 14, 38, 0.95)',
            border: '1.5px solid rgba(0, 247, 255, 0.25)',
            borderRadius: '16px',
          }}
          className="w-full max-w-sm p-6 flex flex-col items-center text-center gap-3 shadow-lg backdrop-blur-xl mt-4"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,247,255,0.25)]">
            <Search className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-display font-bold text-sm text-white">
              NO STAGES FOUND
            </h3>
            <p className="font-ui text-xs text-slate-400">
              No community levels match "{searchTerm}".
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            style={{
              backgroundColor: 'rgba(0, 247, 255, 0.15)',
              border: '1.5px solid #00f7ff',
              color: '#00f7ff',
              borderRadius: '10px',
            }}
            className="px-4 py-1.5 text-xs font-tech font-bold hover:bg-cyan-500/25 transition-all cursor-pointer"
          >
            CLEAR SEARCH
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 mt-2 font-tech text-xs">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
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
                style={
                  isActive
                    ? {
                        backgroundColor: 'rgba(0, 247, 255, 0.25)',
                        border: '1.5px solid #00f7ff',
                        color: '#00f7ff',
                        boxShadow: '0 0 12px rgba(0, 247, 255, 0.4)',
                        borderRadius: '8px',
                      }
                    : {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1.5px solid rgba(255, 255, 255, 0.12)',
                        color: '#94a3b8',
                        borderRadius: '8px',
                      }
                }
                className="w-8 h-8 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
            }}
            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
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

  const stats = useMemo(() => calculateLevelHp(level.blocks), [level]);

  return (
    <div
      onClick={onClick}
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
      <div className="p-2.5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-tech font-black text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
            {level.name || `Core #${level.id}`}
          </span>
          <span
            style={{
              backgroundColor: 'rgba(0, 247, 255, 0.1)',
              border: '1px solid rgba(0, 247, 255, 0.3)',
              color: '#00f7ff',
            }}
            className="font-tech text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
          >
            #{level.id}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-ui text-slate-400 border-t border-white/10 pt-1.5">
          <span className="flex items-center gap-1 truncate text-slate-300 max-w-[80px]">
            <User className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">@{level.creator}</span>
          </span>
          <span className="text-[9px] font-tech text-cyan-300/90 font-bold">
            {stats.totalHp} HP ({stats.breakableCount})
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
