import React, { useEffect, useRef, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { drawLevelPreviewOnCanvas, calculateLevelHp } from '../../utils/helpers';
import { sanitizePortals } from '../../services/db';
import { CyberRankingTable, RankingEntry } from '../leaderboard/CyberRankingTable';
import { formatPilotDisplayName, getPilotAvatarUrl } from '../../constants/mockPilots';
import {
  Play,
  ChevronsRight,
  Home,
  Boxes,
  RotateCcw,
  Shield,
  Zap,
  Check,
  Star,
  Sparkles,
} from 'lucide-react';
import {
  isTodayDailyMission,
  isDailyMissionCompleted,
  getSecondsUntilMidnight,
  formatDailyCountdown,
} from '../../services/dailyApex';
import { cyberToast } from '../common/CyberToast';
import { soundManager } from '../../audio';
import { currencyService } from '../../services/currency';
import { CoreIcon } from '../common/CoreIcon';

export const LevelPreviewModal: React.FC = () => {
  const {
    selectedLevel,
    setSelectedLevel,
    setScreen,
    startPlayLevel,
    localLevels,
    onlineLevels,
    localProgress,
    leaderboards,
    loadingLeaderboardLevelId,
    user,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanSelectedLevel = useMemo(() => selectedLevel ? sanitizePortals(selectedLevel) : null, [selectedLevel]);

  // Redraw canvas with proper buffer resolution matching display aspect ratio
  useEffect(() => {
    if (cleanSelectedLevel && canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = canvas.clientWidth || 340;
      const displayH = canvas.clientHeight || 160;
      canvas.width = Math.round(displayW * dpr);
      canvas.height = Math.round(displayH * dpr);
      const reservedBottom = Math.round(36 * dpr);
      drawLevelPreviewOnCanvas(canvas, cleanSelectedLevel.blocks, canvas.width, canvas.height, {
        reservedBottom,
      });
    }
  }, [cleanSelectedLevel]);

  if (!selectedLevel) return null;

  const isDaily = isTodayDailyMission(selectedLevel.id, onlineLevels);
  const isDailyClaimed = isDaily && isDailyMissionCompleted();
  const progress = localProgress[selectedLevel.id];
  const isCompleted = progress?.completed || isDailyClaimed;

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

  // Prepare clean ranking items with User Name, Username, and User Profile
  const isLeaderboardLoading = loadingLeaderboardLevelId === selectedLevel.id || !leaderboards[selectedLevel.id];
  const rankingList = leaderboards[selectedLevel.id] || [];
  const leaderboardEntries: RankingEntry[] = useMemo(() => {
    const list: RankingEntry[] = rankingList.map((entry, idx) => {
      const isCurr = user.isLoggedIn && entry.username.toLowerCase() === user.username.toLowerCase();
      const userAvatar = isCurr && user.avatarUrl ? user.avatarUrl : entry.avatarUrl;
      const userDisplayName = isCurr && user.fullName ? user.fullName : (entry.displayName || formatPilotDisplayName(entry.username));
      return {
        rank: entry.rank || idx + 1,
        username: entry.username,
        displayName: userDisplayName,
        score: entry.score || Math.round(10000 / Math.max(1, entry.time)),
        time: entry.time,
        isCurrentUser: isCurr,
        avatarUrl: getPilotAvatarUrl(entry.username, userAvatar, idx),
      };
    });

    // If current user has completed this level, ensure user appears in ranking
    if (isCompleted && progress?.bestTime) {
      const userAlreadyInList = list.some((e) => e.isCurrentUser);
      if (!userAlreadyInList) {
        const currentDisplayName = user.isLoggedIn ? (user.fullName || user.username) : 'Anonymous Player';
        const currentUsername = user.isLoggedIn ? user.username : 'Anonymous';
        list.push({
          rank: progress.rank || list.length + 1,
          username: currentUsername,
          displayName: currentDisplayName,
          score: Math.round(10000 / Math.max(1, progress.bestTime)),
          time: progress.bestTime,
          isCurrentUser: true,
          avatarUrl: user.isLoggedIn && user.avatarUrl ? user.avatarUrl : getPilotAvatarUrl(currentUsername, undefined, 0),
        });
        list.sort((a, b) => (typeof a.time === 'number' && typeof b.time === 'number' ? a.time - b.time : 0));
        list.forEach((item, i) => { item.rank = i + 1; });
      }
    }
    return list;
  }, [rankingList, isCompleted, progress, user]);

  const stats = useMemo(() => calculateLevelHp(selectedLevel.blocks), [selectedLevel]);
  const isCampaign = !isNaN(Number(selectedLevel.id));
  const levelNum = isCampaign ? parseInt(selectedLevel.id, 10) : 0;
  const starsEarned = isCampaign
    ? progress?.stars ?? currencyService.getLevelStars(selectedLevel.id)
    : 0;
  const maxCores = isCampaign ? currencyService.getLevelMaxCores(levelNum) : 0;
  const claimedCores = isCampaign
    ? progress?.claimedCores ?? currencyService.getLevelClaimedCores(selectedLevel.id)
    : 0;
  const remainingCores = Math.max(0, maxCores - claimedCores);
  const isArenaClaimed = !isCampaign ? currencyService.isArenaLevelClaimed(selectedLevel.id) : false;

  return (
    <div
      id="showPreview"
      className="active"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedLevel(null);
          setScreen('menu');
        }
      }}
    >
      <div className="rapper">
        {/* Top Header Bar: Logo, Title, Creator & Thick Mode Badge (No Back button needed) */}
        <div className="flex items-center justify-between w-full pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="Breakout Comet"
                className="w-6 h-6 rounded-full object-cover shadow-[0_0_10px_#ff4500]"
              />
              <div className="absolute inset-0 rounded-full border border-orange-400/40 pointer-events-none" />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className="font-display font-black text-sm tracking-wider uppercase truncate"
                style={{ color: '#00f7ff', textShadow: '0 0 10px rgba(0, 247, 255, 0.45)' }}
              >
                {isCampaign ? `LEVEL ${selectedLevel.id}` : selectedLevel.name}
              </span>
              {!isCampaign && selectedLevel.creator && (
                <span className="font-ui text-[11px] text-slate-400 truncate">
                  By @{selectedLevel.creator}
                </span>
              )}
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider bg-cyan-950/80 border border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.25)] flex-shrink-0">
            {isCampaign ? 'Campaign' : 'Community'}
          </span>
        </div>

        {/* Game Canvas Preview Container */}
        <div
          className="relative w-full rounded-xl overflow-hidden border border-cyan-500/30 bg-[#050716] shadow-[0_0_20px_rgba(0,0,0,0.8)] flex-shrink-0"
          style={{ width: '100%', height: '160px', minHeight: '160px' }}
        >
          <canvas
            ref={canvasRef}
            id="preview"
            className="w-full h-full block"
            style={{ width: '100%', height: '160px', display: 'block' }}
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
            </div>
          </div>
        </div>

        {/* Star & Core Progression Bar */}
        {isCampaign ? (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(8, 14, 38, 0.95) 0%, rgba(15, 23, 52, 0.95) 100%)',
              border: '1px solid rgba(0, 247, 255, 0.25)',
              borderRadius: '12px',
              padding: '8px 12px',
            }}
            className="flex items-center justify-between w-full"
          >
            {/* Stars */}
            <div className="flex items-center gap-1.5">
              <span className="font-tech text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                RATING
              </span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={`star-${starIdx}`}
                    className={`w-3.5 h-3.5 ${
                      starIdx <= starsEarned
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700 fill-slate-800/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Core Status */}
            <div className="flex items-center gap-1.5">
              <CoreIcon size={14} glow variant="cyan" />
              <span className="font-tech font-bold text-xs text-cyan-300">
                {claimedCores} / {maxCores}
              </span>
              {remainingCores > 0 ? (
                <span className="font-tech text-[10px] text-amber-300 font-bold">
                  ({remainingCores} left at 3★)
                </span>
              ) : (
                <span className="font-tech text-[10px] text-emerald-400 font-bold">
                  (100% Claimed)
                </span>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(8, 14, 38, 0.95) 0%, rgba(15, 23, 52, 0.95) 100%)',
              border: '1px solid rgba(0, 247, 255, 0.25)',
              borderRadius: '12px',
              padding: '8px 12px',
            }}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-tech text-xs text-slate-300 uppercase tracking-wider font-bold">
                ARENA BOUNTY
              </span>
            </div>
            <span
              className={`font-tech font-bold text-xs ${
                isArenaClaimed ? 'text-slate-400' : 'text-emerald-400'
              }`}
            >
              {isArenaClaimed ? 'COMPLETED (1-TIME ONLY)' : 'UNPLAYED'}
            </span>
          </div>
        )}

        {/* Action Controls: START / REPLAY and HOME */}
        <div className="flex items-center gap-2 w-full mt-0.5">
          {/* 1. START / REPLAY Button */}
          {isDailyClaimed ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playLockTap();
                cyberToast.info(
                  `Daily Mission Completed • Next mission in ${formatDailyCountdown(getSecondsUntilMidnight())}`
                );
              }}
              style={{
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.16)',
                border: '1.5px solid rgba(52, 211, 153, 0.55)',
                boxShadow: '0 0 14px rgba(16, 185, 129, 0.35)',
              }}
              className="flex-1 h-12 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider text-emerald-300 active:scale-[0.98] transition-all cursor-pointer"
              title={`Daily Apex Mission completed for today. Next mission in ${formatDailyCountdown(getSecondsUntilMidnight())}`}
            >
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span style={{ color: '#34d399', fontWeight: 900, letterSpacing: '0.06em' }}>
                COMPLETED TODAY
              </span>
            </button>
          ) : (
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
              className="flex-1 h-12 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider text-white active:scale-[0.98] transition-all cursor-pointer"
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
          )}

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
              className="w-12 h-12 flex items-center justify-center text-black active:scale-[0.98] transition-all cursor-pointer flex-shrink-0"
            >
              <ChevronsRight className="w-5 h-5 stroke-[2.8]" />
            </button>
          )}

          {/* 3. HOME Button: Clicking closes modal and returns to menu */}
          <button
            type="button"
            onClick={() => {
              setSelectedLevel(null);
              setScreen('menu');
            }}
            title="Return to Menu"
            style={{
              borderRadius: '12px',
              backgroundColor: '#1e293b',
              backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1.5px solid #475569',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
            className="w-12 h-12 flex items-center justify-center text-slate-200 hover:text-white active:scale-[0.98] transition-all cursor-pointer flex-shrink-0"
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Players Ranking Component */}
        <div className="w-full mt-0.5">
          <CyberRankingTable
            entries={leaderboardEntries}
            title="CORE RANKINGS"
            currentUser={user.username}
            isLoading={isLeaderboardLoading}
          />
        </div>
      </div>
    </div>
  );
};
