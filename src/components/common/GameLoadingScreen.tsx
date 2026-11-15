import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface GameLoadingScreenProps {
  isLoaded?: boolean;
  onAnimationComplete?: () => void;
}

const PHASES = [
  { min: 0, max: 28, text: 'INITIALIZING NEURAL INTERFACE...' },
  { min: 28, max: 62, text: 'SYNCHRONIZING SECTOR MATRICES...' },
  { min: 62, max: 88, text: 'CALIBRATING KINETIC PLASMA CORES...' },
  { min: 88, max: 100, text: 'SYSTEM READY // ENGAGING ARCADE' },
];

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  isLoaded = false,
  onAnimationComplete,
}) => {
  const [progress, setProgress] = useState(12);

  // Smooth progress animation that smoothly accelerates to 100% when isLoaded becomes true
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        if (isLoaded) {
          // Rush to 100% once underlying resources are ready
          const next = prev + dt * 120;
          if (next >= 100) {
            return 100;
          }
          return next;
        } else {
          // Steadily advance up to 88% while waiting for resources
          if (prev < 88) {
            const speed = Math.max(12, (88 - prev) * 0.9);
            return Math.min(88, prev + dt * speed);
          }
          return prev;
        }
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isLoaded]);

  // Find active status message based on current progress
  const currentPhase =
    PHASES.find((p) => progress >= p.min && progress <= p.max) || PHASES[PHASES.length - 1];

  const roundedPercent = Math.min(100, Math.floor(progress));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onAnimationComplete}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050714] select-none overflow-hidden"
    >
      {/* ── 1. Cyber Ambient Background Grids & Radiance ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(rgba(0, 247, 255, 0.25) 1px, transparent 1px), radial-gradient(rgba(245, 158, 11, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px, 48px 48px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Atmospheric Radial Light Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-400/10 blur-[100px] pointer-events-none" />

      {/* ── 2. Top HUD Status Brackets ── */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-[10px] font-tech font-bold text-slate-400 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f7ff] animate-pulse" />
          <span className="tracking-widest text-cyan-300">SYS.KERNEL // ACTIVE</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 tracking-wider">
          <span className="text-amber-400/90">CYBER MATRIX</span>
          <span className="text-slate-600">•</span>
          <span>v1.0.4</span>
        </div>
      </div>

      {/* ── 3. Central Brand Stage ── */}
      <div className="relative flex flex-col items-center px-6 max-w-sm w-full z-10">
        {/* Glowing Holographic Halo Ring */}
        <div className="relative mb-6 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            className="absolute -inset-4 rounded-full border border-dashed border-cyan-400/30 pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
            className="absolute -inset-7 rounded-full border border-cyan-500/15 pointer-events-none"
          />

          {/* Game Icon Container */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
            className="relative"
          >
            <div
              style={{
                borderRadius: '26px',
                boxShadow:
                  '0 0 35px rgba(245, 158, 11, 0.45), 0 0 65px rgba(0, 247, 255, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.4)',
              }}
              className="w-24 h-24 sm:w-28 sm:h-28 p-1.5 bg-gradient-to-br from-[#0c1333] via-[#070b24] to-[#1a0f2e] border-2 border-cyan-400/70 overflow-hidden relative flex items-center justify-center"
            >
              <img
                src="/logo.png"
                alt="Breakout Ball Logo"
                className="w-full h-full object-cover rounded-[20px] pointer-events-none select-none drop-shadow-[0_0_12px_rgba(255,100,0,0.6)]"
              />
            </div>
          </motion.div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-6">
          <h1
            style={{
              textShadow: '0 0 24px rgba(0, 247, 255, 0.65), 0 0 45px rgba(0, 247, 255, 0.25)',
            }}
            className="font-display font-black text-2xl sm:text-3xl tracking-widest bg-gradient-to-r from-cyan-300 via-sky-100 to-amber-300 bg-clip-text text-transparent leading-none"
          >
            BREAKOUT BALL
          </h1>
          <p className="font-tech text-[10px] sm:text-xs text-cyan-400/80 tracking-[0.3em] uppercase mt-2 font-bold">
            CYBERPUNK NEON ARCADE
          </p>
        </div>

        {/* ── 4. Progress Bar & Realtime Stepper ── */}
        <div className="w-full max-w-[280px] flex flex-col gap-2">
          {/* Progress Track */}
          <div className="w-full h-2 rounded-full bg-black/60 border border-cyan-500/30 p-[1.5px] overflow-hidden relative shadow-inner">
            <motion.div
              style={{
                width: `${progress}%`,
                background:
                  'linear-gradient(90deg, #00f7ff 0%, #38bdf8 55%, #fbbf24 100%)',
                boxShadow: '0 0 14px #00f7ff, 0 0 25px rgba(251, 191, 36, 0.6)',
              }}
              className="h-full rounded-full relative transition-[width] duration-150 ease-out"
            >
              {/* Glowing leading laser tip */}
              <span className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
            </motion.div>
          </div>

          {/* Status Label & Percentage Row */}
          <div className="flex items-center justify-between text-[10px] font-tech font-bold text-slate-400 mt-1">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
              <span className="text-cyan-300 truncate tracking-wider">
                {currentPhase.text}
              </span>
            </div>
            <span className="font-mono text-cyan-400 font-black tracking-wider flex-shrink-0 ml-2">
              {roundedPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. Bottom HUD Meta Footer ── */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[9.5px] font-tech text-slate-400/80 pointer-events-none">
        <span className="tracking-widest">EST. CONNECTION: LOCALHOST</span>
        <div className="flex items-center gap-1.5 text-cyan-400/70">
          <span className="w-1 h-1 rounded-full bg-cyan-400" />
          <span>QUANTUM SHADER READY</span>
        </div>
      </div>
    </motion.div>
  );
};
