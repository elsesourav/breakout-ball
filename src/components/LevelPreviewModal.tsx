import React, { useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { drawLevelPreviewOnCanvas, calculateLevelHp } from '../utils/helpers';
import { CyberRankingTable, RankingEntry } from './leaderboard/CyberRankingTable';
import {
  Play,
  ChevronsRight,
  Home,
  ArrowLeft,
  Clock,
  Boxes,
  RotateCcw,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

export const LevelPreviewModal: React.FC = () => {
  const {
    selectedLevel,
    setScreen,
    startPlayLevel,
    localLevels,
    localProgress,
    leaderboards,
    user,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw canvas with proper buffer resolution matching display aspect ratio
  useEffect(() => {
    if (selectedLevel && canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = canvas.clientWidth || 320;
      const displayH = canvas.clientHeight || 155;
      canvas.width = Math.round(displayW * dpr);
      canvas.height = Math.round(displayH * dpr);
      drawLevelPreviewOnCanvas(canvas, selectedLevel.blocks, canvas.width, canvas.height);
    }
  }, [selectedLevel]);

  if (!selectedLevel) return null;

  const progress = localProgress[selectedLevel.id];
  const isCompleted = progress?.completed;
  const bestTime = progress?.bestTime ? `${progress.bestTime.toFixed(1)}s` : '--';

  // Determine if next level should be accessible
  // NEXT button ONLY shows when one level is complete; if locked, next level does NOT show
  const currentNum = parseInt(selectedLevel.id, 10);
  const nextLevelData = !isNaN(currentNum)
    ? localLevels.find((l) => l.id === String(currentNum + 1))
    : null;
  const isNextUnlocked = nextLevelData ? localProgress[nextLevelData.id] !== undefined : false;
  const canShowNext = Boolean(isCompleted && isNextUnlocked && nextLevelData);

  const handleNextLevel = () => {
    if (canShowNext && nextLevelData) {
      startPlayLevel(nextLevelData);
    }
  };

  // Prepare clean ranking items
  const rankingList = leaderboards[selectedLevel.id] || leaderboards.default || [];
  const leaderboardEntries: RankingEntry[] = useMemo(() => {
    const list: RankingEntry[] = rankingList.map((entry, idx) => ({
      rank: entry.rank || idx + 1,
      username: entry.username,
      score: Math.round(10000 / Math.max(1, entry.time)),
      time: entry.time,
      isCurrentUser: entry.username === user.username,
    }));

    // If current user has completed this level, ensure user appears in ranking
    if (isCompleted && progress?.bestTime) {
      const userAlreadyInList = list.some((e) => e.isCurrentUser);
      if (!userAlreadyInList) {
        list.push({
          rank: progress.rank || list.length + 1,
          username: user.isLoggedIn ? user.username : 'Anonymous',
          score: Math.round(10000 / Math.max(1, progress.bestTime)),
          time: progress.bestTime,
          isCurrentUser: true,
        });
        list.sort((a, b) => (typeof a.time === 'number' && typeof b.time === 'number' ? a.time - b.time : 0));
        list.forEach((item, i) => { item.rank = i + 1; });
      }
    }
    return list;
  }, [rankingList, isCompleted, progress, user]);

  const stats = useMemo(() => calculateLevelHp(selectedLevel.blocks), [selectedLevel]);
  const isCampaign = !isNaN(Number(selectedLevel.id));

  return (
    <div id="showPreview" className="active">
      <div className="rapper">
        {/* Top Header Bar: Back Button, Title, Mode Pill */}
        <div className="flex items-center justify-between w-full pb-1 border-b border-white/10">
          <button
            type="button"
            onClick={() => setScreen('menu')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 text-slate-200 text-xs font-ui transition-all cursor-pointer"
            aria-label="Back to Campaign"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Back</span>
          </button>

          <div className="flex flex-col items-center">
            <span
              className="font-display font-black text-xs tracking-wider"
              style={{ color: '#00f7ff' }}
            >
              {isCampaign ? `LEVEL ${selectedLevel.id}` : selectedLevel.name}
            </span>
            <span className="font-ui text-[9px] text-slate-400">
              By @{selectedLevel.creator}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full text-[9px] font-tech font-bold uppercase tracking-wider bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            {isCampaign ? 'Campaign' : 'Community'}
          </span>
        </div>

        {/* Compact Game Canvas Preview Container */}
        <div
          className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-[#050716] shadow-[0_0_20px_rgba(0,0,0,0.8)] flex-shrink-0"
          style={{ width: '100%', height: '155px', minHeight: '155px' }}
        >
          <canvas
            ref={canvasRef}
            id="preview"
            className="w-full h-full block"
            style={{ width: '100%', height: '155px', display: 'block' }}
          />

          {/* Bottom HUD Overlay on Canvas */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-3 py-1.5 flex items-center justify-between border-t border-white/10">
            {/* Status */}
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCompleted ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-cyan-400 shadow-[0_0_6px_#00f7ff]'
                }`}
              />
              <span
                className="font-tech font-bold text-[11px] tracking-wide"
                style={{ color: isCompleted ? '#34d399' : '#00f7ff' }}
              >
                {isCompleted ? 'CLEARED' : 'UNLOCKED'}
              </span>
            </div>

            {/* Target Stats: Accurate Total HP & Breakable Count */}
            <div className="flex items-center gap-2.5 font-tech text-xs">
              <div className="flex items-center gap-1" title="Total Level HP">
                <Shield className="w-3 h-3 text-red-400" />
                <span className="font-bold text-red-300">{stats.totalHp} HP</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300" title="Breakable Targets">
                <Boxes className="w-3 h-3 text-purple-400" />
                <span>{stats.breakableCount} Targets</span>
              </div>
              {stats.titaniumCount > 0 && (
                <div className="flex items-center gap-0.5 text-slate-300 text-[11px]" title="Indestructible Titanium Blocks">
                  <span className="text-slate-400 font-bold">∞</span>
                  <span>{stats.titaniumCount}</span>
                </div>
              )}
              {stats.portalCount > 0 && (
                <div className="flex items-center gap-0.5 text-cyan-300 text-[11px]" title="Quantum Portals">
                  <span>🌀</span>
                  <span>{stats.portalCount}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span style={{ color: '#00f7ff', fontWeight: 700 }}>{bestTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls: Compact, Moderate Radius (12px outer, matching inner) */}
        <div className="flex items-center gap-2 w-full mt-1">
          {/* 1. START / REPLAY Button */}
          <button
            type="button"
            onClick={() => startPlayLevel(selectedLevel)}
            style={{
              borderRadius: '12px',
              backgroundColor: '#ff0055',
              backgroundImage: 'linear-gradient(135deg, #ff0844 0%, #ff4b8b 100%)',
              boxShadow: '0 0 16px rgba(255, 8, 68, 0.45)',
              border: '1.5px solid #ff7ebd',
            }}
            className="flex-1 h-11 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider text-white active:scale-[0.98] transition-all cursor-pointer"
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>PLAY AGAIN</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white stroke-[2.5]" />
                <span>START GAME</span>
              </>
            )}
          </button>

          {/* 2. NEXT LEVEL Button: ONLY shows when level is completed AND next level is unlocked */}
          {canShowNext && (
            <button
              type="button"
              onClick={handleNextLevel}
              title="Next Level"
              style={{
                borderRadius: '12px',
                backgroundColor: '#00e5ff',
                backgroundImage: 'linear-gradient(135deg, #00f7ff 0%, #0088cc 100%)',
                boxShadow: '0 0 16px rgba(0, 247, 255, 0.45)',
                border: '1.5px solid #a5f3fc',
              }}
              className="w-11 h-11 flex items-center justify-center text-black active:scale-[0.98] transition-all cursor-pointer flex-shrink-0"
            >
              <ChevronsRight className="w-5 h-5 stroke-[2.8]" />
            </button>
          )}

          {/* 3. HOME Button: Moderate Radius matching others */}
          <button
            type="button"
            onClick={() => setScreen('menu')}
            title="Return to Menu"
            style={{
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1.5px solid #475569',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
            className="w-11 h-11 flex items-center justify-center text-slate-200 hover:text-white active:scale-[0.98] transition-all cursor-pointer flex-shrink-0"
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Players Ranking Component */}
        <div className="w-full mt-1">
          <CyberRankingTable
            entries={leaderboardEntries}
            title="CORE RANKINGS"
            currentUser={user.username}
          />
        </div>
      </div>
    </div>
  );
};
