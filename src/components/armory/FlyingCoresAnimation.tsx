import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreIcon } from '../CoreIcon';
import { synthAudio } from '../../utils/synthAudio';

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
        // If badge is in active visible window
        if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.width > 0) {
          setTargetPos({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          });
          return;
        }
      }

      // Fallback: top right corner where cores counter is fixed
      setTargetPos({
        x: Math.min(window.innerWidth - 65, sX + 130),
        y: 32,
      });
    };

    calcPositions();

    // 14 glowing core crystals with rapid radial burst & tight stream delays
    const items: Particle[] = Array.from({ length: 14 }).map((_, i) => {
      const angle = (i / 14) * Math.PI * 2 + (i % 2 === 0 ? 0.2 : -0.2);
      const radius = 35 + (i % 4) * 16;
      return {
        id: i,
        delay: 0.06 + i * 0.028, // Fast staggered stream: 0.06s to 0.42s
        duration: 0.46 + (i % 3) * 0.03, // 0.46s to 0.52s fast flight
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius * 0.75,
        curveOffset: (i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15),
        scaleMod: 0.95 + (i % 3) * 0.12,
      };
    });
    setParticles(items);

    // Staggered impact wave rings & melodic crystal chimes as particles land
    const impactTimers: ReturnType<typeof setTimeout>[] = [];
    [0.42, 0.55, 0.68, 0.82].forEach((timeSec, idx) => {
      impactTimers.push(
        setTimeout(() => {
          setImpacts((prev) => [...prev.slice(-3), { id: Date.now() + idx, key: idx }]);
          synthAudio.playComboHit(idx + 1);
        }, timeSec * 1000)
      );
    });

    // Complete whole animation sequence rapidly (1.45s instead of 2.8s)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1450);

    return () => {
      clearTimeout(completeTimer);
      impactTimers.forEach(clearTimeout);
    };
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden">
      <AnimatePresence>
        {/* Floating Celebration Reward Badge */}
        <motion.div
          key="reward-banner"
          initial={{ opacity: 0, scale: 0.5, y: 25 }}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            scale: [0.5, 1.1, 1, 1, 0.88],
            y: [25, -6, 0, 0, -28],
          }}
          transition={{ duration: 1.35, times: [0, 0.15, 0.3, 0.82, 1], ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: startPos.y - 75,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#070c26]/95 border-2 border-cyan-400 text-cyan-200 font-display font-black text-sm tracking-wider shadow-[0_0_35px_rgba(0,247,255,0.9),0_0_12px_rgba(255,215,0,0.4)] backdrop-blur-2xl"
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

        {/* Impact Rings at Top-Right Destination Badge */}
        {impacts.map((imp) => (
          <motion.div
            key={imp.id}
            initial={{ scale: 0.3, opacity: 1 }}
            animate={{ scale: 2.0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: targetPos.y - 18,
              left: targetPos.x - 18,
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid #00f7ff',
              boxShadow: '0 0 16px rgba(0, 247, 255, 0.95), inset 0 0 10px rgba(0, 247, 255, 0.6)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* 14 Fast, Gracefully Streaming Core Crystals */}
        {particles.map((p) => {
          const sX = startPos.x;
          const sY = startPos.y;
          const burstX = sX + p.offsetX;
          const burstY = sY + p.offsetY;
          // Mid-point arched control point for swooping trajectory
          const midX = burstX * 0.55 + targetPos.x * 0.45 + p.curveOffset;
          const midY = Math.min(burstY, targetPos.y) - 35;

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
                // 1) Rapid burst -> 2) Swooping mid arc -> 3) Snap into target top-right badge
                x: [sX, burstX, midX, targetPos.x],
                y: [sY, burstY, midY, targetPos.y],
                scale: [0.3, 1.25 * p.scaleMod, 1.05, 0.35],
                opacity: [0, 1, 1, 0],
                rotate: [0, p.id % 2 === 0 ? 120 : -120, p.id % 2 === 0 ? 280 : -280],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.32, 0, 0.67, 0], // Energetic accelerating cubic bezier into target
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-[#080d26]/90 shadow-[0_0_18px_#00f7ff,0_0_28px_rgba(0,247,255,0.75)] border border-cyan-300"
            >
              <CoreIcon size={15} glow variant="cyan" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
