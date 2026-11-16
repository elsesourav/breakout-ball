import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Zap, Heart, Boxes } from 'lucide-react';
import { ScoreState } from '../engine/types';
import { GameSummaryModal } from './GameSummaryModal';
import { CoreIcon } from './CoreIcon';
import type { ActiveBuffInfo } from '../engine/powerUps';

interface GameHUDProps {
  lives: number;
  timeUsed?: number;
  countdown: string | null; // "3", "2", "1", "GO!"
  score: number;
  combo: number;
  activeBuffs?: ActiveBuffInfo[];
  onExit: () => void;
  onPause?: () => void;
  onResume?: () => void;
  summaryState?: ScoreState | null;
  onRetry?: () => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
  levelNumber?: number;
  totalBreakable?: number;
  blocksDestroyed?: number;
  coresEarned?: number;
  isFirstClear?: boolean;
  starsEarned?: number;
  previousStars?: number;
  totalClaimedForLevel?: number;
  maxCoresForLevel?: number;
  remainingCoresForLevel?: number;
  totalCores?: number;
  isDailyMission?: boolean;
  gameMode?: 'arcade' | 'arena';
}

const countdownTheme: Record<string, { color: string; border: string; glow: string; sub: string }> = {
  '3': {
    color: '#00f7ff',
    border: '#00f7ff',
    glow: 'rgba(0, 247, 255, 0.85)',
    sub: 'INITIALIZING CORE',
  },
  '2': {
    color: '#ffb700',
    border: '#ffb700',
    glow: 'rgba(255, 183, 0, 0.85)',
    sub: 'CALIBRATING PADDLE',
  },
  '1': {
    color: '#ff0844',
    border: '#ff0844',
    glow: 'rgba(255, 8, 68, 0.85)',
    sub: 'READY FOR LAUNCH',
  },
  'GO!': {
    color: '#00ff88',
    border: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.95)',
    sub: 'ENGAGE!',
  },
};

