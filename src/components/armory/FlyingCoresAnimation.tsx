import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreIcon } from '../CoreIcon';
import { soundManager } from '../../utils/audio';

interface FlyingCoresAnimationProps {
  active: boolean;
  amount?: number;
  onComplete: () => void;
}

interface Particle {
  id: number;
  delay: number;
  duration: number;
  offsetX: number;
  offsetY: number;
  curveOffset: number;
  scaleMod: number;
}

export const FlyingCoresAnimation: React.FC<FlyingCoresAnimationProps> = ({
  active,
  amount = 50,
  onComplete,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [targetPos, setTargetPos] = useState({ x: 320, y: 35 });
  const [startPos, setStartPos] = useState({ x: 200, y: 380 });
  const [impacts, setImpacts] = useState<{ id: number; key: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      setImpacts([]);
      return;
    }

    const calcPositions = () => {
      if (typeof window === 'undefined') return;
      const sX = window.innerWidth / 2;
      const sY = window.innerHeight * 0.45;
      setStartPos({ x: sX, y: sY });

      const badge = document.getElementById('header-cores-badge');
      if (badge) {
        const rect = badge.getBoundingClientRect();
        if (rect.width > 0 && rect.right > 0) {
          setTargetPos({
            x: rect.left + rect.width / 2,
            y: rect.top >= 0 && rect.bottom <= 120 ? rect.top + rect.height / 2 : 28,
          });
          return;
        }
      }

      // Fallback: top right corner where cores counter sits
      setTargetPos({
        x: Math.min(window.innerWidth - 65, sX + 130),
        y: 28,
      });
    };

    calcPositions();

    // 14 glowing core crystals with smooth graceful flight
    const items: Particle[] = Array.from({ length: 14 }).map((_, i) => {
      const angle = (i / 14) * Math.PI * 2 + (i % 2 === 0 ? 0.2 : -0.2);
      const radius = 28 + (i % 4) * 12;
      return {
        id: i,
        delay: 0.12 + i * 0.045, // Staggered stream: 0.12s to 0.70s
        duration: 0.85 + (i % 3) * 0.08, // 0.85s to 1.01s smooth, gentle flight
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius * 0.75,
        curveOffset: (i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 12),
        scaleMod: 0.95 + (i % 3) * 0.1,
      };
    });
    setParticles(items);

    // Staggered impact wave rings & melodic crystal chimes as particles land at top-right
    const impactTimers: ReturnType<typeof setTimeout>[] = [];
    [0.90, 1.10, 1.30, 1.50].forEach((timeSec, idx) => {
      impactTimers.push(
        setTimeout(() => {
          setImpacts((prev) => [...prev.slice(-3), { id: Date.now() + idx, key: idx }]);
          soundManager.playCollectCore(idx + 1);
        }, timeSec * 1000)
      );
    });

    // Complete whole animation sequence smoothly (1.9s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(completeTimer);
      impactTimers.forEach(clearTimeout);
    };
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div
      style={{ zIndex: 999999 }}
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
    >
      <AnimatePresence>
        {/* 1. Perfectly Centered Floating Celebration Reward Badge */}
        <div
          key="reward-container"
          style={{ zIndex: 1000000 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none px-4"
        >
          <motion.div
            key="reward-banner"
            initial={{ opacity: 0, scale: 0.7, y: 16 }}
            animate={{
              opacity: [0, 1, 1, 1, 0],
              scale: [0.7, 1.04, 1, 1, 0.9],
              y: [16, -4, 0, 0, -22],
            }}
            transition={{
              duration: 1.8,
              times: [0, 0.12, 0.28, 0.85, 1],
              ease: 'easeOut',
            }}
            style={{
              boxShadow: '0 0 35px rgba(0, 247, 255, 0.85), 0 0 15px rgba(245, 158, 11, 0.4), inset 0 0 14px rgba(0, 247, 255, 0.25)',
              border: '2px solid #00f7ff',
              borderRadius: '20px',
              backgroundColor: 'rgba(7, 12, 38, 0.96)',
            }}
            className="flex items-center gap-3 px-6 py-3 text-cyan-200 backdrop-blur-2xl pointer-events-none select-none max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center animate-pulse shrink-0 shadow-[0_0_12px_rgba(0,247,255,0.6)]">
              <CoreIcon size={20} glow variant="cyan" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-tech text-amber-400 tracking-widest uppercase font-black">
                REWARD UNLOCKED
              </span>
              <span className="text-white font-display font-black text-sm tracking-wide">
                +{amount.toLocaleString()} CORES CLAIMED
              </span>
            </div>
          </motion.div>
        </div>

        {/* 2. Impact Rings at Top-Right Destination Badge */}
        {impacts.map((imp) => (
          <motion.div
            key={imp.id}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: targetPos.y - 18,
              left: targetPos.x - 18,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid #00f7ff',
              boxShadow: '0 0 18px rgba(0, 247, 255, 0.95), inset 0 0 10px rgba(0, 247, 255, 0.6)',
              pointerEvents: 'none',
              zIndex: 1000001,
            }}
          />
        ))}

        {/* 3. 14 Glowing, Streaming Core Crystals Floating from Center to Top-Right */}
        {particles.map((p) => {
          const sX = startPos.x;
          const sY = startPos.y;
          const burstX = sX + p.offsetX;
          const burstY = sY + p.offsetY;
          // Mid-point arched control point for swooping trajectory into top-right
          const midX = burstX * 0.5 + targetPos.x * 0.5 + p.curveOffset;
          const midY = Math.min(burstY, targetPos.y) - 40;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: sX,
                y: sY,
                scale: 0.3,
                opacity: 0,
                rotate: 0,
              }}
              animate={{
                // 1) Gentle radial burst -> 2) Swooping mid arc -> 3) Smooth glide into top-right badge
                x: [sX, burstX, midX, targetPos.x],
                y: [sY, burstY, midY, targetPos.y],
                scale: [0.3, 1.05 * p.scaleMod, 0.95, 0.35],
                opacity: [0, 1, 1, 0],
                rotate: [0, p.id % 2 === 0 ? 90 : -90, p.id % 2 === 0 ? 220 : -220],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.25, 0.1, 0.25, 1.0], // Silky smooth cubic ease-in-out
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1000002,
              }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#080d26]/95 shadow-[0_0_14px_#00f7ff,0_0_24px_rgba(0,247,255,0.75)] border border-cyan-300"
            >
              <CoreIcon size={12} glow variant="cyan" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
