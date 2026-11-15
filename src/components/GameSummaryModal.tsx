import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  RotateCcw,
  ChevronRight,
  Trophy,
  Boxes,
  Award,
  Star,
  Flame,
  Timer,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { ScoreState } from '../engine/types';
import { CoreIcon } from './CoreIcon';

interface GameSummaryModalProps {
  summaryState: ScoreState;
  levelNumber: number;
  coresEarned?: number;
  isFirstClear?: boolean;
  hasNextLevel?: boolean;
  onRetry?: () => void;
  onNextLevel?: () => void;
  onExit: () => void;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  summaryState,
  levelNumber,
  coresEarned,
  isFirstClear,
  hasNextLevel,
  onRetry,
  onNextLevel,
  onExit,
}) => {
  const isWin = summaryState.status === 'win';
  const stars = isWin
    ? summaryState.lives >= 3 || (summaryState.maxCombo >= 6 && summaryState.lives >= 2)
      ? 3
      : summaryState.lives >= 2 || summaryState.maxCombo >= 4
      ? 2
      : 1
    : 0;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        style={{
          backgroundColor: 'rgba(8, 12, 34, 0.96)',
          border: isWin
            ? '1.5px solid rgba(0, 247, 255, 0.38)'
            : '1.5px solid rgba(239, 68, 68, 0.38)',
          boxShadow: isWin
            ? '0 0 50px rgba(0, 247, 255, 0.22), 0 25px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
            : '0 0 50px rgba(239, 68, 68, 0.22), 0 25px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          borderRadius: '28px',
        }}
        className="w-full max-w-[380px] flex flex-col px-6 py-6 relative overflow-hidden backdrop-blur-2xl"
      >
        {/* Top Glow Strip */}
        <div
          className="absolute top-0 left-8 right-8 h-[2px] pointer-events-none"
          style={{
            background: isWin
              ? 'linear-gradient(90deg, transparent, #00f7ff, transparent)'
              : 'linear-gradient(90deg, transparent, #ef4444, transparent)',
          }}
        />

        {/* Header Banner */}
        <div className="flex flex-col items-center text-center pb-3 mb-1">
          {isWin ? (
            <>
              {/* 3 Stars */}
              <div className="flex items-center justify-center gap-2.5 mb-2.5">
                {[1, 2, 3].map((starIdx) => {
                  const isEarned = starIdx <= stars;
                  const isCenter = starIdx === 2;
                  return (
                    <div
                      key={`star-${starIdx}`}
                      className={`flex items-center justify-center transition-all duration-300 ${
                        isCenter ? '-translate-y-1' : ''
                      }`}
                      style={{
                        filter: isEarned ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.85))' : 'none',
                      }}
                    >
                      <Star
                        className={`${isCenter ? 'w-7 h-7' : 'w-5 h-5'} ${
                          isEarned
                            ? 'text-amber-400 fill-amber-400 stroke-amber-300'
                            : 'text-slate-700/80 fill-slate-800/40'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background:
                    'radial-gradient(circle, rgba(0, 247, 255, 0.25) 0%, rgba(16, 185, 129, 0.35) 100%)',
                  border: '1.5px solid #00f7ff',
                  boxShadow: '0 0 25px rgba(0, 247, 255, 0.45)',
                }}
                className="flex items-center justify-center text-emerald-300 mb-3 relative"
              >
                <Trophy className="w-9 h-9" />
                <div className="absolute -inset-1 rounded-2xl bg-emerald-400/10 animate-pulse pointer-events-none" />
              </div>

              <h2
                className="font-display font-black text-2xl tracking-wider"
                style={{
                  color: '#00f7ff',
                  textShadow: '0 0 16px rgba(0, 247, 255, 0.7), 0 0 32px rgba(0, 247, 255, 0.35)',
                }}
              >
                LEVEL CLEARED!
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                  STAGE {levelNumber} CONQUERED
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
                  {stars === 3 ? '★ APEX CLEAR' : 'ACCOMPLISHED'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background:
                    'radial-gradient(circle, rgba(239, 68, 68, 0.28) 0%, rgba(127, 29, 29, 0.45) 100%)',
                  border: '1.5px solid #f87171',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.45)',
                }}
                className="flex items-center justify-center text-red-400 mb-3 relative"
              >
                <ShieldAlert className="w-9 h-9" />
                <div className="absolute -inset-1 rounded-2xl bg-red-400/10 animate-pulse pointer-events-none" />
              </div>

              <h2
                className="font-display font-black text-2xl tracking-wider"
                style={{
                  color: '#ef4444',
                  textShadow: '0 0 16px rgba(239, 68, 68, 0.7), 0 0 32px rgba(239, 68, 68, 0.35)',
                }}
              >
                GAME OVER
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-red-950/80 border border-red-500/40 text-red-400">
                  SYSTEM COMPROMISED
                </span>
              </div>
            </>
          )}
        </div>

        {/* Performance Metrics (3-Card Grid) */}
        <div className="grid grid-cols-3 gap-2.5 my-3">
          {/* Targets */}
          <div
            style={{
              backgroundColor: 'rgba(6, 10, 28, 0.8)',
              border: '1px solid rgba(0, 247, 255, 0.2)',
              borderRadius: '14px',
            }}
            className="py-3 px-2 flex flex-col items-center text-center gap-1.5"
          >
            <div className="flex items-center gap-1 text-cyan-400">
              <Boxes className="w-3.5 h-3.5" />
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                TARGETS
              </span>
            </div>
            <span className="font-tech font-black text-xs text-white">
              {summaryState.blocksDestroyed ?? 0}
              <span className="text-[10px] text-slate-400 font-normal">
                {' '}
                / {summaryState.totalBreakable ?? 0}
              </span>
            </span>
          </div>

          {/* Time */}
          <div
            style={{
              backgroundColor: 'rgba(6, 10, 28, 0.8)',
              border: '1px solid rgba(0, 247, 255, 0.2)',
              borderRadius: '14px',
            }}
            className="py-3 px-2 flex flex-col items-center text-center gap-1.5"
          >
            <div className="flex items-center gap-1 text-cyan-400">
              <Timer className="w-3.5 h-3.5" />
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                TIME
              </span>
            </div>
            <span className="font-tech font-black text-xs text-cyan-300">
              {(summaryState.timeUsed ?? 0).toFixed(1)}s
            </span>
          </div>

          {/* Max Combo */}
          <div
            style={{
              backgroundColor: 'rgba(6, 10, 28, 0.8)',
              border: '1px solid rgba(0, 247, 255, 0.2)',
              borderRadius: '14px',
            }}
            className="py-3 px-2 flex flex-col items-center text-center gap-1.5"
          >
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span className="font-tech text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                STREAK
              </span>
            </div>
            <span className="font-tech font-black text-xs text-amber-300">
              {summaryState.maxCombo ?? 0}x
            </span>
          </div>
        </div>

        {/* Currency Reward Banner */}
        {isWin && (
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
              border: '1.2px solid rgba(0, 247, 255, 0.5)',
              boxShadow: '0 0 15px rgba(0, 247, 255, 0.2)',
              borderRadius: '12px',
            }}
            className="px-4 py-3 flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-1.5">
              <CoreIcon size={16} glow variant="cyan" />
              <span className="font-tech text-[10px] text-cyan-200 font-bold uppercase tracking-wider">
                CORE REWARD
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xs text-cyan-300">
                {coresEarned && coresEarned > 0 ? `+${coresEarned} CORES` : '+0 CORES'}
              </span>
              <span className="font-tech text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {coresEarned && coresEarned > 0
                  ? isFirstClear
                    ? 'FIRST CLEAR'
                    : 'EARNED'
                  : 'CLAIMED'}
              </span>
            </div>
          </div>
        )}

        {/* Total Score Panel */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.2) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            borderRadius: '16px',
          }}
          className="px-4.5 py-3.5 flex items-center justify-between mb-4"
        >
          <span className="font-tech font-bold text-[11px] text-amber-200/80 uppercase tracking-widest">
            TOTAL SCORE
          </span>
          <span
            className="font-display font-black text-2xl tracking-wider text-amber-300"
            style={{
              textShadow: '0 0 16px rgba(251, 191, 36, 0.8)',
            }}
          >
            {(summaryState.score ?? 0).toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        {isWin ? (
          <div className="flex flex-col gap-2.5">
            {hasNextLevel && onNextLevel ? (
              <button
                type="button"
                onClick={onNextLevel}
                style={{
                  background: 'linear-gradient(135deg, #00f7ff 0%, #3b82f6 50%, #6366f1 100%)',
                  border: '1.5px solid #a5f3fc',
                  boxShadow: '0 0 25px rgba(0, 247, 255, 0.5)',
                  borderRadius: '12px',
                  color: '#ffffff',
                }}
                className="w-full h-12 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider active:scale-[0.98] transition-all cursor-pointer group"
              >
                <span>NEXT MISSION</span>
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  border: '1.5px solid rgba(251, 191, 36, 0.5)',
                  borderRadius: '12px',
                }}
                className="flex flex-col items-center gap-0.5 p-2 text-center"
              >
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Award className="w-4 h-4" />
                  <span className="font-display font-black text-xs tracking-widest uppercase">
                    ARCADE CAMPAIGN CONQUERED!
                  </span>
                </div>
                <span className="font-tech text-[10px] text-slate-300">
                  All arcade missions completed. You are the Apex Champion!
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  style={{
                    backgroundColor: 'rgba(12, 18, 42, 0.85)',
                    border: '1.5px solid rgba(0, 247, 255, 0.28)',
                    borderRadius: '12px',
                    color: '#ffffff',
                  }}
                  className="h-11 flex items-center justify-center gap-1.5 font-tech font-bold text-xs tracking-wider active:scale-[0.98] hover:bg-cyan-500/15 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RETRY</span>
                </button>
              )}

              <button
                type="button"
                onClick={onExit}
                style={{
                  backgroundColor: 'rgba(12, 18, 42, 0.85)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  color: '#cbd5e1',
                }}
                className="h-11 flex items-center justify-center gap-1.5 font-tech font-bold text-xs tracking-wider active:scale-[0.98] hover:bg-white/10 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>LEVEL MAP</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                  border: '1.5px solid #fca5a5',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.5)',
                  borderRadius: '12px',
                  color: '#ffffff',
                }}
                className="w-full h-12 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>TRY AGAIN</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExit}
              style={{
                backgroundColor: 'rgba(12, 18, 42, 0.85)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: '#94a3b8',
              }}
              className="w-full h-11 flex items-center justify-center gap-1.5 font-tech font-bold text-xs tracking-wider active:scale-[0.98] hover:bg-white/10 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>EXIT TO LEVEL MAP</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
