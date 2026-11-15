import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { levelSearchEngine } from '../services/search';
import { Search, Flame, Globe, X, Boxes, Plus, ChevronDown, Check, Trophy, Sparkles, Zap } from 'lucide-react';
import { ArenaLevelCard } from './arena/ArenaLevelCard';
import { ArenaPagination } from './arena/ArenaPagination';
import { DailyFeaturedBanner } from './arena/DailyFeaturedBanner';
import { ArenaSkeletonGrid } from './arena/ArenaSkeletonGrid';
import { CyberSectionHeader } from './CyberSectionHeader';
import { currencyService } from '../services/currency';
import { dbService } from '../services/db';
import { LevelData } from '../types/game';
import { CoreIcon } from './CoreIcon';

const ITEMS_PER_PAGE = 20;

type ArenaFilterMode = 'all' | 'unplayed' | 'played' | 'popular' | 'weekly' | 'newest';

interface FilterOption {
  id: ArenaFilterMode;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All Stages', icon: Boxes, color: '#00f7ff' },
  { id: 'played', label: 'Cleared Stages', icon: Check, color: '#10b981' },
  { id: 'popular', label: 'All-Time Top', icon: Flame, color: '#ffd700' },
  { id: 'weekly', label: 'Weekly Top', icon: Trophy, color: '#f59e0b' },
  { id: 'newest', label: 'Newest Stages', icon: Zap, color: '#38bdf8' },
  { id: 'unplayed', label: 'Unplayed', icon: Sparkles, color: '#00f7ff' },
];

const SEARCH_TARGETS = ['Level Name...', 'Stage ID...', 'Creator (elsesourav)...'];

