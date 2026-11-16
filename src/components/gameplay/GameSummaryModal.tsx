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
  Share2,
} from 'lucide-react';
import { shareVictory } from '../../services/sharing';
import { ScoreState } from '../../engine/types';
import { CoreIcon } from '../common/CoreIcon';

interface GameSummaryModalProps {
  summaryState: ScoreState;
  levelNumber: number;
  coresEarned?: number;
  isFirstClear?: boolean;
  starsEarned?: number;
  previousStars?: number;
  totalClaimedForLevel?: number;
  maxCoresForLevel?: number;
  remainingCoresForLevel?: number;
  hasNextLevel?: boolean;
  onRetry?: () => void;
  onNextLevel?: () => void;
  onExit: () => void;
  isDailyMission?: boolean;
  gameMode?: 'arcade' | 'arena';
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  summaryState,
  levelNumber,
  coresEarned = 0,
  starsEarned = 3,
  hasNextLevel,
  onRetry,
  onNextLevel,
  onExit,
  isDailyMission = false,
  gameMode = 'arcade',
}) => {
  const isWin = summaryState.status === 'win';
  const hearts = Math.min(3, Math.max(1, summaryState.lives ?? 3));
  const effectiveStars = gameMode === 'arcade' ? starsEarned : hearts;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isWin ? 0.8 : 0.25, ease: 'easeOut' }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={isWin ? { scale: 0.86, opacity: 0, y: 32 } : { scale: 0.88, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={
          isWin
            ? { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
            : { type: 'spring', damping: 24, stiffness: 320 }
        }
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
                className="flex items-center justify-center text-emerald-300 mb-2 relative"
              >
                <Trophy className="w-9 h-9" />
                <div className="absolute -inset-1 rounded-2xl bg-emerald-400/10 animate-pulse pointer-events-none" />
              </div>

              {/* Star Rating Display right after the Cup Icon */}
              <div className="flex items-center justify-center gap-2 mb-2">
                {[1, 2, 3].map((starIdx) => {
                  const isEarned = starIdx <= effectiveStars;
                  return (
                    <div
                      key={`cup-star-${starIdx}`}
                      className="flex items-center justify-center transition-all duration-300"
                      style={{
                        filter: isEarned ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.95))' : 'none',
                      }}
                    >
                      <Star
                        className={`w-7 h-7 transition-transform ${
                          isEarned
                            ? 'text-amber-400 fill-amber-400 stroke-amber-300 scale-110'
                            : 'text-slate-700/50 fill-slate-800/40 stroke-slate-700/50'
                        }`}
                      />
                    </div>
                  );
                })}
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
                {isDailyMission ? (
                  <>
                    <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-amber-950/80 border border-amber-400/50 text-amber-300 shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                      DAILY APEX CLEARED
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
                      BOUNTY CLAIMED
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                      {gameMode === 'arena' ? 'ARENA STAGE CLEARED' : `STAGE ${levelNumber} CONQUERED`}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-emerald-950/80 border border-emerald-400/40 text-emerald-300">
                      APEX CLEAR
                    </span>
                  </>
                )}
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
                <span
                  style={{ padding: '4px 14px' }}
                  className="rounded-full text-[10px] font-tech font-bold uppercase tracking-widest bg-red-950/80 border border-red-500/40 text-red-400"
                >
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
              border: isWin ? '1px solid rgba(0, 247, 255, 0.2)' : '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '14px',
              padding: '12px 8px',
            }}
            className="flex flex-col items-center text-center gap-1.5"
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
              border: isWin ? '1px solid rgba(0, 247, 255, 0.2)' : '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '14px',
              padding: '12px 8px',
            }}
            className="flex flex-col items-center text-center gap-1.5"
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
              border: isWin ? '1px solid rgba(0, 247, 255, 0.2)' : '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '14px',
              padding: '12px 8px',
            }}
            className="flex flex-col items-center text-center gap-1.5"
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
          <div className="mb-3.5">
            <div
              style={{
                background:
                  'linear-gradient(135deg, rgba(6, 182, 212, 0.14) 0%, rgba(99, 102, 241, 0.18) 100%)',
                border: '1.2px solid rgba(0, 247, 255, 0.35)',
                boxShadow: '0 0 15px rgba(0, 247, 255, 0.15)',
                borderRadius: '14px',
                padding: '12px 18px',
              }}
              className="flex items-center justify-between"
            >
              <span className="font-tech text-xs text-slate-300 font-bold uppercase tracking-wider">
                REWARD
              </span>

              {coresEarned > 0 ? (
                <div className="flex items-center gap-1.5">
                  <CoreIcon size={18} glow variant="cyan" />
                  <span
                    className="font-display font-black text-lg tracking-wider text-cyan-300"
                    style={{ textShadow: '0 0 12px rgba(0, 247, 255, 0.7)' }}
                  >
                    +{coresEarned}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <CoreIcon size={16} variant="cyan" glow={false} className="opacity-40" />
                  <span className="font-tech text-xs font-semibold text-slate-400 tracking-wider">
                    CLAIMED
                  </span>
                </div>
              )}
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
            padding: '14px 20px',
          }}
          className="flex items-center justify-between mb-4 px-5 py-3.5"
        >
          <span className="font-tech font-bold text-xs text-amber-200/90 uppercase tracking-widest pl-0.5">
            TOTAL SCORE
          </span>
          <span
            className="font-display font-black text-2xl tracking-wider text-amber-300 pr-0.5"
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
                className="w-full h-12 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider active:scale-[0.98] transition-all cursor-pointer group px-4"
              >
                <span>NEXT MISSION</span>
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div
                style={{
                  background: gameMode === 'arena'
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)',
                  border: gameMode === 'arena' ? '1.5px solid rgba(0, 247, 255, 0.4)' : '1.5px solid rgba(251, 191, 36, 0.5)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                }}
                className="flex flex-col items-center gap-0.5 text-center"
              >
                <div className={`flex items-center gap-1.5 ${gameMode === 'arena' ? 'text-cyan-300' : 'text-amber-300'}`}>
                  <Award className="w-4 h-4" />
                  <span className="font-display font-black text-xs tracking-widest uppercase">
                    {gameMode === 'arena' ? 'ARENA STAGE CLEARED!' : 'ARCADE CAMPAIGN CONQUERED!'}
                  </span>
                </div>
                <span className="font-tech text-[10px] text-slate-300">
                  {gameMode === 'arena' ? 'Community challenge mastered. High score recorded!' : 'All arcade missions completed. You are the Apex Champion!'}
                </span>
              </div>
            )}

            {isDailyMission ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onExit}
                  style={{
                    background: 'linear-gradient(135deg, #00f7ff 0%, #0099ff 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 0 20px rgba(0, 247, 255, 0.45)',
                  }}
                  className="w-full h-12 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider active:scale-[0.98] transition-all cursor-pointer shadow-lg px-4 text-[#050714]"
                >
                  <Home className="w-4 h-4 stroke-[2.5] text-[#050714]" />
                  <span className="text-[#050714] font-black tracking-wider">RETURN TO ARENA</span>
                </button>
                <span className="font-tech text-[10.5px] text-slate-400 text-center">
                  Daily Apex Mission claimed • Next mission unlocks at midnight
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    style={{ backgroundColor: 'rgba(12, 18, 42, 0.85)', border: '1.5px solid rgba(0, 247, 255, 0.28)', borderRadius: '12px' }}
                    className="h-11 flex items-center justify-center gap-1.5 font-tech font-bold text-xs tracking-wider active:scale-[0.98] hover:bg-cyan-500/15 transition-all cursor-pointer text-white px-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>RETRY</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => shareVictory(levelNumber, summaryState.score ?? 0, starsEarned)}
                  style={{ backgroundColor: 'rgba(12, 18, 42, 0.85)', border: '1.5px solid rgba(0, 247, 255, 0.45)', borderRadius: '12px' }}
                  className="h-11 flex items-center justify-center gap-1.5 font-tech font-bold text-xs tracking-wider active:scale-[0.98] hover:bg-cyan-500/20 text-cyan-300 hover:text-white transition-all cursor-pointer px-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>SHARE</span>
                </button>

                <button
                  type="button"
                  onClick={onExit}
                  style={{ backgroundColor: 'rgba(12, 18, 42, 0.85)', border: '1.5px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px' }}
                  className="h-11 flex items-center justify-center gap-1.5 font-tech font-bold text-xs tracking-wider active:scale-[0.98] hover:bg-white/10 hover:text-white transition-all cursor-pointer text-slate-300 px-2"
                >
                  <Home className="w-3.5 h-3.5 text-slate-400" />
                  <span>{gameMode === 'arena' ? 'ARENA' : 'ARCADE'}</span>
                </button>
              </div>
            )}
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
                }}
                className="w-full h-12 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider active:scale-[0.98] transition-all cursor-pointer text-white px-4"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>TRY AGAIN</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExit}
              style={{ backgroundColor: 'rgba(12, 18, 42, 0.85)', border: '1.5px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px' }}
              className="w-full h-11 flex items-center justify-center gap-2 font-tech font-bold text-xs tracking-wider active:scale-[0.98] hover:bg-white/10 hover:text-white transition-all cursor-pointer text-slate-400 px-4"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>{gameMode === 'arena' ? 'EXIT TO ARENA' : 'EXIT TO ARCADE'}</span>
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
