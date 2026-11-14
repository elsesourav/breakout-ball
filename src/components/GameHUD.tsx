import React from 'react';
import { Home, RotateCcw, ChevronRight, Trophy, Zap, Heart, Shield, Boxes } from 'lucide-react';
import { ScoreState } from '../engine/types';

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
    sub: 'SYSTEM ENGAGED',
  },
  'GO!': {
    color: '#00ff66',
    border: '#00ff66',
    glow: 'rgba(0, 255, 102, 0.95)',
    sub: 'LAUNCH BALL!',
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

        {/* Right: Combo Streak Badge */}
        <div className="w-16 flex justify-end">
          {combo > 1 ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/50 shadow-[0_0_12px_rgba(255,180,0,0.4)] animate-pulse backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="font-tech font-black text-xs text-amber-300">
                {combo}x
              </span>
            </div>
          ) : (
            <div className="w-10 h-10" />
          )}
        </div>
      </header>

      {/* Floating Center Countdown - High-Contrast Neon Overhaul */}
      {countdown && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-[3px] transition-all">
          {(() => {
            const cfg = countdownTheme[countdown] || countdownTheme['GO!'];
            const isGo = countdown === 'GO!';
            return (
              <div className="relative flex flex-col items-center justify-center">
                {/* Expanding shockwave pulse ring */}
                <div
                  key={`pulse-${countdown}`}
                  className="absolute rounded-full animate-ping pointer-events-none"
                  style={{
                    width: isGo ? '220px' : '180px',
                    height: isGo ? '220px' : '180px',
                    border: `2px solid ${cfg.border}`,
                    boxShadow: `0 0 35px ${cfg.glow}`,
                  }}
                />

                {/* Outer Holographic Cyber Dial */}
                <div
                  className="relative flex flex-col items-center justify-center rounded-full backdrop-blur-md"
                  style={{
                    width: isGo ? '170px' : '140px',
                    height: isGo ? '170px' : '140px',
                    backgroundColor: 'rgba(5, 8, 26, 0.95)',
                    border: `3px solid ${cfg.color}`,
                    boxShadow: `0 0 45px ${cfg.glow}, inset 0 0 30px ${cfg.glow}`,
                  }}
                >
                  <span
                    key={countdown}
                    className="font-display font-black leading-none select-none tracking-widest animate-bounce"
                    style={{
                      fontSize: isGo ? '46px' : '68px',
                      color: '#ffffff',
                      textShadow: `0 0 15px #ffffff, 0 0 30px ${cfg.color}, 0 0 60px ${cfg.color}`,
                    }}
                  >
                    {countdown}
                  </span>

                  <span
                    className="font-tech font-bold text-[9px] uppercase tracking-widest mt-1.5 select-none text-center px-2"
                    style={{
                      color: cfg.color,
                      textShadow: `0 0 8px ${cfg.color}`,
                    }}
                  >
                    {cfg.sub}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Bottom Cyber Status Bar */}
      <footer className="absolute bottom-2 left-0 right-0 z-30 px-3.5 flex items-center justify-between pointer-events-none">
        {/* Lives: 3 Energy Shields / Hearts */}
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

        {/* Center: Live Remaining Targets Counter */}
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

      {/* Cyber Score Summary / Outcome Board (Win or Game Over) */}
      {summaryState && (summaryState.status === 'win' || summaryState.status === 'gameover') && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm flex flex-col rounded-xl bg-[#0a0d26] border border-cyan-500/40 p-5 shadow-[0_0_35px_rgba(0,247,255,0.3)]">
            {/* Header Banner */}
            <div className="flex flex-col items-center text-center pb-3 border-b border-white/10">
              {summaryState.status === 'win' ? (
                <>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)] mb-2">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <h2 className="font-display font-black text-2xl tracking-wider text-emerald-300">
                    LEVEL CLEARED!
                  </h2>
                  <p className="font-tech text-xs text-slate-300 tracking-wider mt-0.5">
                    MISSION ACCOMPLISHED
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] mb-2">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h2 className="font-display font-black text-2xl tracking-wider text-red-400">
                    GAME OVER
                  </h2>
                  <p className="font-tech text-xs text-slate-300 tracking-wider mt-0.5">
                    SYSTEM COMPROMISED
                  </p>
                </>
              )}
            </div>

            {/* Score Stats Table */}
            <div className="flex flex-col gap-2 my-4 rounded-xl bg-black/40 border border-white/10 p-3.5">
              <div className="flex justify-between items-center text-xs font-tech">
                <span className="text-slate-400 uppercase tracking-wider">Blocks Destroyed</span>
                <span className="font-bold text-white">
                  {summaryState.blocksDestroyed ?? 0} / {summaryState.totalBreakable ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-tech">
                <span className="text-slate-400 uppercase tracking-wider">Max Combo Streak</span>
                <span className="font-bold text-amber-300">
                  {summaryState.maxCombo ?? 0}x STREAK
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-tech">
                <span className="text-slate-400 uppercase tracking-wider">Time Taken</span>
                <span className="font-bold text-cyan-300">
                  {(summaryState.timeUsed ?? 0).toFixed(1)}s
                </span>
              </div>

              <div className="h-[1px] bg-white/10 my-1" />

              <div className="flex justify-between items-center">
                <span className="font-tech text-xs text-slate-300 uppercase tracking-widest">
                  TOTAL SCORE
                </span>
                <span
                  className="font-display font-black text-2xl text-amber-300"
                  style={{ textShadow: '0 0 15px rgba(255,215,0,0.6)' }}
                >
                  {(summaryState.score ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons with 12px border radius */}
            <div className="flex flex-col gap-2.5">
              {summaryState.status === 'win' && hasNextLevel && onNextLevel && (
                <button
                  onClick={onNextLevel}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-tech font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(0,247,255,0.4)] active:scale-98 transition-all hover:brightness-110 cursor-pointer"
                >
                  <span>NEXT MISSION</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 text-white font-tech font-bold text-xs tracking-wider active:scale-98 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>RETRY LEVEL</span>
                </button>
              )}

              <button
                onClick={onExit}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 font-tech text-xs tracking-wider active:scale-98 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>EXIT TO LEVEL MAP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
