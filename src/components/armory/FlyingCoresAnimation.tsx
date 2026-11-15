import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';

interface FlyingCoresAnimationProps {
  active: boolean;
  onComplete: () => void;
}

export const FlyingCoresAnimation: React.FC<FlyingCoresAnimationProps> = ({
  active,
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

    // Generate 8 particles with staggered delays and slight dispersion
    const items = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      delay: i * 0.08,
      offsetX: (Math.random() - 0.5) * 60,
      offsetY: (Math.random() - 0.5) * 40,
    }));
    setParticles(items);

    const timer = setTimeout(() => {
      onComplete();
    }, 1400);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => {
          // Travel from center of screen toward top-right Cores badge
          const startX = typeof window !== 'undefined' ? window.innerWidth / 2 + p.offsetX : 200;
          const startY = typeof window !== 'undefined' ? window.innerHeight / 2 + p.offsetY : 400;
          const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 + 130 : 330;
          const targetY = 28;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: startX,
                y: startY,
                scale: 0.3,
                opacity: 0,
              }}
              animate={{
                x: [startX, startX + p.offsetX * 1.5, targetX],
                y: [startY, startY - 80, targetY],
                scale: [0.3, 1.3, 0.6],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 0.85,
                delay: p.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-400 text-black shadow-[0_0_15px_#00f7ff]"
            >
              <Zap className="w-4 h-4 fill-white text-white drop-shadow-[0_0_6px_#00f7ff]" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
