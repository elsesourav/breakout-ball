import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { LevelData } from '../../types/game';
import { Play, Flame, Award, Clock, Check } from 'lucide-react';
import { CoreIcon } from '../CoreIcon';
import { soundManager } from '../../utils/audio';
import { cyberToast } from '../common/CyberToast';
import {
  getSecondsUntilMidnight,
  formatDailyCountdown,
  getDailyFeaturedLevel,
  isDailyMissionCompleted,
  fetchDailyApexMission,
  getCachedDailyMission,
  DailyApexPayload,
} from '../../services/dailyApex';

interface DailyFeaturedBannerProps {
  levels: LevelData[];
  onPreview?: (level: LevelData) => void;
}

export const DailyFeaturedBanner: React.FC<DailyFeaturedBannerProps> = ({ levels, onPreview }) => {
  const { startPlayLevel } = useGame();
  const [syncedMission, setSyncedMission] = useState<DailyApexPayload | null>(() => getCachedDailyMission());
  const [timeLeft, setTimeLeft] = useState<number>(() => getSecondsUntilMidnight());
  const [isCompleted, setIsCompleted] = useState<boolean>(() => isDailyMissionCompleted());

  // Real-time countdown timer ticking down to server rotation
  useEffect(() => {
    fetchDailyApexMission().then((data) => {
      if (data) setSyncedMission(data);
    });

    const handleDailySynced = (e: any) => {
      if (e.detail) setSyncedMission(e.detail);
    };
    window.addEventListener('daily-apex-synced', handleDailySynced);

    const timer = setInterval(() => {
      const remaining = getSecondsUntilMidnight();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        fetchDailyApexMission().then((d) => {
          if (d) setSyncedMission(d);
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('daily-apex-synced', handleDailySynced);
    };
  }, []);

  // Listen for daily mission completion event dispatched upon clearing
  useEffect(() => {
    const handleDailyCompleted = () => {
      setIsCompleted(true);
    };
    window.addEventListener('daily-apex-completed', handleDailyCompleted);
    return () => window.removeEventListener('daily-apex-completed', handleDailyCompleted);
  }, []);

  // Compute daily featured mission automatically
  const dailyData = useMemo(() => {
    if (syncedMission?.today?.level) {
      return {
        level: syncedMission.today.level,
        dateKey: syncedMission.today.date,
        bonusCores: syncedMission.today.bonusCores || 100,
        tomorrow: syncedMission.tomorrow,
      };
    }
    return getDailyFeaturedLevel(levels);
  }, [syncedMission, levels]);

  if (!dailyData || !dailyData.level) return null;

  const { level: featuredLevel, dateKey, bonusCores } = dailyData;

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleted) {
      soundManager.playLockTap();
      cyberToast.info(`Daily Mission Completed • Next mission in ${formatDailyCountdown(timeLeft)}`);
      return;
    }
    soundManager.playClick();
    startPlayLevel(featuredLevel);
  };

  const handleCardClick = () => {
    if (isCompleted) {
      soundManager.playLockTap();
      cyberToast.info(`Daily Mission Completed • Next mission in ${formatDailyCountdown(timeLeft)}`);
      return;
    }
    if (onPreview) {
      onPreview(featuredLevel);
    } else {
      startPlayLevel(featuredLevel);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        background: 'linear-gradient(135deg, rgba(14, 22, 58, 0.96) 0%, rgba(26, 12, 44, 0.98) 100%)',
        border: isCompleted
          ? '1.5px solid rgba(52, 211, 153, 0.65)'
          : '1.5px solid rgba(255, 215, 0, 0.6)',
        boxShadow: isCompleted
          ? '0 0 24px rgba(16, 185, 129, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
          : '0 0 24px rgba(255, 215, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        flexShrink: 0,
      }}
      className="w-full max-w-sm p-3.5 flex flex-col gap-2.5 relative overflow-hidden select-none shrink-0 cursor-pointer group transition-all duration-300 hover:scale-[1.01]"
      title="Click to preview mission details"
    >
      {/* Radiant Corner Flares */}
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-cyan-500/15 blur-xl pointer-events-none" />

      {/* 1. Header Tag Row: Mission Badge + Live Reset Countdown */}
      <div className="flex items-center justify-between z-10 gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-300 font-tech text-[10px] font-bold shadow-[0_0_10px_rgba(255,215,0,0.25)]">
          <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-400 drop-shadow-[0_0_6px_#ffd700]" />
          <span className="tracking-wide">DAILY APEX MISSION</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
        </div>

        {/* Live Reset Countdown Timer */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/50 border border-amber-400/30 font-tech text-[10px] text-amber-300 font-bold whitespace-nowrap shadow-inner"
          title="Daily rotation resets automatically at midnight"
        >
          <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span>{formatDailyCountdown(timeLeft)}</span>
        </div>
      </div>

      {/* 2. Main Mission Details: Title & Meta Info */}
      <div className="flex items-start justify-between gap-3 z-10">
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-black text-[15px] sm:text-base text-white truncate tracking-wide leading-tight group-hover:text-amber-300 transition-colors">
              {featuredLevel.name || `Core #${featuredLevel.id}`}
            </h3>
          </div>

          <div className="font-ui text-xs text-slate-300 flex items-center gap-2 truncate mt-1">
            <span className="text-slate-300 font-medium truncate">By @{featuredLevel.creator}</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-400 font-tech font-bold">#{featuredLevel.id}</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400 font-tech font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" />
              {featuredLevel.playCount || 0}
            </span>
            {featuredLevel.blocks && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400 font-tech text-[10px]">
                  {featuredLevel.blocks.length} TARGETS
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Reward Bounties & Action Button (Play / Completed) */}
      <div className="flex items-center justify-between gap-2 z-10 pt-2 border-t border-white/[0.08] min-w-0">
        {/* Bounty Badges */}
        <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
          <span className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-tech text-amber-300 font-bold bg-amber-500/10 border border-amber-400/35 px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap">
            <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>2X REP</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-tech text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-400/35 px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap">
            <CoreIcon size={12} variant="cyan" glow />
            <span>+{bonusCores}</span>
          </span>
        </div>

        {/* Action Button: PLAY when available, COMPLETED badge with tick icon when completed */}
        {isCompleted ? (
          <button
            type="button"
            onClick={handleLaunch}
            style={{
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.16)',
              border: '1.2px solid rgba(52, 211, 153, 0.6)',
              boxShadow: '0 0 14px rgba(16, 185, 129, 0.25)',
            }}
            className="px-3 py-1.5 flex items-center justify-center gap-1.5 font-display font-black text-xs text-emerald-300 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap select-none"
            title={`Daily Apex Mission completed. Next reset in ${formatDailyCountdown(timeLeft)}`}
          >
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            <span className="tracking-wider">COMPLETED</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLaunch}
            style={{
              background: 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
              borderRadius: '10px',
              border: '1px solid #ffea79',
            }}
            className="px-3.5 py-1.5 flex items-center justify-center gap-1.5 font-display font-black text-xs hover:brightness-105 active:scale-95 transition-all cursor-pointer flex-shrink-0 shadow-lg whitespace-nowrap"
            title="Launch Daily Apex Mission"
          >
            <div className="flex items-center gap-1.5" style={{ color: '#050714' }}>
              <Play
                className="w-3.5 h-3.5"
                style={{
                  fill: '#050714',
                  color: '#050714',
                  stroke: '#050714',
                }}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <span
                style={{
                  color: '#050714',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                }}
              >
                PLAY
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
