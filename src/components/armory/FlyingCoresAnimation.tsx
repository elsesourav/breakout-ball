import React, { useEffect, useRef } from 'react';
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
  startX: number;
  startY: number;
  controlX: number;
  controlY: number;
  targetX: number;
  targetY: number;
  delayMs: number;
  durationMs: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  hasLanded: boolean;
}

interface ImpactRipple {
  x: number;
  y: number;
  startTime: number;
  duration: number;
}

export const FlyingCoresAnimation: React.FC<FlyingCoresAnimationProps> = ({
  active,
  amount = 50,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // 1. Determine Start Position (Screen Center)
    const startX = width / 2;
    const startY = height * 0.42;

    // 2. Determine Target Position (Top-Right Core Section)
    let targetX = width - 65;
    let targetY = 32;

    const badge = document.getElementById('header-cores-badge');
    if (badge) {
      const rect = badge.getBoundingClientRect();
      if (rect.width > 0 && rect.top >= 0 && rect.bottom <= height) {
        targetX = rect.left + rect.width / 2;
        targetY = rect.top + rect.height / 2;
      }
    }

    // 3. Generate 14 Sparkling Crystal Particles
    const PARTICLE_COUNT = 14;
    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const burstDist = 28 + (i % 4) * 12;
      const burstX = startX + Math.cos(angle) * burstDist;
      const burstY = startY + Math.sin(angle) * (burstDist * 0.7);

      const midY = Math.max(20, (burstY + targetY) / 2 - 30);
      const midX = burstX * 0.6 + targetX * 0.4 + (i % 2 === 0 ? 25 : -20);

      particles.push({
        id: i,
        startX: burstX,
        startY: burstY,
        controlX: midX,
        controlY: midY,
        targetX,
        targetY,
        delayMs: 40 + i * 26, // Tight staggered launch: 40ms to ~380ms
        durationMs: 440 + (i % 3) * 30, // Swift 440ms - 500ms swooping flight
        size: 9 + (i % 3) * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (i % 2 === 0 ? 1 : -1) * (4 + (i % 3) * 2),
        hasLanded: false,
      });
    }

    const impacts: ImpactRipple[] = [];
    const animStart = performance.now();
    let animFrameId: number;
    let soundIndex = 0;

    const render = (now: number) => {
      const elapsed = now - animStart;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      let allDone = true;

      // ── Draw & Animate Particles ───────────────────────────────────────
      for (const p of particles) {
        const particleElapsed = elapsed - p.delayMs;

        if (particleElapsed < 0) {
          allDone = false;
          continue;
        }

        const progress = Math.min(1, particleElapsed / p.durationMs);

        if (progress < 1) {
          allDone = false;
          // Smooth accelerating ease-out-in curve
          const t = progress * progress * (3 - 2 * progress);
          const inv = 1 - t;

          // Quadratic Bezier Formula: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
          const curX = inv * inv * p.startX + 2 * inv * t * p.controlX + t * t * p.targetX;
          const curY = inv * inv * p.startY + 2 * inv * t * p.controlY + t * t * p.targetY;
          const curSize = p.size * (1 - t * 0.4);
          const rot = p.rotation + (particleElapsed / 1000) * p.rotSpeed;

          // Draw Glowing Cyber Crystal Core
          ctx.save();
          ctx.translate(curX, curY);
          ctx.rotate(rot);

          // Outer Neon Cyan Glow
          ctx.shadowColor = '#00f7ff';
          ctx.shadowBlur = 10;

          // Crystal Diamond Body
          ctx.fillStyle = '#00f7ff';
          ctx.beginPath();
          ctx.moveTo(0, -curSize);
          ctx.lineTo(curSize * 0.72, 0);
          ctx.lineTo(0, curSize);
          ctx.lineTo(-curSize * 0.72, 0);
          ctx.closePath();
          ctx.fill();

          // Brilliant White Inner Core
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0, -curSize * 0.45);
          ctx.lineTo(curSize * 0.32, 0);
          ctx.lineTo(0, curSize * 0.45);
          ctx.lineTo(-curSize * 0.32, 0);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        } else if (!p.hasLanded) {
          p.hasLanded = true;
          // Spawn Impact Ripple on arrival at top-right badge
          impacts.push({
            x: p.targetX,
            y: p.targetY,
            startTime: now,
            duration: 260,
          });

          // Play ascending melodic crystal chime
          soundIndex++;
          if (soundIndex % 3 === 0) {
            synthAudio.playComboHit(Math.min(soundIndex / 3, 5));
          }
        }
      }

      // ── Draw Impact Shockwave Rings ────────────────────────────────────
      for (let i = impacts.length - 1; i >= 0; i--) {
        const imp = impacts[i];
        const impProgress = (now - imp.startTime) / imp.duration;

        if (impProgress < 1) {
          allDone = false;
          const r = 8 + impProgress * 22;
          const alpha = 1 - impProgress;

          ctx.save();
          ctx.beginPath();
          ctx.arc(imp.x, imp.y, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 247, 255, ${alpha})`;
          ctx.lineWidth = 2 * alpha;
          ctx.shadowColor = '#00f7ff';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.restore();
        } else {
          impacts.splice(i, 1);
        }
      }

      ctx.restore();

      if (!allDone || elapsed < 1200) {
        animFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete();
      }
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden select-none">
      {/* 1. Hardware-Accelerated 60FPS Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* 2. Floating Celebration Reward Badge */}
      <AnimatePresence>
        <motion.div
          key="reward-banner"
          initial={{ opacity: 0, scale: 0.6, y: 15 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.6, 1.05, 1, 0.9],
            y: [15, -4, 0, -20],
          }}
          transition={{
            duration: 1.25,
            times: [0, 0.15, 0.8, 1],
            ease: 'easeOut',
          }}
          style={{
            position: 'fixed',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 130,
            pointerEvents: 'none',
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
      </AnimatePresence>
    </div>
  );
};