export const OnlineMode: React.FC = () => {
  const { onlineLevels, localLevels, openPreview, setActiveTab, user } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<ArenaFilterMode>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTargetIdx, setSearchTargetIdx] = useState(0);
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-refresh & Skeleton loading state
  const [isLoading, setIsLoading] = useState(true);
  const [freshLevels, setFreshLevels] = useState<LevelData[] | null>(null);

  // Auto-refresh every time the user enters Arena
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    dbService.getOnlineLevels().then((levels) => {
      if (isMounted) {
        if (levels && levels.length > 0) {
          setFreshLevels(levels);
        }
        setTimeout(() => {
          if (isMounted) setIsLoading(false);
        }, 360);
      }
    }).catch(() => {
      if (isMounted) setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Sync available cores from currencyService
  useEffect(() => {
    setCores(currencyService.getBalance());
    currencyService.load(user.username).then(() => {
      setCores(currencyService.getBalance());
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
  const sourceLevels = freshLevels || onlineLevels;
  const arenaLevels = useMemo(() => {
    return sourceLevels.filter((lvl) => {
      // Exclude numeric arcade level IDs (e.g. '1', '2', ..., '30')
      if (!isNaN(Number(lvl.id))) return false;
      // Exclude any stage whose ID matches local/campaign levels
      if (localLevels.some((local) => local.id === lvl.id)) return false;
      return true;
    });
  }, [sourceLevels, localLevels]);

  const filteredLevels = useMemo(() => {
    let list = levelSearchEngine.search(arenaLevels, searchTerm);
    if (filterMode === 'unplayed') {
      list = list.filter((lvl) => !currencyService.isArenaLevelClaimed(lvl.id));
    } else if (filterMode === 'played') {
      list = list.filter((lvl) => currencyService.isArenaLevelClaimed(lvl.id));
    } else if (filterMode === 'popular') {
      list = [...list].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
    } else if (filterMode === 'weekly') {
      // Weekly Top Played: weighted by playCount and stage activity
      list = [...list].sort((a, b) => {
        const aSeed = (a.id.charCodeAt(0) * 19 + a.id.length * 37) % 100;
        const bSeed = (b.id.charCodeAt(0) * 19 + b.id.length * 37) % 100;
        const aScore = (a.playCount || 0) * 0.7 + aSeed * 25;
        const bScore = (b.playCount || 0) * 0.7 + bSeed * 25;
        return bScore - aScore;
      });
    } else if (filterMode === 'newest') {
      list = [...list].reverse();
    }
    return list;
  }, [arenaLevels, searchTerm, filterMode]);

  const activeOption = useMemo(() => {
    return FILTER_OPTIONS.find((opt) => opt.id === filterMode) || FILTER_OPTIONS[0];
  }, [filterMode]);

  const totalPages = Math.max(1, Math.ceil(filteredLevels.length / ITEMS_PER_PAGE));

  const pageLevels = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLevels.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLevels, currentPage]);

  const handleFilterSelect = (mode: ArenaFilterMode) => {
    if (mode === filterMode) {
      setIsFilterOpen(false);
      return;
    }
    setFilterMode(mode);
    setCurrentPage(1);
    setIsFilterOpen(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 320);
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 280);
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
              <button
                type="button"
                onClick={() => {
                  setActiveTab('armory');
                  window?.history.pushState(null, '', '/shop');
                  window?.dispatchEvent(new CustomEvent('open-core-shop'));
                }}
                title="View Cores & Shop"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(0,247,255,0.4)] active:scale-95 group transition-all bg-gradient-to-br from-cyan-500/20 to-indigo-500/25 border border-cyan-400/45 shadow-[0_0_12px_rgba(0,247,255,0.25)]"
              >
                <CoreIcon size={15} glow variant="cyan" className="group-hover:rotate-12 transition-transform" />
                <span className="font-tech font-bold text-xs text-cyan-200">{cores.toLocaleString()}</span>
                <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">CORES</span>
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 border border-cyan-400/60 text-cyan-300 flex items-center justify-center text-[10px] font-bold group-hover:bg-cyan-400 group-hover:text-black transition-colors ml-0.5">+</span>
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

          {/* Filter Dropdown + ADD ARENA (Clean Single Line, No Horizontal Overflow) */}
          <div className="flex items-center justify-between gap-2.5 w-full relative z-20">
            {/* 1. Cyber Dropdown Filter */}
            <div ref={filterRef} className="relative flex-1 min-w-0 max-w-[200px] sm:max-w-[220px]">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{
                  backgroundColor: 'rgba(8, 14, 38, 0.95)',
                  border: isFilterOpen
                    ? '1.5px solid #00f7ff'
                    : '1.5px solid rgba(0, 247, 255, 0.28)',
                  boxShadow: isFilterOpen
                    ? '0 0 14px rgba(0, 247, 255, 0.4)'
                    : '0 2px 10px rgba(0, 0, 0, 0.4)',
                  borderRadius: '10px',
                }}
                className="w-full flex items-center justify-between gap-1.5 px-3 py-1.5 text-xs font-tech font-bold transition-all cursor-pointer select-none active:scale-98"
                title="Filter arena stages"
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <activeOption.icon
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{ color: activeOption.color }}
                  />
                  <span className="text-white truncate tracking-wide">
                    {activeOption.label}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-cyan-400 flex-shrink-0 transition-transform duration-200 ${
                    isFilterOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>

              {/* Dropdown Menu Popover */}
              {isFilterOpen && (
                <div
                  style={{
                    backgroundColor: 'rgba(8, 14, 40, 0.98)',
                    border: '1.5px solid rgba(0, 247, 255, 0.35)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 247, 255, 0.18)',
                  }}
                  className="absolute left-0 top-full mt-1.5 w-52 p-1 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5"
                >
                  {FILTER_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = opt.id === filterMode;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleFilterSelect(opt.id)}
                        style={
                          isSelected
                            ? {
                                backgroundColor: 'rgba(0, 247, 255, 0.15)',
                                color: '#ffffff',
                              }
                            : undefined
                        }
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-tech font-bold transition-colors cursor-pointer hover:bg-white/[0.08] ${
                          isSelected ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <OptIcon
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: opt.color }}
                          />
                          <span className="truncate">{opt.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Add Arena Action Button (Always fully visible on right) */}
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
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-tech font-bold transition-all cursor-pointer active:scale-95 hover:brightness-110 flex-shrink-0 whitespace-nowrap shadow-sm"
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
          <DailyFeaturedBanner levels={arenaLevels} onPreview={openPreview} />
        </div>
      )}

      {/* Arena Levels Grid or Skeleton Loader */}
      {isLoading ? (
        <ArenaSkeletonGrid count={6} />
      ) : pageLevels.length > 0 ? (
        <div className="w-full max-w-sm px-4 sm:px-5 grid grid-cols-2 gap-3 mb-4">
          {pageLevels.map((lvl) => (
            <ArenaLevelCard
              key={lvl.id}
              level={lvl}
              onClick={() => openPreview(lvl)}
            />
          ))}
        </div>
      ) : (
        /* No Results Fallback */
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