export const GameHUD: React.FC<GameHUDProps> = ({
  lives,
  timeUsed,
  countdown,
  score,
  combo,
  onExit,
  onPause,
  onResume,
  summaryState,
  onRetry,
  onNextLevel,
  hasNextLevel = false,
  levelNumber = 1,
  totalBreakable = 0,
  blocksDestroyed = 0,
  activeBuffs = [],
  coresEarned = 0,
  isFirstClear = false,
  starsEarned = 3,
  previousStars = 0,
  totalClaimedForLevel = 0,
  maxCoresForLevel = 0,
  remainingCoresForLevel = 0,
  totalCores = 0,
  isDailyMission = false,
  gameMode = 'arcade',
}) => {
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);
  const remainingTargets = Math.max(0, totalBreakable - blocksDestroyed);

  const handleHomeClick = () => {
    onPause?.();
    setShowExitConfirm(true);
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
    onResume?.();
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onExit();
  };

  return (
    <>
      {/* Sleek, Two-Line Cyber HUD Header (No Time Display) */}
      <header className="absolute top-2 left-0 right-0 z-30 px-3 flex flex-col gap-1.5 pointer-events-none max-w-[480px] mx-auto">
        {/* LINE 1: Hearts, Level/Score, and Targets / Combo */}
        <div className="w-full flex items-center justify-between gap-2">
          {/* Left Section: Compact Exit Button + Micro-Hearts */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <button
              onClick={handleHomeClick}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#090d24] border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
              title={gameMode === 'arena' ? 'Exit to Arena' : 'Exit to Arcade'}
            >
              <Home className="w-4 h-4" />
            </button>

            {/* Micro-Hearts (High-performance opaque background, zero blur) */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#06091c] border border-white/10">
              {[1, 2, 3].map((heartIndex) => {
                const isAlive = heartIndex <= lives;
                return (
                  <div
                    key={`life-${heartIndex}`}
                    className={`transition-all duration-300 ${
                      isAlive ? 'text-red-400 scale-100' : 'text-slate-600 scale-90 opacity-30'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isAlive ? 'fill-red-500' : ''}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Section: Compact Cyber Score Display */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#06091c] border border-white/10 shrink-0">
            <span className="font-tech text-[10px] font-bold text-slate-400 tracking-wider">
              LVL {levelNumber}
            </span>
            <span className="text-slate-600 text-[10px]">•</span>
            <span className="font-display font-black text-sm tracking-wider text-cyan-300">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Right Section: Compact Targets & Cores / Combo */}
          <div className="flex items-center gap-1.5 justify-end shrink-0 pointer-events-auto">
            {totalBreakable > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#06091c] border border-cyan-500/30">
                <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-tech font-bold text-xs text-cyan-300">
                  {remainingTargets}
                </span>
              </div>
            )}

            {/* Cores or Combo */}
            {combo > 1 ? (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/30 to-red-500/30 border border-amber-400/50 animate-pulse">
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span className="font-tech font-black text-xs text-amber-300">{combo}x</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#06091c] border border-cyan-500/30">
                <CoreIcon size={12} variant="cyan" />
                <span className="font-tech font-bold text-xs text-cyan-200">
                  {totalCores.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* LINE 2: Active Power-Up Timers (One after another with countdown indicators) */}
        {activeBuffs.length > 0 && (
          <div className="w-full flex items-center justify-center gap-1.5 pointer-events-auto flex-wrap animate-fadeIn">
            {activeBuffs.map((buff) => {
              const ratio = buff.isShield
                ? Math.min(1, buff.current / buff.max)
                : Math.max(0, Math.min(1, buff.current / buff.max));
              return (
                <div
                  key={buff.type}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#06091c] border transition-all text-[10px] font-tech font-bold"
                  style={{
                    borderColor: buff.color,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: buff.color }}
                  />
                  <span className="text-white tracking-wider">{buff.name}</span>
                  <span className="text-cyan-200">
                    {buff.isShield ? `${buff.current}x` : `${buff.current.toFixed(1)}s`}
                  </span>
                  {/* Depleting progress track */}
                  <div className="w-7 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-100"
                      style={{
                        width: `${Math.round(ratio * 100)}%`,
                        backgroundColor: buff.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Exit Confirmation Dialog (Pauses Gameplay) */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 pointer-events-auto select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 12, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-sm rounded-2xl bg-[#070b1e] border border-cyan-500/40 p-5 shadow-2xl flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center mx-auto text-cyan-400">
                <Home className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-base text-cyan-300 tracking-wider">
                  LEAVE MISSION?
                </h3>
                <p className="font-tech text-xs text-slate-300">
                  Are you sure you want to leave this level? Current run progress and combo will be lost.
                </p>
              </div>
              <div className="flex items-center gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={handleCancelExit}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 font-display font-bold text-xs text-white transition-all cursor-pointer active:scale-95"
                >
                  CONTINUE
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
                  className="flex-1 py-2.5 rounded-xl border border-rose-500/60 bg-rose-600/90 hover:bg-rose-600 font-display font-black text-xs text-white shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  EXIT TO MENU
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Center Countdown */}
      <AnimatePresence mode="popLayout">
        {countdown && (
          <div
            key="countdown-overlay"
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            {(() => {
              const cfg = countdownTheme[countdown] || countdownTheme['GO!'];
              const isGo = countdown === 'GO!';
              return (
                <motion.div
                  key={`card-${countdown}`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.15, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 22,
                    stiffness: 400,
                  }}
                  style={{
                    backgroundColor: 'rgba(6, 9, 28, 0.95)',
                    border: '1.5px solid rgba(0, 247, 255, 0.35)',
                    borderRadius: '20px',
                  }}
                  className="flex flex-col items-center justify-center px-8 py-4 min-w-[140px] relative overflow-hidden"
                >
                  <span
                    className="font-display font-black tracking-widest leading-none select-none"
                    style={{
                      fontSize: isGo ? '3.5rem' : '4rem',
                      color: cfg.color,
                      textShadow: `0 0 18px ${cfg.glow}`,
                    }}
                  >
                    {countdown}
                  </span>

                  <span
                    className="font-tech text-[10.5px] tracking-widest font-bold uppercase mt-1.5 select-none"
                    style={{
                      color: cfg.color,
                      opacity: 0.9,
                      textShadow: `0 0 8px ${cfg.glow}`,
                    }}
                  >
                    {cfg.sub}
                  </span>
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* Outcome Modal (Win or Game Over) */}
      <AnimatePresence>
        {summaryState && (summaryState.status === 'win' || summaryState.status === 'gameover') && (
          <GameSummaryModal
            summaryState={summaryState}
            levelNumber={levelNumber}
            coresEarned={coresEarned}
            isFirstClear={isFirstClear}
            starsEarned={starsEarned}
            previousStars={previousStars}
            totalClaimedForLevel={totalClaimedForLevel}
            maxCoresForLevel={maxCoresForLevel}
            remainingCoresForLevel={remainingCoresForLevel}
            hasNextLevel={hasNextLevel}
            onRetry={onRetry}
            onNextLevel={onNextLevel}
            onExit={onExit}
            isDailyMission={isDailyMission}
            gameMode={gameMode}
          />
        )}
      </AnimatePresence>
    </>
  );
};
