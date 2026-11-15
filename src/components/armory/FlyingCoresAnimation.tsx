import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreIcon } from '../CoreIcon';

interface FlyingCoresAnimationProps {
  active: boolean;
  amount?: number;
  onComplete: () => void;
}

export const FlyingCoresAnimation: React.FC<FlyingCoresAnimationProps> = ({
  active,
  amount = 50,
  onComplete,
}) => {
  const [particles, setParticles] = useState<
    { id: number; delay: number; offsetX: number; offsetY: number; scaleMod: number }[]
  >([]);
  const [targetPos, setTargetPos] = useState({ x: 320, y: 35 });
  const [startPos, setStartPos] = useState({ x: 200, y: 380 });

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    if (typeof window !== 'undefined') {
      const badge = document.getElementById('header-cores-badge');
      if (badge) {
        const rect = badge.getBoundingClientRect();
        setTargetPos({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      } else {
        const centerX = window.innerWidth / 2;
        setTargetPos({
          x: Math.min(centerX + 125, window.innerWidth - 65),
          y: 35,
        });
      }

      setStartPos({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }

    // 14 glowing core crystals with radial dispersion & staggered delays
    const items = Array.from({ length: 14 }).map((_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const radius = 35 + (i % 3) * 22;
      return {
        id: i,
        delay: 0.25 + i * 0.08,
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius * 0.8,
        scaleMod: 0.9 + (i % 4) * 0.15,
      };
    });
    setParticles(items);

    const timer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden">
      <AnimatePresence>
        {/* Floating Celebration Reward Badge */}
        <motion.div
          key="reward-banner"
          initial={{ opacity: 0, scale: 0.4, y: 30 }}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            scale: [0.4, 1.15, 1, 1, 0.8],
            y: [30, -10, 0, 0, -35],
          }}
          transition={{ duration: 2.2, times: [0, 0.2, 0.35, 0.8, 1], ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: startPos.y - 80,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-[#070c26]/95 border-2 border-cyan-400 text-cyan-200 font-display font-black text-sm tracking-wider shadow-[0_0_35px_rgba(0,247,255,0.9),0_0_12px_rgba(255,215,0,0.4)] backdrop-blur-2xl"
        >
          <div className="w-7 h-7 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center animate-pulse">
            <CoreIcon size={18} glow variant="cyan" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-tech text-amber-400 tracking-widest uppercase font-bold">
              REWARD UNLOCKED
            </span>
            <span className="text-white text-sm">+{amount.toLocaleString()} CORES CLAIMED</span>
          </div>
        </motion.div>

        {/* 14 Gracefully Streaming Core Crystals */}
        {particles.map((p) => {
          const sX = startPos.x;
          const sY = startPos.y;
          const burstX = sX + p.offsetX;
          const burstY = sY + p.offsetY;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: sX,
                y: sY,
                scale: 0.2,
                opacity: 0,
              }}
              animate={{
                // 1) Radial Burst -> 2) Float -> 3) Smooth sweeping arc into target score badge
                x: [sX, burstX, burstX * 0.7 + targetPos.x * 0.3, targetPos.x],
                y: [sY, burstY, burstY - 80, targetPos.y],
                scale: [0.2, 1.3 * p.scaleMod, 1.1, 0.4],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.7,
                delay: p.delay,
                ease: [0.25, 1, 0.5, 1], // Smooth cubic-bezier flow
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-[#080d26]/90 shadow-[0_0_22px_#00f7ff,0_0_35px_rgba(0,247,255,0.7)] border border-cyan-300"
            >
              <CoreIcon size={18} glow variant="cyan" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
