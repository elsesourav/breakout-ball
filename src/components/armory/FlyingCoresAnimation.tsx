import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreIcon } from '../common/CoreIcon';
import { soundManager } from '../../audio';

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

    // 1. Calculate accurate start & target positions once per active trigger
    const currentOrigin = originRef.current;
    const sX = currentOrigin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const sY = currentOrigin?.y ?? (typeof window !== 'undefined' ? window.innerHeight * 0.55 : 350);
    setStartPos({ x: sX, y: sY });

    let foundTarget = { x: 320, y: 28 };
    if (typeof document !== 'undefined') {
      const badge =
        document.getElementById('top-cores-badge') ||
        document.getElementById('header-cores-badge') ||
        document.querySelector('[title*="Cores"]');
      if (badge) {
        const icon = badge.querySelector('svg');
        const rect = icon ? icon.getBoundingClientRect() : badge.getBoundingClientRect();
        if (rect.width > 0 && rect.right > 0) {
          foundTarget = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      } else if (typeof window !== 'undefined') {
        foundTarget = {
          x: Math.min(window.innerWidth - 45, window.innerWidth - 40),
          y: 28,
        };
      }
    }
    setTargetPos(foundTarget);

    // 2. Spawn sleek glowing core crystals across a generous source burst radius
    const count = 9;
    const items: Particle[] = Array.from({ length: count }).map((_, i) => {
      // Big random radial distribution inside radius ~36px around click origin
      const randAngle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const randDist = 12 + Math.random() * 26;
      return {
        id: i,
        delay: 0.02 + i * 0.05,
        duration: 1.05 + (i % 3) * 0.07,
        offsetX: Math.cos(randAngle) * randDist,
        offsetY: Math.sin(randAngle) * randDist,
        curveOffset: (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 8),
        scaleMod: 0.95 + (i % 3) * 0.1,
      };
    });
    setParticles(items);

    // 3. Complete whole animation sequence smoothly at 1.6s
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 1600);

    return () => {
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
