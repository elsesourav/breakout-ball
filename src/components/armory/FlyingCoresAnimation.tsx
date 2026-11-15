import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';

interface FlyingCoresAnimationProps {
  active: boolean;
  amount?: number;
  onComplete: () => void;
}

export const FlyingCoresAnimation: React.FC<FlyingCoresAnimationProps> = ({
  active,
  amount = 500,
  onComplete,
}) => {
  const [particles, setParticles] = useState<
    { id: number; delay: number; offsetX: number; offsetY: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate 10 particles with staggered delays for a slow, continuous stream
    const items = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      delay: i * 0.1,
      offsetX: (Math.random() - 0.5) * 80,
      offsetY: (Math.random() - 0.5) * 50,
    }));
    setParticles(items);

    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => {
          const startX = typeof window !== 'undefined' ? window.innerWidth / 2 + p.offsetX : 200;
          const startY = typeof window !== 'undefined' ? window.innerHeight / 2 + p.offsetY : 400;
          const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 + 125 : 320;
          const targetY = 24;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: startX,
                y: startY,
                scale: 0.2,
                opacity: 0,
              }}
              animate={{
                x: [startX, startX + p.offsetX * 1.8, targetX],
                y: [startY, startY - 120, targetY],
                scale: [0.2, 1.4, 0.7],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.35,
                delay: p.delay,
                ease: [0.25, 1, 0.4, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 text-white shadow-[0_0_20px_#00f7ff,0_0_35px_rgba(0,247,255,0.6)]"
            >
              <Zap className="w-4 h-4 fill-white text-white drop-shadow-[0_0_8px_#00f7ff]" />
            </motion.div>
          );
        })}

        {/* Floating Reward Amount Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: -45, scale: [0.8, 1.15, 1] }}
          transition={{ duration: 1.8, delay: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 300,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#080d26]/95 border border-cyan-400 text-cyan-300 font-display font-black text-sm tracking-wider shadow-[0_0_25px_rgba(0,247,255,0.8)] backdrop-blur-xl"
        >
          <Zap className="w-4 h-4 text-cyan-300 fill-cyan-300" />
          <span>+{amount.toLocaleString()} CORES</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
