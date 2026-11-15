import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Flame, Zap } from 'lucide-react';
import { CoreIcon } from '../CoreIcon';

interface ScoreLeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  coresCleared: number;
  badgeTitle: string;
  isCurrentUser?: boolean;
}

const GLOBAL_PILOTS: Omit<ScoreLeaderboardEntry, 'rank'>[] = [
  { username: 'elsesourav', score: 348200, coresCleared: 30, badgeTitle: 'Apex Sovereign' },
  { username: 'speedy_sam', score: 312500, coresCleared: 30, badgeTitle: 'Quantum Pilot' },
  { username: 'arcade_queen', score: 284100, coresCleared: 29, badgeTitle: 'Hyper Striker' },
  { username: 'breakout_pro', score: 251600, coresCleared: 28, badgeTitle: 'Void Breaker' },
  { username: 'cyber_ninja', score: 226900, coresCleared: 26, badgeTitle: 'Matrix Ace' },
  { username: 'neon_striker', score: 198400, coresCleared: 24, badgeTitle: 'Neon Phantom' },
  { username: 'quantum_ace', score: 172800, coresCleared: 21, badgeTitle: 'Core Breaker' },
  { username: 'hyper_dash', score: 149300, coresCleared: 18, badgeTitle: 'Challenger' },
  { username: 'retro_pilot', score: 124500, coresCleared: 15, badgeTitle: 'Cadet Striker' },
  { username: 'nova_cadet', score: 98200, coresCleared: 12, badgeTitle: 'Rookie Pilot' },
  { username: 'pixel_master', score: 87400, coresCleared: 11, badgeTitle: 'Arcade Cadet' },
  { username: 'laser_runner', score: 76100, coresCleared: 10, badgeTitle: 'Laser Scout' },
  { username: 'void_walker', score: 65900, coresCleared: 9, badgeTitle: 'Void Runner' },
  { username: 'solar_flare', score: 54300, coresCleared: 8, badgeTitle: 'Star Cadet' },
  { username: 'crypto_striker', score: 42100, coresCleared: 6, badgeTitle: 'Sector Scout' },
  { username: 'echo_pulse', score: 33800, coresCleared: 5, badgeTitle: 'Pulse Cadet' },
  { username: 'zero_gravity', score: 25400, coresCleared: 4, badgeTitle: 'Orbit Trainee' },
  { username: 'plasma_storm', score: 18200, coresCleared: 3, badgeTitle: 'Novice Pilot' },
  { username: 'nebula_rider', score: 12500, coresCleared: 2, badgeTitle: 'Trainee' },
  { username: 'omega_cadet', score: 7800, coresCleared: 1, badgeTitle: 'Recruit' },
];

const WEEKLY_PILOTS: Omit<ScoreLeaderboardEntry, 'rank'>[] = [
  { username: 'speedy_sam', score: 142100, coresCleared: 22, badgeTitle: 'Weekly Ace' },
  { username: 'elsesourav', score: 138600, coresCleared: 21, badgeTitle: 'Weekly Legend' },
  { username: 'cyber_ninja', score: 119400, coresCleared: 19, badgeTitle: 'Weekly Champion' },
  { username: 'arcade_queen', score: 104200, coresCleared: 17, badgeTitle: 'Challenger' },
  { username: 'breakout_pro', score: 92800, coresCleared: 15, badgeTitle: 'Core Striker' },
  { username: 'neon_striker', score: 81500, coresCleared: 13, badgeTitle: 'Rookie' },
  { username: 'quantum_ace', score: 71200, coresCleared: 11, badgeTitle: 'Weekly Scout' },
  { username: 'hyper_dash', score: 58900, coresCleared: 9, badgeTitle: 'Weekly Cadet' },
  { username: 'retro_pilot', score: 44200, coresCleared: 7, badgeTitle: 'Sector Runner' },
  { username: 'nova_cadet', score: 31000, coresCleared: 5, badgeTitle: 'Recruit' },
  { username: 'laser_runner', score: 21500, coresCleared: 3, badgeTitle: 'Trainee' },
  { username: 'solar_flare', score: 12800, coresCleared: 2, badgeTitle: 'Novice' },
];

