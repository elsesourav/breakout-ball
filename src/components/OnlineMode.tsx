import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { levelSearchEngine } from '../services/search';
import { Search, Flame, Globe, X, Boxes, Plus } from 'lucide-react';
import { ArenaLevelCard } from './arena/ArenaLevelCard';
import { ArenaPagination } from './arena/ArenaPagination';
import { DailyFeaturedBanner } from './arena/DailyFeaturedBanner';
import { CyberSectionHeader } from './CyberSectionHeader';
import { currencyService } from '../services/currency';
import { CoreIcon } from './CoreIcon';

const ITEMS_PER_PAGE = 25;

const SEARCH_TARGETS = [
  'Level Name...',
  'Stage ID...',
  'Creator (elsesourav)...',
];

export const OnlineMode: React.FC = () => {
  const { onlineLevels, localLevels, openPreview, setActiveTab, user } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<'all' | 'popular'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTargetIdx, setSearchTargetIdx] = useState(0);
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [dailyAvailable, setDailyAvailable] = useState<boolean>(() => currencyService.getDailyCollectStatus().canCollect);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync available cores from currencyService
  useEffect(() => {
    setCores(currencyService.getBalance());
    setDailyAvailable(currencyService.getDailyCollectStatus().canCollect);
    currencyService.load(user.username).then(() => {
      setCores(currencyService.getBalance());
      setDailyAvailable(currencyService.getDailyCollectStatus().canCollect);
    });
  }, [user.username]);

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
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center pt-0 pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* 1. Top Cyber Section Header */}
      <div
        className="w-full flex justify-center bg-[#06081c]/95 backdrop-blur-md shadow-lg"
        style={{
          borderBottom: '1px solid rgba(0, 247, 255, 0.22)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(0, 247, 255, 0.08)',
        }}
      >
        <CyberSectionHeader
          title={user.fullName || user.username.toUpperCase() || 'CYBER PILOT'}
          subtitle={`@${user.username || 'pilot'}`}
          rightSlot={
            <div className="flex items-center gap-2 flex-shrink-0">
              {dailyAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('armory');
                    if (typeof window !== 'undefined') {
                      window.history.pushState(null, '', '/shop');
                      window.dispatchEvent(new CustomEvent('open-core-shop'));
                    }
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-500/35 to-amber-500/25 border border-amber-400 text-amber-300 font-tech font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                  title="Claim 50 Free Cores in Armory Shop"
                >
                  <span className="text-xs">🎁</span>
                  <span className="tracking-wider">FREE 50</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab('armory');
                  if (typeof window !== 'undefined') {
                    window.history.pushState(null, '', '/shop');
                    window.dispatchEvent(new CustomEvent('open-core-shop'));
                  }
                }}
                title="View Cores & Shop"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
                  border: '1.2px solid rgba(0, 247, 255, 0.45)',
                  boxShadow: '0 0 12px rgba(0, 247, 255, 0.25)',
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(0,247,255,0.4)] active:scale-95 group transition-all"
              >
                <CoreIcon size={15} glow variant="cyan" className="group-hover:rotate-12 transition-transform" />
                <span className="font-tech font-bold text-xs text-cyan-200">
                  {cores.toLocaleString()}
                </span>
                <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
                  CORES
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 border border-cyan-400/60 text-cyan-300 flex items-center justify-center text-[10px] font-bold group-hover:bg-cyan-400 group-hover:text-black transition-colors ml-0.5">
                  +
                </span>
              </button>
            </div>
          }
        />
      </div>

      {/* Sticky Full-Width Search & Filter Controls */}
      <div
        className="sticky top-0 z-30 w-full flex flex-col items-center pt-3.5 pb-3.5 mb-4"
        style={{
          width: '100%',
          backgroundColor: '#06081c',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 247, 255, 0.18)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="w-full max-w-sm px-4 sm:px-5 flex flex-col gap-3">
          {/* Cyber Search Terminal Input */}
          <div className="relative w-full">
            <div
              className="flex items-center gap-3 w-full h-11 px-4 rounded-xl transition-all duration-200"
              style={{
                backgroundColor: 'rgba(8, 14, 38, 0.85)',
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
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full">
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-tech font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-tech font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>TOP PLAYED</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              style={{
                backgroundColor: 'rgba(139, 92, 246, 0.22)',
                border: '1.5px solid #a855f7',
                color: '#d8b4fe',
                boxShadow: '0 0 12px rgba(168, 85, 247, 0.35)',
                borderRadius: '10px',
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-tech font-bold transition-all cursor-pointer active:scale-95 hover:brightness-110 ml-auto whitespace-nowrap shrink-0"
              title="Open Arena Studio to build custom community stages"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ADD ARENA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Featured Challenge Banner (Active on All Stages Page 1) */}
      {!searchTerm && filterMode === 'all' && currentPage === 1 && (
        <div className="w-full max-w-sm px-4 sm:px-5 mb-3.5">
          <DailyFeaturedBanner levels={arenaLevels} />
        </div>
      )}

      {/* Arena Levels Grid */}
      <div className="w-full max-w-sm px-4 sm:px-5 grid grid-cols-2 gap-3 mb-4">
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
        <div className="w-full max-w-sm px-4 sm:px-5 mb-4">
          <div
            style={{
              backgroundColor: 'rgba(8, 14, 38, 0.95)',
              border: '1.5px solid rgba(0, 247, 255, 0.25)',
              borderRadius: '16px',
            }}
            className="w-full p-6 flex flex-col items-center text-center gap-3 shadow-lg backdrop-blur-xl"
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
        </div>
      )}

      {/* Responsive Cyber Pagination Bar */}
      <div className="w-full max-w-sm px-4 sm:px-5 flex justify-center">
        <ArenaPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLevels.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
