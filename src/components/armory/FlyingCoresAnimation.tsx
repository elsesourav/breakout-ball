import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoreIcon } from '../common/CoreIcon';
import { soundManager } from '../../audio';

interface FlyingCoresAnimationProps {
  active: boolean;
  amount?: number;
  origin?: { x: number; y: number } | null;
  onComplete: () => void;
  triggerKey?: number | string;
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
  amount,
  origin,
  onComplete,
  triggerKey,
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

    // 1. Calculate accurate start & target positions (icon after the number)
    const currentOrigin = originRef.current;
    const sX = currentOrigin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const sY = currentOrigin?.y ?? (typeof window !== 'undefined' ? window.innerHeight * 0.55 : 350);
    setStartPos({ x: sX, y: sY });

    let foundTarget = { x: 320, y: 28 };
    if (typeof document !== 'undefined') {
      const iconEl =
        document.getElementById('top-cores-badge-icon') ||
        document.querySelector('#top-cores-badge svg') ||
        document.querySelector('#header-cores-badge svg') ||
        document.querySelector('[title*="Cores"] svg') ||
        document.getElementById('top-cores-badge');
      if (iconEl) {
        const rect = iconEl.getBoundingClientRect();
        if (rect.width > 0 && rect.right > 0) {
          foundTarget = {
            x: Math.round(rect.left + rect.width / 2),
            y: Math.round(rect.top + rect.height / 2),
          };
        }
      } else if (typeof window !== 'undefined') {
        foundTarget = {
          x: Math.min(window.innerWidth - 30, window.innerWidth - 35),
          y: 28,
        };
      }
    }
    setTargetPos(foundTarget);

    // 2. Spawn sleek glowing core crystals across source burst radius (source part preserved)
    const count = amount && amount >= 5000 ? 14 : amount && amount >= 1000 ? 11 : 9;
    const items: Particle[] = Array.from({ length: count }).map((_, i) => {
      // Big random radial distribution inside radius ~36px around click origin
      const randAngle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
      const randDist = 12 + Math.random() * 26;
      return {
        id: i,
        delay: 0.02 + i * 0.045,
        duration: 0.88 + (i % 3) * 0.06,
        offsetX: Math.cos(randAngle) * randDist,
        offsetY: Math.sin(randAngle) * randDist,
        curveOffset: (i % 2 === 0 ? 1 : -1) * (14 + (i % 4) * 8),
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
  }, [active, triggerKey, amount]);

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
          const midX = sX + (targetPos.x - sX) * 0.55 + p.curveOffset;
          const midY = sY + (targetPos.y - sY) * 0.55 + (p.id % 2 === 0 ? -12 : 12);

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
                x: [sX, sX + p.offsetX * 0.4, midX, targetPos.x, targetPos.x],
                y: [sY, sY + p.offsetY * 0.4 - 8, midY, targetPos.y, targetPos.y],
                scale: [0.3, 1.15 * p.scaleMod, 1.0, 0.95, 0],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                times: [0, 0.12, 0.55, 0.90, 1.0],
                ease: [0.25, 0.1, 0.25, 1.0],
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                marginLeft: -10,
                marginTop: -10,
                zIndex: 1000002,
              }}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#080d26]/90 shadow-[0_0_12px_#00f7ff] border border-cyan-300 pointer-events-none"
            >
              <CoreIcon size={12} glow variant="cyan" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