export const OverallScoreLeaderboard: React.FC = () => {
  const { user, localProgress } = useGame();
  const [activeTab, setActiveTab] = useState<'alltime' | 'weekly'>('alltime');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Trigger high-tech skeleton loading state on mount and tab switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabChange = (tab: 'alltime' | 'weekly') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  // Compute player's actual score from completed campaign cores
  const userStats = useMemo(() => {
    let completedCores = 0;
    let baseScore = 0;

    Object.values(localProgress).forEach((p) => {
      if (p.completed) {
        completedCores++;
        const timeBonus = p.bestTime ? Math.max(0, Math.round((60 - p.bestTime) * 80)) : 1200;
        baseScore += 8500 + timeBonus;
      }
    });

    return {
      completedCores,
      score: baseScore,
      username: user.isLoggedIn ? (user.username || 'pilot') : 'you',
    };
  }, [localProgress, user]);

  // Merge current user into rankings sorted strictly by Score
  const rankedList = useMemo(() => {
    const rawList = activeTab === 'alltime' ? GLOBAL_PILOTS : WEEKLY_PILOTS;

    const filtered = rawList.filter(
      (p) => p.username.toLowerCase() !== userStats.username.toLowerCase()
    );

    filtered.push({
      username: userStats.username,
      score: userStats.score,
      coresCleared: userStats.completedCores,
      badgeTitle:
        userStats.completedCores >= 25
          ? 'Apex Legend'
          : userStats.completedCores >= 10
          ? 'Veteran Pilot'
          : 'Cadet Pilot',
      isCurrentUser: true,
    });

    filtered.sort((a, b) => b.score - a.score);

    return filtered.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [activeTab, userStats]);

  const currentUserRank = rankedList.find((p) => p.isCurrentUser);

  return (
    <div
      style={{
        backgroundColor: 'rgba(8, 12, 36, 0.94)',
        border: '1.5px solid rgba(0, 247, 255, 0.28)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55), 0 0 20px rgba(0, 247, 255, 0.12)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="w-full h-full overflow-hidden backdrop-blur-xl"
    >
      {/* 1. Header Bar: Trophy Icon, Title & Compact Tab Toggle */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-cyan-500/20 bg-cyan-950/20 flex-shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)] flex-shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-tech text-[9px] font-bold text-cyan-400 tracking-wider">
                SCORE
              </span>
              <h3 className="font-display font-bold text-[11.5px] text-white tracking-wide whitespace-nowrap">
                LEADERBOARD
              </h3>
            </div>
            <span className="font-ui text-[9px] text-slate-400 tracking-normal leading-none mt-1 whitespace-nowrap">
              Global Pilot Rankings
            </span>
          </div>
        </div>

        {/* Tab Toggle: All-Time vs Weekly (Never wraps) */}
        <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-cyan-500/30 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('alltime')}
            style={{
              whiteSpace: 'nowrap',
              ...(activeTab === 'alltime'
                ? {
                    background:
                      'linear-gradient(135deg, rgba(0, 247, 255, 0.28) 0%, rgba(0, 136, 204, 0.38) 100%)',
                    border: '1px solid #00f7ff',
                    color: '#00f7ff',
                    boxShadow: '0 0 10px rgba(0, 247, 255, 0.35)',
                  }
                : {
                    color: '#94a3b8',
                    border: '1px solid transparent',
                    background: 'transparent',
                  }),
            }}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-tech font-bold text-[9px] sm:text-[9.5px] tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            ALL-TIME
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('weekly')}
            style={{
              whiteSpace: 'nowrap',
              ...(activeTab === 'weekly'
                ? {
                    background:
                      'linear-gradient(135deg, rgba(0, 247, 255, 0.28) 0%, rgba(0, 136, 204, 0.38) 100%)',
                    border: '1px solid #00f7ff',
                    color: '#00f7ff',
                    boxShadow: '0 0 10px rgba(0, 247, 255, 0.35)',
                  }
                : {
                    color: '#94a3b8',
                    border: '1px solid transparent',
                    background: 'transparent',
                  }),
            }}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-tech font-bold text-[9px] sm:text-[9.5px] tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            WEEKLY
          </button>
        </div>
      </div>

      {/* 2. Column Headers: RANK | PILOT | CORES | SCORE (Strictly no time column) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 55px 75px',
          alignItems: 'center',
          backgroundColor: 'rgba(5, 8, 22, 0.85)',
        }}
        className="px-3.5 py-2 text-[10px] font-tech text-slate-400 border-b border-cyan-500/15 uppercase tracking-wider flex-shrink-0"
      >
        <span className="text-center font-bold">RANK</span>
        <span className="text-left pl-1 font-bold">PILOT</span>
        <span className="text-center font-bold flex items-center justify-center gap-1">
          <CoreIcon size={11} glow variant="cyan" />
          CORES
        </span>
        <span className="text-right font-bold pr-2">SCORE</span>
      </div>

      {/* 3. Skeleton Loading State or Ranking Rows List */}
      {isLoading ? (
        /* Cyberpunk Skeleton Loader with Shimmer Wave (No scrollbar) */
        <div
          className="flex-1 overflow-y-auto divide-y divide-cyan-500/10 no-scrollbar"
          data-inner-scroll="true"
        >
          {[...Array(6)].map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 55px 75px',
                alignItems: 'center',
              }}
              className="px-3.5 py-3 transition-colors"
            >
              {/* Rank Placeholder */}
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 rounded-md cyber-shimmer-box" />
              </div>

              {/* Pilot Placeholder */}
              <div className="flex items-center gap-2 pl-1 min-w-0">
                <div className="w-6 h-6 rounded-full cyber-shimmer-box flex-shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <div
                    className="h-2.5 rounded cyber-shimmer-box"
                    style={{ width: `${60 + (idx % 3) * 15}%` }}
                  />
                  <div className="h-2 w-16 rounded cyber-shimmer-box opacity-60" />
                </div>
              </div>

              {/* Cores Cleared Placeholder */}
              <div className="flex items-center justify-center">
                <div className="h-2.5 w-7 rounded cyber-shimmer-box" />
              </div>

              {/* Score Placeholder (No PTS label box) */}
              <div className="flex justify-end pr-2">
                <div className="h-3 w-12 rounded cyber-shimmer-box" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Real Rankings Rows List (Independently Scrollable, No scrollbar) */
        <div
          className="flex-1 overflow-y-auto divide-y divide-cyan-500/10 no-scrollbar"
          data-inner-scroll="true"
        >
          {rankedList.slice(0, 20).map((entry) => {
            const isUser = entry.isCurrentUser;
            const isRank1 = entry.rank === 1;
            const isRank2 = entry.rank === 2;
            const isRank3 = entry.rank === 3;

            let rankBadge = (
              <span
                className={`font-tech font-bold text-xs ${
                  isUser ? 'text-cyan-300 font-black' : 'text-slate-400'
                }`}
              >
                #{entry.rank}
              </span>
            );

            if (isRank1) {
              rankBadge = (
                <div
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: '1.5px solid #ffd700',
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.55)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 1 - Gold Apex"
                >
                  <Flame className="w-3 h-3 text-amber-300 fill-amber-400 drop-shadow-[0_0_6px_#ffd700]" />
                  <span className="font-display font-black text-xs text-yellow-200">1</span>
                </div>
              );
            } else if (isRank2) {
              rankBadge = (
                <div
                  style={{
                    background:
                      'radial-gradient(circle, rgba(203, 213, 225, 0.3) 0%, rgba(148, 163, 184, 0.1) 100%)',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 0 10px rgba(203, 213, 225, 0.45)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 2 - Silver Titan"
                >
                  <span className="font-display font-black text-xs text-slate-200">2</span>
                </div>
              );
            } else if (isRank3) {
              rankBadge = (
                <div
                  style={{
                    background:
                      'radial-gradient(circle, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.1) 100%)',
                    border: '1.5px solid #f59e0b',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.45)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 3 - Bronze Vanguard"
                >
                  <span className="font-display font-black text-xs text-amber-300">3</span>
                </div>
              );
            }

            return (
              <div
                key={entry.username}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 55px 75px',
                  alignItems: 'center',
                  backgroundColor: isUser
                    ? 'rgba(0, 247, 255, 0.12)'
                    : isRank1
                    ? 'rgba(255, 215, 0, 0.04)'
                    : 'transparent',
                  borderLeft: isUser
                    ? '3px solid #00f7ff'
                    : isRank1
                    ? '3px solid #ffd700'
                    : '3px solid transparent',
                }}
                className="px-3.5 py-2.5 transition-colors hover:bg-white/[0.03]"
              >
                {/* Rank */}
                <div className="flex items-center justify-center">{rankBadge}</div>

                {/* Pilot */}
                <div className="flex items-center gap-2 pl-1 min-w-0">
                  <div
                    style={
                      isUser
                        ? {
                            background: 'linear-gradient(135deg, #00f7ff 0%, #3b82f6 100%)',
                            boxShadow: '0 0 8px rgba(0, 247, 255, 0.45)',
                            color: '#000000',
                          }
                        : undefined
                    }
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-tech font-bold flex-shrink-0 ${
                      isUser
                        ? 'font-black'
                        : isRank1
                        ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                        : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {isUser ? 'Y' : entry.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0 truncate">
                    {isUser ? (
                      <span
                        className="font-tech font-black text-xs tracking-wider text-cyan-300 flex items-center gap-1 leading-tight"
                        style={{ textShadow: '0 0 8px rgba(0, 247, 255, 0.6)' }}
                      >
                        <span>You</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse" />
                      </span>
                    ) : (
                      <span
                        className={`font-tech text-xs truncate leading-tight ${
                          isRank1 ? 'font-bold text-yellow-300' : 'font-medium text-white'
                        }`}
                      >
                        @{entry.username}
                      </span>
                    )}
                    <span className="text-[9px] font-ui text-slate-400 truncate">
                      {entry.badgeTitle}
                    </span>
                  </div>
                </div>

                {/* Cores Cleared */}
                <div className="text-center font-tech text-xs text-slate-300">
                  <span className="font-bold text-white">{entry.coresCleared}</span>
                  <span className="text-[10px] text-slate-500">/30</span>
                </div>

                {/* Score (Clean number without repeating PTS in every row) */}
                <div className="text-right pr-2">
                  <span
                    className={`font-tech font-bold text-xs tracking-wider ${
                      isUser
                        ? 'text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]'
                        : isRank1
                        ? 'text-amber-300 font-extrabold'
                        : 'text-white'
                    }`}
                  >
                    {entry.score >= 1000 ? `${(entry.score / 1000).toFixed(1)}k` : entry.score}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Player Rank Summary (Skeleton or Real) */}
      {isLoading ? (
        <div className="px-3.5 py-2.5 border-t border-cyan-500/25 bg-[#05081c] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-24 h-5 rounded-full cyber-shimmer-box" />
            <div className="w-16 h-4 rounded-md cyber-shimmer-box" />
          </div>
          <div className="w-20 h-4 rounded-md cyber-shimmer-box" />
        </div>
      ) : currentUserRank ? (
        <div className="px-3.5 py-2.5 border-t border-cyan-500/25 bg-[#05081c] flex items-center justify-between text-xs font-tech flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold text-[10px]">
              YOUR STANDING
            </span>
            <span className="text-white font-bold">
              Rank #{currentUserRank.rank}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-300 font-black">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentUserRank.score.toLocaleString()} PTS</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
