import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Flame, Zap } from 'lucide-react';
import { CoreIcon } from '../CoreIcon';
import { backendApi } from '../../services/backendApi';
import { getOverallLeaderboard } from '../../services/db';
import { FALLBACK_GLOBAL_PILOTS, FALLBACK_WEEKLY_PILOTS } from '../../constants/mockPilots';
import { PilotAvatar } from './PilotAvatar';

interface ScoreLeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  coresCleared: number;
  badgeTitle: string;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

const getDemoAvatarUrl = (username: string, index: number): string => {
  const styles = ['bottts', 'pixel-art', 'bottts', 'identicon', 'pixel-art'];
  const style = styles[index % styles.length];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(username)}&size=32`;
};

export const OverallScoreLeaderboard: React.FC = () => {
  const { user, localProgress } = useGame();
  const [activeTab, setActiveTab] = useState<'alltime' | 'weekly'>('alltime');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [livePilots, setLivePilots] = useState<ScoreLeaderboardEntry[]>([]);

  // Fetch real database records from backend microservice, with Firestore fallback
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadData() {
      try {
        if (activeTab === 'alltime') {
          const res = await backendApi.getGlobalLeaderboard(12);
          if (isMounted && res && res.length > 0) {
            const mapped: ScoreLeaderboardEntry[] = res.slice(0, 12).map((e, idx) => ({
              rank: e.rank || idx + 1,
              username: e.username,
              score: e.totalScore || e.score || 0,
              coresCleared: e.levelsCompleted || 0,
              badgeTitle: (e.levelsCompleted || 0) >= 50 ? 'Apex Legend' : (e.levelsCompleted || 0) >= 30 ? 'Void Master' : (e.levelsCompleted || 0) >= 15 ? 'Core Crusher' : 'Sector Pilot',
              avatarUrl: e.avatarUrl || getDemoAvatarUrl(e.username, idx),
            }));
            setLivePilots(mapped);
            setIsLoading(false);
            return;
          }

          const firestoreData = await getOverallLeaderboard();
          if (isMounted && firestoreData && firestoreData.length > 0) {
            const mapped: ScoreLeaderboardEntry[] = firestoreData.slice(0, 12).map((e: any, idx: number) => ({
              rank: e.rank || idx + 1,
              username: e.username,
              score: e.totalScore || e.score || 0,
              coresCleared: e.levelsCompleted || e.coresCleared || 0,
              badgeTitle: e.badgeTitle || ((e.levelsCompleted || 0) >= 30 ? 'Grandmaster' : 'Sector Pilot'),
              avatarUrl: e.avatarUrl || getDemoAvatarUrl(e.username, idx),
            }));
            setLivePilots(mapped);
            setIsLoading(false);
            return;
          }
        } else {
          const res = await backendApi.getWeeklyLeaderboard(12);
          if (isMounted && res && res.length > 0) {
            const mapped: ScoreLeaderboardEntry[] = res.slice(0, 12).map((e, idx) => ({
              rank: e.rank || idx + 1,
              username: e.username,
              score: e.totalScore || e.score || 0,
              coresCleared: e.levelsCompleted || 0,
              badgeTitle: 'Weekly Contender',
              avatarUrl: e.avatarUrl || getDemoAvatarUrl(e.username, idx),
            }));
            setLivePilots(mapped);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[Leaderboard] Fetch error, using fallback:', err);
      }

      if (isMounted) {
        const fallback = activeTab === 'alltime' ? FALLBACK_GLOBAL_PILOTS : FALLBACK_WEEKLY_PILOTS;
        setLivePilots(
          fallback.map((p, idx) => ({
            ...p,
            rank: idx + 1,
            avatarUrl: p.avatarUrl || getDemoAvatarUrl(p.username, idx),
          }))
        );
        setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
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

    const username = user.isLoggedIn ? (user.username || 'pilot') : 'you';
    const avatarUrl = user.isLoggedIn && user.avatarUrl
      ? user.avatarUrl
      : getDemoAvatarUrl(username, 0);

    return {
      completedCores,
      score: baseScore,
      username,
      avatarUrl,
    };
  }, [localProgress, user]);

  // Merge current user into rankings sorted strictly by Score
  const rankedList = useMemo(() => {
    const filtered = livePilots.filter(
      (p) => p.username.toLowerCase() !== userStats.username.toLowerCase()
    );

    filtered.push({
      username: userStats.username,
      score: userStats.score,
      coresCleared: userStats.completedCores,
      badgeTitle:
        userStats.completedCores >= 50
          ? 'Apex Legend'
          : userStats.completedCores >= 30
          ? 'Void Master'
          : userStats.completedCores >= 15
          ? 'Veteran Pilot'
          : 'Cadet Pilot',
      avatarUrl: userStats.avatarUrl,
      isCurrentUser: true,
      rank: 999,
    });

    filtered.sort((a, b) => b.score - a.score);

    return filtered.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [livePilots, userStats]);

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
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-cyan-500/20 bg-cyan-950/20 flex-shrink-0 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          <div className="w-6.5 h-6.5 rounded-lg bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)] flex-shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex flex-col min-w-0 truncate">
            <h3 className="font-display font-bold text-xs text-white tracking-wider truncate leading-tight">
              TOP PILOTS
            </h3>
            <span className="font-ui text-[9px] text-slate-400 tracking-normal leading-none mt-0.5 truncate">
              Global Database Rankings
            </span>
          </div>
        </div>

        {/* Tab Toggle: All-Time vs Weekly */}
        <div className="flex items-center p-0.5 rounded-lg bg-black/60 border border-cyan-500/30 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('alltime')}
            style={{
              whiteSpace: 'nowrap',
              ...(activeTab === 'alltime'
                ? {
                    background: 'linear-gradient(135deg, rgba(0, 247, 255, 0.28) 0%, rgba(0, 136, 204, 0.38) 100%)',
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
            className="px-2 py-0.5 rounded-md font-tech font-bold text-[9px] tracking-wider transition-all cursor-pointer whitespace-nowrap"
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
                    background: 'linear-gradient(135deg, rgba(0, 247, 255, 0.28) 0%, rgba(0, 136, 204, 0.38) 100%)',
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
            className="px-2 py-0.5 rounded-md font-tech font-bold text-[9px] tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            WEEKLY
          </button>
        </div>
      </div>

      {/* 2. Column Headers: RANK | PILOT | CORES | SCORE */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 44px 54px',
          alignItems: 'center',
          backgroundColor: 'rgba(5, 8, 22, 0.85)',
        }}
        className="px-3.5 py-2 text-[10px] font-tech text-slate-400 border-b border-cyan-500/15 uppercase tracking-wider flex-shrink-0"
      >
        <span className="text-center font-bold">RANK</span>
        <span className="text-left pl-1 font-bold">PILOT</span>
        <span className="text-center font-bold flex items-center justify-center gap-0.5">
          <CoreIcon size={10} glow variant="cyan" />
          CORES
        </span>
        <span className="text-right font-bold pr-1">SCORE</span>
      </div>

      {/* 3. Skeleton Loading State or Ranking Rows List */}
      {isLoading ? (
        <div className="flex-1 overflow-y-auto divide-y divide-cyan-500/10 no-scrollbar py-2" data-inner-scroll="true">
          {[...Array(7)].map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 44px 54px',
                alignItems: 'center',
              }}
              className="px-3.5 py-2 transition-colors"
            >
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 rounded-md cyber-shimmer-box" />
              </div>
              <div className="flex items-center gap-1.5 pl-0.5 min-w-0">
                <div className="w-5 h-5 rounded-full cyber-shimmer-box flex-shrink-0" style={{ width: '20px', height: '20px' }} />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="h-2.5 rounded cyber-shimmer-box" style={{ width: `${60 + (idx % 3) * 15}%` }} />
                  <div className="h-2 w-16 rounded cyber-shimmer-box opacity-60" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="h-2.5 w-6 rounded cyber-shimmer-box" />
              </div>
              <div className="flex justify-end pr-1">
                <div className="h-3 w-10 rounded cyber-shimmer-box" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto divide-y divide-cyan-500/10 no-scrollbar py-1.5 min-h-0"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain',
          }}
          data-inner-scroll="true"
        >
          {rankedList.slice(0, 12).map((entry) => {
            const isUser = entry.isCurrentUser;
            const isRank1 = entry.rank === 1;
            const isRank2 = entry.rank === 2;
            const isRank3 = entry.rank === 3;

            let rankBadge = (
              <span className={`font-tech font-bold text-xs ${isUser ? 'text-cyan-300 font-black' : 'text-slate-400'}`}>
                #{entry.rank}
              </span>
            );

            if (isRank1) {
              rankBadge = (
                <div
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: '1.5px solid #ffd700',
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.55)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1 py-0.5 rounded-full mx-auto"
                  title="Rank 1 - Gold Apex"
                >
                  <Flame className="w-2.5 h-2.5 text-amber-300 fill-amber-400 drop-shadow-[0_0_6px_#ffd700]" />
                  <span className="font-display font-black text-[11px] text-yellow-200">1</span>
                </div>
              );
            } else if (isRank2) {
              rankBadge = (
                <div
                  style={{
                    background: 'radial-gradient(circle, rgba(203, 213, 225, 0.3) 0%, rgba(148, 163, 184, 0.1) 100%)',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 0 10px rgba(203, 213, 225, 0.45)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1 py-0.5 rounded-full mx-auto"
                  title="Rank 2 - Silver Titan"
                >
                  <span className="font-display font-black text-[11px] text-slate-200">2</span>
                </div>
              );
            } else if (isRank3) {
              rankBadge = (
                <div
                  style={{
                    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.1) 100%)',
                    border: '1.5px solid #f59e0b',
                    boxShadow: '0 0 10px rgba(245, 158, 11, 0.45)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1 py-0.5 rounded-full mx-auto"
                  title="Rank 3 - Bronze Vanguard"
                >
                  <span className="font-display font-black text-[11px] text-amber-300">3</span>
                </div>
              );
            }

            return (
              <div
                key={`${entry.username}-${entry.rank}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 44px 54px',
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
                className="px-3.5 py-1.5 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-center">{rankBadge}</div>

                <div className="flex items-center gap-1.5 pl-0.5 min-w-0">
                  <PilotAvatar
                    username={entry.username}
                    avatarUrl={entry.avatarUrl}
                    isUser={isUser}
                    isRank1={isRank1}
                    isRank2={isRank2}
                    isRank3={isRank3}
                  />
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
                    <span className="text-[9px] font-ui text-slate-400 truncate leading-none mt-0.5">
                      {entry.badgeTitle}
                    </span>
                  </div>
                </div>

                <div className="text-center font-tech text-xs text-slate-300">
                  <span className="font-bold text-white">{entry.coresCleared}</span>
                  <span className="text-[9px] text-slate-500">/50</span>
                </div>

                <div className="text-right pr-1">
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

      {/* 4. Bottom Player Rank Summary */}
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
