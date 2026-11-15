import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreIcon } from '../CoreIcon';
import { soundManager } from '../../utils/audio';

interface FlyingCoresAnimationProps {
  active: boolean;
  amount?: number;
  origin?: { x: number; y: number } | null;
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
  origin,
  onComplete,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [targetPos, setTargetPos] = useState({ x: 320, y: 28 });
  const [startPos, setStartPos] = useState({ x: 200, y: 350 });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const originRef = useRef(origin);
  originRef.current = origin;

  const hasPlayedSoundRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      hasPlayedSoundRef.current = false;
      return;
    }

    hasPlayedSoundRef.current = false;

    // 1. Calculate start & target positions once per active trigger
    const currentOrigin = originRef.current;
    const sX = currentOrigin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const sY = currentOrigin?.y ?? (typeof window !== 'undefined' ? window.innerHeight * 0.55 : 350);
    setStartPos({ x: sX, y: sY });

    const badge = typeof document !== 'undefined' ? document.getElementById('header-cores-badge') : null;
    if (badge) {
      const rect = badge.getBoundingClientRect();
      if (rect.width > 0 && rect.right > 0) {
        setTargetPos({
          x: rect.left + rect.width / 2,
          y: rect.top >= 0 && rect.bottom <= 120 ? rect.top + rect.height / 2 : 28,
        });
      }
    } else if (typeof window !== 'undefined') {
      setTargetPos({
        x: Math.min(window.innerWidth - 65, window.innerWidth / 2 + 130),
        y: 28,
      });
    }

    // 2. Spawn 8 sleek glowing core crystals
    const count = 8;
    const items: Particle[] = Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const spread = 8 + (i % 3) * 6;
      return {
        id: i,
        delay: 0.04 + i * 0.07,
        duration: 1.15 + (i % 3) * 0.06,
        offsetX: Math.cos(angle) * spread,
        offsetY: Math.sin(angle) * spread,
        curveOffset: (i % 2 === 0 ? 1 : -1) * (14 + (i % 3) * 8),
        scaleMod: 0.95 + (i % 2) * 0.1,
      };
    });
    setParticles(items);

    // 3. Play EXACTLY ONE crisp collection chime when cores land at destination
    // (Protected by hasPlayedSoundRef to guarantee it never repeats or loops)
    const soundTimer = setTimeout(() => {
      if (!hasPlayedSoundRef.current) {
        hasPlayedSoundRef.current = true;
        soundManager.playCollectCore();
      }
    }, 750);

    // 4. Complete whole animation sequence smoothly at 1.7s
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 1700);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(completeTimer);
    };
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div
      style={{ zIndex: 999999 }}
      className="fixed inset-0 pointer-events-none select-none overflow-hidden"
    >
      <AnimatePresence>
        {particles.map((p) => {
          const sX = startPos.x + p.offsetX;
          const sY = startPos.y + p.offsetY;
          const midX = sX * 0.45 + targetPos.x * 0.55 + p.curveOffset;
          const midY = Math.min(sY, targetPos.y) - 30;

          return (
            <motion.div
              key={p.id}
              initial={{
                x: sX,
                y: sY,
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                x: [sX, sX, midX, targetPos.x],
                y: [sY, sY - 6, midY, targetPos.y],
                scale: [0.5, 1.05 * p.scaleMod, 0.9, 0.35],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                times: [0, 0.15, 0.75, 1],
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1000002,
              }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#080d26]/90 shadow-[0_0_12px_#00f7ff] border border-cyan-300"
            >
              <CoreIcon size={12} glow variant="cyan" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
