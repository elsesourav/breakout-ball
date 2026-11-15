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
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

// Generate distinct non-human sci-fi / arcade game avatar URLs in tiny 32px SVG sizes
const getDemoAvatarUrl = (username: string, index: number): string => {
  const styles = ['bottts', 'pixel-art', 'bottts', 'identicon', 'pixel-art'];
  const style = styles[index % styles.length];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(username)}&size=32`;
};

// Low-quality profile image helper: optimizes external URLs to lightweight thumbnails
const getLowQualityAvatarUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    const transformUrl = url.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    return `${transformUrl}?width=64&height=64&quality=40&resize=cover`;
  }
  if (url.includes('unsplash.com')) {
    const base = url.split('?')[0];
    return `${base}?w=64&q=40&auto=format&fit=crop`;
  }
  if (url.includes('gravatar.com/avatar')) {
    const base = url.split('?')[0];
    return `${base}?s=48&d=identicon`;
  }
  if (url.includes('googleusercontent.com')) {
    return url.replace(/=s\d+(-c)?$/, '=s48-c');
  }
  if (url.includes('githubusercontent.com')) {
    return `${url.split('?')[0]}?size=48`;
  }
  return url;
};

interface PilotAvatarProps {
  username: string;
  avatarUrl?: string;
  isUser?: boolean;
  isRank1?: boolean;
  isRank2?: boolean;
  isRank3?: boolean;
}

const PilotAvatar: React.FC<PilotAvatarProps> = ({
  username,
  avatarUrl,
  isUser,
  isRank1,
  isRank2,
  isRank3,
}) => {
  const [imgError, setImgError] = useState(false);
  const lowQualitySrc = useMemo(() => getLowQualityAvatarUrl(avatarUrl), [avatarUrl]);

  const initials = isUser ? 'Y' : username.slice(0, 2).toUpperCase();

  let borderStyle: React.CSSProperties = {
    background: '#0a0f29',
    border: '1.5px solid rgba(100, 116, 139, 0.45)',
    color: '#cbd5e1',
  };

  if (isUser) {
    borderStyle = {
      background: 'linear-gradient(135deg, #00f7ff 0%, #3b82f6 100%)',
      border: '1.5px solid #00f7ff',
      boxShadow: '0 0 10px rgba(0, 247, 255, 0.5)',
      color: '#000000',
    };
  } else if (isRank1) {
    borderStyle = {
      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)',
      border: '1.5px solid #ffd700',
      boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
      color: '#ffd700',
    };
  } else if (isRank2) {
    borderStyle = {
      background: 'radial-gradient(circle, rgba(203, 213, 225, 0.25) 0%, rgba(148, 163, 184, 0.1) 100%)',
      border: '1.5px solid #cbd5e1',
      boxShadow: '0 0 8px rgba(203, 213, 225, 0.4)',
      color: '#e2e8f0',
    };
  } else if (isRank3) {
    borderStyle = {
      background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(180, 83, 9, 0.1) 100%)',
      border: '1.5px solid #f59e0b',
      boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)',
      color: '#fcd34d',
    };
  }

  return (
    <div
      style={borderStyle}
      className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-tech font-bold flex-shrink-0 overflow-hidden relative"
    >
      {lowQualitySrc && !imgError ? (
        <img
          src={lowQualitySrc}
          alt={username}
          loading="lazy"
          decoding="async"
          width={32}
          height={32}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full p-0.5"
        />
      ) : (
        <span className={isUser ? 'font-black' : 'font-bold'}>{initials}</span>
      )}
    </div>
  );
};

// 50 Top Pilots for Global All-Time Leaderboard with realistic scores based on cores cleared (No real human faces)
const RAW_GLOBAL_PILOTS: { username: string; coresCleared: number; score: number; badgeTitle: string }[] = [
  { username: 'elsesourav', coresCleared: 15, score: 154200, badgeTitle: 'Apex Sovereign' },
  { username: 'speedy_sam', coresCleared: 14, score: 142600, badgeTitle: 'Quantum Pilot' },
  { username: 'arcade_queen', coresCleared: 13, score: 131800, badgeTitle: 'Hyper Striker' },
  { username: 'breakout_pro', coresCleared: 12, score: 121400, badgeTitle: 'Void Breaker' },
  { username: 'cyber_ninja', coresCleared: 11, score: 111200, badgeTitle: 'Matrix Ace' },
  { username: 'neon_striker', coresCleared: 10, score: 101500, badgeTitle: 'Neon Phantom' },
  { username: 'quantum_ace', coresCleared: 9, score: 91200, badgeTitle: 'Core Breaker' },
  { username: 'hyper_dash', coresCleared: 8, score: 81400, badgeTitle: 'Challenger' },
  { username: 'retro_pilot', coresCleared: 7, score: 71200, badgeTitle: 'Cadet Striker' },
  { username: 'nova_cadet', coresCleared: 6, score: 61000, badgeTitle: 'Rookie Pilot' },
  { username: 'pixel_master', coresCleared: 5, score: 51200, badgeTitle: 'Arcade Cadet' },
  { username: 'laser_runner', coresCleared: 5, score: 49600, badgeTitle: 'Laser Scout' },
  { username: 'void_walker', coresCleared: 4, score: 41200, badgeTitle: 'Void Runner' },
  { username: 'solar_flare', coresCleared: 4, score: 39500, badgeTitle: 'Star Cadet' },
  { username: 'crypto_striker', coresCleared: 3, score: 31400, badgeTitle: 'Sector Scout' },
  { username: 'echo_pulse', coresCleared: 3, score: 29800, badgeTitle: 'Pulse Cadet' },
  { username: 'zero_gravity', coresCleared: 2, score: 21500, badgeTitle: 'Orbit Trainee' },
  { username: 'plasma_storm', coresCleared: 2, score: 19400, badgeTitle: 'Novice Pilot' },
  { username: 'nebula_rider', coresCleared: 2, score: 18600, badgeTitle: 'Trainee' },
  { username: 'omega_cadet', coresCleared: 2, score: 18100, badgeTitle: 'Recruit' },
  { username: 'titan_vanguard', coresCleared: 2, score: 17600, badgeTitle: 'Recruit' },
  { username: 'blaze_core', coresCleared: 2, score: 17100, badgeTitle: 'Rookie' },
  { username: 'shadow_pulse', coresCleared: 2, score: 16700, badgeTitle: 'Rookie' },
  { username: 'flux_runner', coresCleared: 2, score: 16200, badgeTitle: 'Recruit' },
  { username: 'vortex_pilot', coresCleared: 2, score: 15800, badgeTitle: 'Cadet' },
  { username: 'stellar_hawk', coresCleared: 2, score: 15300, badgeTitle: 'Cadet' },
  { username: 'glitch_hunter', coresCleared: 2, score: 14900, badgeTitle: 'Trainee' },
  { username: 'byte_striker', coresCleared: 1, score: 14400, badgeTitle: 'Trainee' },
  { username: 'warp_driver', coresCleared: 1, score: 13900, badgeTitle: 'Trainee' },
  { username: 'chrono_speeder', coresCleared: 1, score: 13500, badgeTitle: 'Novice' },
  { username: 'drift_master', coresCleared: 1, score: 13100, badgeTitle: 'Novice' },
  { username: 'aero_blade', coresCleared: 1, score: 12700, badgeTitle: 'Novice' },
  { username: 'pulse_forge', coresCleared: 1, score: 12300, badgeTitle: 'Cadet' },
  { username: 'prism_strike', coresCleared: 1, score: 11900, badgeTitle: 'Cadet' },
  { username: 'photon_wave', coresCleared: 1, score: 11600, badgeTitle: 'Cadet' },
  { username: 'sonic_rebound', coresCleared: 1, score: 11300, badgeTitle: 'Scout' },
  { username: 'arc_reactor', coresCleared: 1, score: 11000, badgeTitle: 'Scout' },
  { username: 'vector_dash', coresCleared: 1, score: 10800, badgeTitle: 'Scout' },
  { username: 'zenith_star', coresCleared: 1, score: 10600, badgeTitle: 'Recruit' },
  { username: 'cosmo_seeker', coresCleared: 1, score: 10400, badgeTitle: 'Recruit' },
  { username: 'hyper_ion', coresCleared: 1, score: 10200, badgeTitle: 'Recruit' },
  { username: 'star_glider', coresCleared: 1, score: 10000, badgeTitle: 'Cadet' },
  { username: 'orbit_knight', coresCleared: 1, score: 9850, badgeTitle: 'Cadet' },
  { username: 'matrix_cadet', coresCleared: 1, score: 9700, badgeTitle: 'Cadet' },
  { username: 'spark_runner', coresCleared: 1, score: 9550, badgeTitle: 'Trainee' },
  { username: 'aegis_core', coresCleared: 1, score: 9400, badgeTitle: 'Trainee' },
  { username: 'flux_cadet', coresCleared: 1, score: 9250, badgeTitle: 'Novice' },
  { username: 'nano_striker', coresCleared: 1, score: 9100, badgeTitle: 'Novice' },
  { username: 'beacon_prime', coresCleared: 1, score: 8950, badgeTitle: 'Recruit' },
  { username: 'vanguard_zero', coresCleared: 1, score: 8800, badgeTitle: 'Recruit' },
];

const GLOBAL_PILOTS: Omit<ScoreLeaderboardEntry, 'rank'>[] = RAW_GLOBAL_PILOTS.map((p, idx) => ({
  ...p,
  avatarUrl: getDemoAvatarUrl(p.username, idx),
}));

// 50 Top Pilots for Weekly Tournament Leaderboard with realistic scores (No real human faces)
const RAW_WEEKLY_PILOTS: { username: string; coresCleared: number; score: number; badgeTitle: string }[] = [
  { username: 'speedy_sam', coresCleared: 7, score: 72400, badgeTitle: 'Weekly Ace' },
  { username: 'elsesourav', coresCleared: 6, score: 62800, badgeTitle: 'Weekly Legend' },
  { username: 'cyber_ninja', coresCleared: 5, score: 52100, badgeTitle: 'Weekly Champion' },
  { username: 'arcade_queen', coresCleared: 5, score: 49500, badgeTitle: 'Challenger' },
  { username: 'breakout_pro', coresCleared: 4, score: 41200, badgeTitle: 'Core Striker' },
  { username: 'neon_striker', coresCleared: 4, score: 39400, badgeTitle: 'Rookie' },
  { username: 'quantum_ace', coresCleared: 3, score: 31200, badgeTitle: 'Weekly Scout' },
  { username: 'hyper_dash', coresCleared: 3, score: 29800, badgeTitle: 'Weekly Cadet' },
  { username: 'retro_pilot', coresCleared: 3, score: 28100, badgeTitle: 'Sector Runner' },
  { username: 'nova_cadet', coresCleared: 2, score: 21800, badgeTitle: 'Recruit' },
  { username: 'laser_runner', coresCleared: 2, score: 20800, badgeTitle: 'Trainee' },
  { username: 'solar_flare', coresCleared: 2, score: 19200, badgeTitle: 'Novice' },
  { username: 'void_walker', coresCleared: 2, score: 18400, badgeTitle: 'Scout' },
  { username: 'crypto_striker', coresCleared: 2, score: 17800, badgeTitle: 'Scout' },
  { username: 'echo_pulse', coresCleared: 2, score: 17200, badgeTitle: 'Cadet' },
  { username: 'zero_gravity', coresCleared: 2, score: 16600, badgeTitle: 'Cadet' },
  { username: 'plasma_storm', coresCleared: 2, score: 16100, badgeTitle: 'Rookie' },
  { username: 'nebula_rider', coresCleared: 2, score: 15600, badgeTitle: 'Trainee' },
  { username: 'omega_cadet', coresCleared: 1, score: 14900, badgeTitle: 'Recruit' },
  { username: 'titan_vanguard', coresCleared: 1, score: 14400, badgeTitle: 'Recruit' },
  { username: 'blaze_core', coresCleared: 1, score: 14000, badgeTitle: 'Rookie' },
  { username: 'shadow_pulse', coresCleared: 1, score: 13600, badgeTitle: 'Rookie' },
  { username: 'flux_runner', coresCleared: 1, score: 13200, badgeTitle: 'Recruit' },
  { username: 'vortex_pilot', coresCleared: 1, score: 12800, badgeTitle: 'Cadet' },
  { username: 'stellar_hawk', coresCleared: 1, score: 12400, badgeTitle: 'Cadet' },
  { username: 'glitch_hunter', coresCleared: 1, score: 12000, badgeTitle: 'Trainee' },
  { username: 'byte_striker', coresCleared: 1, score: 11600, badgeTitle: 'Trainee' },
  { username: 'warp_driver', coresCleared: 1, score: 11200, badgeTitle: 'Trainee' },
  { username: 'chrono_speeder', coresCleared: 1, score: 10900, badgeTitle: 'Novice' },
  { username: 'drift_master', coresCleared: 1, score: 10600, badgeTitle: 'Novice' },
  { username: 'aero_blade', coresCleared: 1, score: 10300, badgeTitle: 'Novice' },
  { username: 'pulse_forge', coresCleared: 1, score: 10000, badgeTitle: 'Cadet' },
  { username: 'prism_strike', coresCleared: 1, score: 9800, badgeTitle: 'Cadet' },
  { username: 'photon_wave', coresCleared: 1, score: 9600, badgeTitle: 'Cadet' },
  { username: 'sonic_rebound', coresCleared: 1, score: 9400, badgeTitle: 'Scout' },
  { username: 'arc_reactor', coresCleared: 1, score: 9200, badgeTitle: 'Scout' },
  { username: 'vector_dash', coresCleared: 1, score: 9000, badgeTitle: 'Scout' },
  { username: 'zenith_star', coresCleared: 1, score: 8850, badgeTitle: 'Recruit' },
  { username: 'cosmo_seeker', coresCleared: 1, score: 8700, badgeTitle: 'Recruit' },
  { username: 'hyper_ion', coresCleared: 1, score: 8550, badgeTitle: 'Recruit' },
  { username: 'star_glider', coresCleared: 1, score: 8400, badgeTitle: 'Cadet' },
  { username: 'orbit_knight', coresCleared: 1, score: 8250, badgeTitle: 'Cadet' },
  { username: 'matrix_cadet', coresCleared: 1, score: 8100, badgeTitle: 'Cadet' },
  { username: 'spark_runner', coresCleared: 1, score: 7950, badgeTitle: 'Trainee' },
  { username: 'aegis_core', coresCleared: 1, score: 7800, badgeTitle: 'Trainee' },
  { username: 'flux_cadet', coresCleared: 1, score: 7650, badgeTitle: 'Novice' },
  { username: 'nano_striker', coresCleared: 1, score: 7500, badgeTitle: 'Novice' },
  { username: 'beacon_prime', coresCleared: 1, score: 7350, badgeTitle: 'Recruit' },
  { username: 'vanguard_zero', coresCleared: 1, score: 7200, badgeTitle: 'Recruit' },
];

const WEEKLY_PILOTS: Omit<ScoreLeaderboardEntry, 'rank'>[] = RAW_WEEKLY_PILOTS.map((p, idx) => ({
  ...p,
  avatarUrl: getDemoAvatarUrl(p.username, idx),
}));

export const OverallScoreLeaderboard: React.FC = () => {
  const { user, localProgress } = useGame();
  // Keep the weekly option, but default strictly to all-time
  const [activeTab, setActiveTab] = useState<'alltime' | 'weekly'>('alltime');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Trigger high-tech skeleton loading state on mount and tab switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
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
    const rawList = activeTab === 'alltime' ? GLOBAL_PILOTS : WEEKLY_PILOTS;

    const filtered = rawList.filter(
      (p) => p.username.toLowerCase() !== userStats.username.toLowerCase()
    );

    filtered.push({
      username: userStats.username,
      score: userStats.score,
      coresCleared: userStats.completedCores,
      badgeTitle:
        userStats.completedCores >= 15
          ? 'Apex Legend'
          : userStats.completedCores >= 6
          ? 'Veteran Pilot'
          : 'Cadet Pilot',
      avatarUrl: userStats.avatarUrl,
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
              Global Rankings
            </span>
          </div>
        </div>

        {/* Tab Toggle: All-Time (default) vs Weekly */}
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
            className="px-2 py-0.5 rounded-md font-tech font-bold text-[9px] tracking-wider transition-all cursor-pointer whitespace-nowrap"
          >
            WEEKLY
          </button>
        </div>
      </div>

      {/* 2. Column Headers: RANK | PILOT | CORES | SCORE (Strictly top 50 table) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '36px 1fr 46px 56px',
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
        /* Cyberpunk Skeleton Loader with Shimmer Wave */
        <div
          className="flex-1 overflow-y-auto divide-y divide-cyan-500/10 no-scrollbar py-2"
          data-inner-scroll="true"
        >
          {[...Array(7)].map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 46px 56px',
                alignItems: 'center',
              }}
              className="px-3.5 py-2.5 transition-colors"
            >
              {/* Rank Placeholder */}
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 rounded-md cyber-shimmer-box" />
              </div>

              {/* Pilot Placeholder */}
              <div className="flex items-center gap-2 pl-1 min-w-0">
                <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full cyber-shimmer-box flex-shrink-0" />
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
                <div className="h-2.5 w-6 rounded cyber-shimmer-box" />
              </div>

              {/* Score Placeholder */}
              <div className="flex justify-end pr-1">
                <div className="h-3 w-10 rounded cyber-shimmer-box" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Real Rankings Rows List: Strictly Top 50 with Clean Gaps at Top and Bottom */
        <div
          className="flex-1 overflow-y-auto divide-y divide-cyan-500/10 no-scrollbar py-2"
          data-inner-scroll="true"
        >
          {rankedList.slice(0, 50).map((entry) => {
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
                    background:
                      'radial-gradient(circle, rgba(203, 213, 225, 0.3) 0%, rgba(148, 163, 184, 0.1) 100%)',
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
                    background:
                      'radial-gradient(circle, rgba(217, 119, 6, 0.3) 0%, rgba(180, 83, 9, 0.1) 100%)',
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
                  gridTemplateColumns: '36px 1fr 46px 56px',
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
                className="px-3.5 py-2 transition-colors hover:bg-white/[0.03]"
              >
                {/* Rank */}
                <div className="flex items-center justify-center">{rankBadge}</div>

                {/* Pilot with Different Avatar-type Images (No Real Human Faces) */}
                <div className="flex items-center gap-2 pl-1 min-w-0">
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

                {/* Cores Cleared */}
                <div className="text-center font-tech text-xs text-slate-300">
                  <span className="font-bold text-white">{entry.coresCleared}</span>
                  <span className="text-[9px] text-slate-500">/30</span>
                </div>

                {/* Score */}
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
