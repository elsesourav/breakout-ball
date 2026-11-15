import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Zap, Heart, Boxes } from 'lucide-react';
import { ScoreState } from '../engine/types';
import { GameSummaryModal } from './GameSummaryModal';

interface GameHUDProps {
  lives: number;
  timeUsed: number;
  countdown: string | null; // "3", "2", "1", "GO!"
  score: number;
  combo: number;
  onExit: () => void;
  summaryState?: ScoreState | null;
  onRetry?: () => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
  levelNumber?: number;
  totalBreakable?: number;
  blocksDestroyed?: number;
  coresEarned?: number;
  isFirstClear?: boolean;
  totalCores?: number;
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
  summaryState,
  onRetry,
  onNextLevel,
  hasNextLevel = false,
  levelNumber = 1,
  totalBreakable = 0,
  blocksDestroyed = 0,
  coresEarned = 0,
  isFirstClear = false,
  totalCores = 0,
}) => {
  const remainingTargets = Math.max(0, totalBreakable - blocksDestroyed);

  return (
    <>
      {/* Top Cyber HUD Bar */}
      <header className="absolute top-2 left-0 right-0 z-30 px-3 flex items-center justify-between pointer-events-none">
        {/* Left: Exit to Menu Button */}
        <button
          onClick={onExit}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-xl bg-[#090d24]/85 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,247,255,0.25)] backdrop-blur-md cursor-pointer"
          title="Exit to Level Select"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* Center: Live Score Display */}
        <div className="flex flex-col items-center justify-center px-4 py-1 rounded-xl bg-[#06091c]/85 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <span className="font-tech text-[10px] tracking-widest text-slate-400 uppercase">
            LVL {levelNumber} SCORE
          </span>
          <span
            className="font-display font-black text-xl tracking-wider text-cyan-300"
            style={{ textShadow: '0 0 10px rgba(0,247,255,0.6)' }}
          >
            {score.toLocaleString()}
          </span>
        </div>

        {/* Right: Currency / Combo Streak Badge */}
        <div className="flex items-center gap-1.5 justify-end">
          {combo > 1 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/50 shadow-[0_0_12px_rgba(255,180,0,0.4)] animate-pulse backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="font-tech font-black text-xs text-amber-300">{combo}x</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#06091c]/85 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,247,255,0.2)] backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span className="font-tech font-bold text-xs text-cyan-200">
                {totalCores.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Floating Center Countdown */}
      <AnimatePresence mode="popLayout">
        {countdown && (
          <div
            key="countdown-overlay"
            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none bg-black/65 backdrop-blur-[4px]"
          >
            {(() => {
              const cfg = countdownTheme[countdown] || countdownTheme['GO!'];
              const isGo = countdown === 'GO!';
              return (
                <div className="relative flex flex-col items-center justify-center">
                  <motion.div
                    key={`wave-${countdown}`}
                    initial={{ scale: 0.6, opacity: 0.95, borderWidth: '3px' }}
                    animate={{ scale: isGo ? 2.5 : 2.0, opacity: 0, borderWidth: '1px' }}
                    transition={{ duration: isGo ? 0.75 : 0.6, ease: 'easeOut' }}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: isGo ? '210px' : '170px',
                      height: isGo ? '210px' : '170px',
                      borderColor: cfg.border,
                      boxShadow: `0 0 35px ${cfg.glow}`,
                    }}
                  />

                  <motion.div
                    key={`card-${countdown}`}
                    initial={{ scale: 0.35, opacity: 0, rotate: isGo ? -12 : -6 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.45, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 18,
                      stiffness: 420,
                      mass: 0.8,
                    }}
                    style={{
                      backgroundColor: 'rgba(6, 9, 28, 0.92)',
                      border: `2px solid ${cfg.border}`,
                      boxShadow: `0 0 45px ${cfg.glow}, inset 0 0 25px ${cfg.glow}`,
                      borderRadius: '28px',
                    }}
                    className="flex flex-col items-center justify-center px-10 py-6 min-w-[170px] relative overflow-hidden backdrop-blur-xl"
                  >
                    <span
                      className="font-display font-black tracking-widest leading-none select-none"
                      style={{
                        fontSize: isGo ? '4rem' : '4.5rem',
                        color: cfg.color,
                        textShadow: `0 0 24px ${cfg.glow}, 0 0 48px ${cfg.glow}`,
                      }}
                    >
                      {countdown}
                    </span>

                    <span
                      className="font-tech text-xs tracking-widest font-bold uppercase mt-2 select-none"
                      style={{
                        color: cfg.color,
                        opacity: 0.95,
                        textShadow: `0 0 10px ${cfg.glow}`,
                      }}
                    >
                      {cfg.sub}
                    </span>
                  </motion.div>
                </div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Cyber Status Bar */}
      <footer className="absolute bottom-2 left-0 right-0 z-30 px-3.5 flex items-center justify-between pointer-events-none">
        {/* Lives */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06091c]/85 border border-white/10 shadow-lg backdrop-blur-md">
          {[1, 2, 3].map((heartIndex) => {
            const isAlive = heartIndex <= lives;
            return (
              <div
                key={`life-${heartIndex}`}
                className={`transition-all duration-300 ${
                  isAlive
                    ? 'text-red-400 drop-shadow-[0_0_8px_rgba(255,8,68,0.7)] scale-100'
                    : 'text-slate-600 scale-90 opacity-40'
                }`}
              >
                <Heart className={`w-5 h-5 ${isAlive ? 'fill-red-500' : ''}`} />
              </div>
            );
          })}
        </div>

        {/* Center: Live Remaining Targets */}
        {totalBreakable > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06091c]/85 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,247,255,0.2)] backdrop-blur-md">
            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-tech text-xs text-slate-300 tracking-wider">TARGETS</span>
            <span
              className="font-tech font-bold text-xs text-cyan-300 tracking-wider"
              style={{ textShadow: '0 0 8px rgba(0,247,255,0.6)' }}
            >
              {remainingTargets}
            </span>
          </div>
        )}

        {/* Stopwatch Timer */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#06091c]/85 border border-white/10 shadow-lg backdrop-blur-md">
          <span className="font-tech text-xs text-slate-400 tracking-wider">TIME</span>
          <span
            className="font-tech font-bold text-base text-cyan-300 tracking-wider"
            style={{ textShadow: '0 0 8px rgba(0,247,255,0.5)' }}
          >
            {timeUsed.toFixed(1)}s
          </span>
        </div>
      </footer>

      {/* Outcome Modal (Win or Game Over) */}
      <AnimatePresence>
        {summaryState && (summaryState.status === 'win' || summaryState.status === 'gameover') && (
          <GameSummaryModal
            summaryState={summaryState}
            levelNumber={levelNumber}
            coresEarned={coresEarned}
            isFirstClear={isFirstClear}
            hasNextLevel={hasNextLevel}
            onRetry={onRetry}
            onNextLevel={onNextLevel}
            onExit={onExit}
          />
        )}
      </AnimatePresence>
    </>
  );
};
