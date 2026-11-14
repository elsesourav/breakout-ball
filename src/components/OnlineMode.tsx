import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { levelSearchEngine } from '../services/search';
import { Search, Flame, Globe, X, Boxes } from 'lucide-react';
import { ArenaLevelCard } from './arena/ArenaLevelCard';
import { ArenaPagination } from './arena/ArenaPagination';
import { DailyFeaturedBanner } from './arena/DailyFeaturedBanner';

const ITEMS_PER_PAGE = 25;

const SEARCH_TARGETS = [
  'Level Name...',
  'Stage ID...',
  'Creator (elsesourav)...',
];

export const OnlineMode: React.FC = () => {
  const { onlineLevels, localLevels, openPreview } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<'all' | 'popular'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTargetIdx, setSearchTargetIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cycle search target placeholder ticker bottom-to-top
  useEffect(() => {
    const timer = setInterval(() => {
      setSearchTargetIdx((prev) => (prev + 1) % SEARCH_TARGETS.length);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  // Strictly filter out arcade / campaign levels from Global Arena
  const arenaLevels = useMemo(() => {
    return onlineLevels.filter((lvl) => {
      // Exclude numeric arcade level IDs (e.g. '1', '2', ..., '30')
      if (!isNaN(Number(lvl.id))) return false;
      // Exclude any stage whose ID matches local/campaign levels
      if (localLevels.some((local) => local.id === lvl.id)) return false;
      return true;
    });
  }, [onlineLevels, localLevels]);

  const filteredLevels = useMemo(() => {
    let list = levelSearchEngine.search(arenaLevels, searchTerm);
    if (filterMode === 'popular') {
      list = [...list].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    }
    return list;
  }, [arenaLevels, searchTerm, filterMode]);

  const totalPages = Math.max(1, Math.ceil(filteredLevels.length / ITEMS_PER_PAGE));

  const pageLevels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLevels.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLevels, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 py-3.5 gap-3.5 pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* Arena Header Bar */}
      <div className="w-full max-w-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Breakout Ball"
              className="w-4 h-4 rounded-full object-cover shadow-[0_0_8px_#ff4500]"
            />
            <span
              className="font-display font-black text-xs tracking-wider"
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
            className="font-tech text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(0,247,255,0.2)]"
          >
            {filteredLevels.length} STAGES
          </span>
        </div>

        <p className="text-xs text-slate-400 font-ui leading-normal">
          Challenge community-crafted breakout stages and climb global rankings.
        </p>
      </div>

      {/* Sticky Search & Filter Controls */}
      <div
        className="sticky top-0 z-30 w-[calc(100%+1.75rem)] -mx-3.5 px-3.5 flex flex-col items-center pt-2 pb-2.5 -mt-2"
        style={{
          backgroundColor: 'rgba(6, 7, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0, 247, 255, 0.12)',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.75)',
        }}
      >
        <div className="w-full max-w-sm flex flex-col gap-2.5">
          {/* Cyber Search Terminal Input */}
          <div className="relative w-full">
            <div
              className="flex items-center gap-3 w-full h-11 px-4 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: 'rgba(8, 14, 38, 0.95)',
                border: isSearchFocused
                  ? '1.5px solid #00f7ff'
                  : '1.5px solid rgba(0, 247, 255, 0.35)',
                boxShadow: isSearchFocused
                  ? '0 0 16px rgba(0, 247, 255, 0.4), inset 0 0 6px rgba(0, 247, 255, 0.15)'
                  : '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Search
                className="w-4 h-4 flex-shrink-0 transition-colors duration-200"
                style={{ color: isSearchFocused ? '#00f7ff' : '#22d3ee' }}
              />
              <div className="relative flex-1 flex items-center h-full min-w-0">
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  spellCheck="false"
                  autoComplete="off"
                  className="bare-input w-full h-full text-xs py-2 font-tech tracking-wide text-white bg-transparent relative z-10"
                />
                {!searchTerm && (
                  <div className="absolute inset-0 flex items-center pointer-events-none select-none text-xs font-tech text-slate-400 overflow-hidden">
                    <span className="flex-shrink-0 text-slate-400">Search by&nbsp;</span>
                    <div className="relative h-5 overflow-hidden flex items-center">
                      <span
                        key={searchTargetIdx}
                        className="search-ticker-item text-slate-400 font-tech tracking-wide"
                      >
                        {SEARCH_TARGETS[searchTargetIdx]}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all cursor-pointer flex-shrink-0 ml-2 relative z-20"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
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
                      boxShadow: '0 0 12px rgba(0, 247, 255, 0.35)',
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
                      boxShadow: '0 0 12px rgba(255, 170, 0, 0.35)',
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
      </div>

      {/* Daily Featured Challenge Banner (Active on All Stages Page 1) */}
      {!searchTerm && filterMode === 'all' && currentPage === 1 && (
        <DailyFeaturedBanner levels={arenaLevels} />
      )}

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
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
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

      {/* Responsive Cyber Pagination Bar */}
      <ArenaPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLevels.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
