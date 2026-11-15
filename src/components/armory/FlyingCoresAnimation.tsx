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
    { id: number; delay: number; offsetX: number; offsetY: number; scaleMod: number }[]
  >([]);
  const [targetPos, setTargetPos] = useState({ x: 320, y: 26 });
  const [startPos, setStartPos] = useState({ x: 200, y: 380 });

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Determine target location from the DOM badge element if available
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
          y: 26,
        });
      }

      setStartPos({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }

    // Generate 12 glowing core particles with staggered delays for a rich stream
    const items = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      delay: i * 0.08,
      offsetX: Math.sin(i * 1.5) * 45,
      offsetY: Math.cos(i * 1.5) * 35,
      scaleMod: 0.9 + Math.random() * 0.3,
    }));
    setParticles(items);

    const timer = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => {
          const sX = startPos.x + p.offsetX;
          const sY = startPos.y + p.offsetY;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: sX,
                y: sY,
                scale: 0.3,
                opacity: 0,
              }}
              animate={{
                x: [sX, sX + p.offsetX * 1.6, targetPos.x],
                y: [sY, sY - 110, targetPos.y],
                scale: [0.3, 1.4 * p.scaleMod, 1.1, 0.2],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 1.45,
                delay: p.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 text-white shadow-[0_0_22px_#00f7ff,0_0_38px_rgba(0,247,255,0.7),inset_0_0_6px_#ffffff] border border-cyan-200"
            >
              <Zap className="w-4 h-4 fill-white text-white drop-shadow-[0_0_8px_#00f7ff]" />
            </motion.div>
          );
        })}

        {/* Floating Reward Notification Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.8 }}
          animate={{ opacity: [0, 1, 1, 0], y: -45, scale: [0.8, 1.12, 1] }}
          transition={{ duration: 2.0, delay: 0.25, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: startPos.y - 120,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#080d26]/95 border-2 border-cyan-400 text-cyan-300 font-display font-black text-sm tracking-wider shadow-[0_0_28px_rgba(0,247,255,0.85)] backdrop-blur-xl"
        >
          <Zap className="w-4 h-4 text-cyan-300 fill-cyan-300 animate-pulse" />
          <span>+{amount.toLocaleString()} CORES CLAIMED</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
