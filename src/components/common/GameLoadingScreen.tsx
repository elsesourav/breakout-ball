import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface GameLoadingScreenProps {
  isLoaded?: boolean;
  onAnimationComplete?: () => void;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({
  isLoaded = false,
  onAnimationComplete,
}) => {
  const [progress, setProgress] = useState(15);

  // Smooth, lightweight progress animation
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setProgress((prev) => {
        if (isLoaded) {
          const next = prev + dt * 180;
          if (next >= 100) return 100;
          return next;
        } else {
          if (prev < 90) {
            const speed = Math.max(14, (90 - prev) * 0.95);
            return Math.min(90, prev + dt * speed);
          }
          return prev;
        }
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isLoaded]);

  const roundedPercent = Math.min(100, Math.floor(progress));

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onAnimationComplete={onAnimationComplete}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030408] select-none"
    >
      <div className="flex flex-col items-center max-w-xs w-full px-6">
        {/* Transparent Icon without Background */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 flex items-center justify-center flex-shrink-0">
          <img
            src="/icon-breakout-clean.png"
            alt="Breakout Ball"
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0_18px_rgba(255,100,0,0.45)]"
          />
        </div>

        {/* Game Names */}
        <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-widest leading-none mb-1 text-center">
          BREAKOUT BALL
        </h1>
        <p className="font-tech text-[10px] text-cyan-400/70 tracking-[0.25em] uppercase font-bold mb-7 text-center">
          CYBERPUNK NEON ARCADE
        </p>

        {/* Simple Progress Bar */}
        <div className="w-48 h-1 rounded-full bg-white/[0.08] overflow-hidden relative">
          <div
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00f7ff 0%, #0284c7 100%)',
              boxShadow: '0 0 10px rgba(0, 247, 255, 0.5)',
            }}
            className="h-full rounded-full transition-[width] duration-100 ease-out"
          />
        </div>

        {/* Percentage */}
        <span className="font-mono text-xs text-slate-400 font-medium tracking-wider mt-2.5">
          {roundedPercent}%
        </span>
      </div>
    </motion.div>
  );
};
