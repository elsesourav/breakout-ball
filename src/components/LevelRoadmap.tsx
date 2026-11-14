import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import {
  TOTAL_LEVELS,
  SPACING,
  SVG_WIDTH,
  BOTTOM_OFFSET,
  TOTAL_HEIGHT,
  SECTOR_CONFIG,
  RoadmapNode,
  FloatingBrick,
  Obstacle,
  RouteBlocker,
} from './roadmap/types';
import { RoadmapConduitSvg } from './roadmap/RoadmapConduitSvg';
import { RoadmapObstacles } from './roadmap/RoadmapObstacles';
import { RoadmapSectorBanner } from './roadmap/RoadmapSectorBanner';
import { RoadmapNodeItem } from './roadmap/RoadmapNodeItem';

// ─── Scroll-linked perspective scale ─────────────────────────────────────────
// Screen-linked perspective depth with strict foreground size ceiling:
//   normalizedY = 0  → top of viewport (far / vanishing point)  → SCALE_MIN
//   normalizedY >= FOREGROUND_LIMIT_Y → closer objects          → capped at SCALE_MAX
// Objects smoothly scale from distant horizon size up to a strict maximum limit
// in the closer foreground, preventing closer elements from ballooning or becoming oversized.
const SCALE_MIN = 0.35;          // horizon vanishing size limit
const SCALE_MAX = 0.85;          // strict maximum size limit for closer objects
const FOREGROUND_LIMIT_Y = 0.65; // foreground threshold where size growth reaches its limit
const FADE_ZONE = 0.08;          // top 8% of viewport dissolves into horizon haze

export const LevelRoadmap: React.FC = () => {
  const { localLevels, localProgress, openPreview, showAlert } = useGame();
  const scrollRef    = useRef<HTMLDivElement>(null);
  const activeRef    = useRef<HTMLDivElement | null>(null);
  const rafRef       = useRef<number>(0);
  const initScrolled = useRef(false);

  // Cached list of all scalable map elements (.roadmap-scale-item)
  const scaleElementsRef = useRef<HTMLElement[]>([]);

  // ── Node layout ─────────────────────────────────────────────────────────────
  const nodes: RoadmapNode[] = useMemo(() => {
    const list: RoadmapNode[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const y = TOTAL_HEIGHT - BOTTOM_OFFSET - (i - 1) * SPACING;
      const angle = (i - 1) * 1.05;
      const x = 190 + Math.sin(angle) * 95;
      let zone = 1;
      if (i > 24) zone = 5;
      else if (i > 18) zone = 4;
      else if (i > 12) zone = 3;
      else if (i > 6)  zone = 2;
      list.push({ id: i, x: Math.round(x), y: Math.round(y), zone, sector: SECTOR_CONFIG[i] });
    }
    return list;
  }, []);

  // ── Current unlocked level ───────────────────────────────────────────────────
  const currentUnlockedId = useMemo(() => {
    let highest = 1;
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      if (localProgress[String(i)] !== undefined) highest = i;
    }
    return highest;
  }, [localProgress]);

  // ── Ambient floating bricks ─────────────────────────────────────────────────
  const floatingBricks: FloatingBrick[] = useMemo(() => {
    const bricks: FloatingBrick[] = [];
    const palette = [
      { color: '#00f7ff', glow: 'rgba(0,247,255,0.6)' },
      { color: '#818cf8', glow: 'rgba(129,140,248,0.6)' },
      { color: '#f43f5e', glow: 'rgba(244,63,94,0.6)' },
      { color: '#10b981', glow: 'rgba(16,185,129,0.6)' },
      { color: '#ffd700', glow: 'rgba(255,215,0,0.6)' },
    ];
    for (let i = 0; i < 18; i++) {
      const p = palette[i % palette.length];
      const y = (TOTAL_HEIGHT / 18) * i + ((i * 47) % 60);
      const iL = i % 2 === 0;
      const w = 34 + ((i * 7) % 12);
      const h = 15 + ((i * 3) % 6);
      const x = iL ? 20 + ((i * 15) % 25) : SVG_WIDTH - w - 20 - ((i * 17) % 25);
      bricks.push({
        id: i, x, y, w, h, color: p.color, glow: p.glow,
        rotation: ((i * 17) % 30) - 15, opacity: 0.18 + ((i * 5) % 15) * 0.01,
      });
    }
    return bricks;
  }, []);

  // ── Kinetic hazards ──────────────────────────────────────────────────────────
  const obstacles: Obstacle[] = useMemo(() => ([
    { id: 'titanium-1', type: 'titanium', x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 2.5  * SPACING },
    { id: 'plasma-1',   type: 'plasma',   x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 4.5  * SPACING },
    { id: 'titanium-2', type: 'titanium', x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 8.5  * SPACING },
    { id: 'plasma-2',   type: 'plasma',   x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 10.5 * SPACING },
    { id: 'titanium-3', type: 'titanium', x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 14.5 * SPACING },
    { id: 'plasma-3',   type: 'plasma',   x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 16.5 * SPACING },
    { id: 'titanium-4', type: 'titanium', x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 20.5 * SPACING },
    { id: 'plasma-4',   type: 'plasma',   x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 22.5 * SPACING },
  ]), []);

  // ── Route blockers ───────────────────────────────────────────────────────────
  const routeBlockers: RouteBlocker[] = useMemo(() => {
    return nodes.slice(0, -1).map((curr, idx) => {
      const i = idx + 1;
      const next = nodes[idx + 1];
      return {
        id: `route-blocker-${i}`,
        fromLevel: i,
        toLevel: i + 1,
        x: Math.round((curr.x + next.x) / 2),
        y: Math.round((curr.y + next.y) / 2),
        type: i % 3 === 0 ? 'quantum_gate' : i % 2 === 0 ? 'plasma_shield' : 'firewall',
        title: `FIREWALL ${i < 10 ? '0' + i : i}`,
        isCleared: i < currentUnlockedId,
        isActive: i === currentUnlockedId,
      } as RouteBlocker;
    });
  }, [nodes, currentUnlockedId]);

  // ── SVG conduit paths ────────────────────────────────────────────────────────
  const conduitPathData = useMemo(() => {
    if (!nodes.length) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    nodes.slice(0, -1).forEach((c, i) => {
      const n = nodes[i + 1], dy = (n.y - c.y) * 0.5;
      d += ` C ${c.x} ${c.y + dy}, ${n.x} ${n.y - dy}, ${n.x} ${n.y}`;
    });
    return d;
  }, [nodes]);

  const activePathData = useMemo(() => {
    const active = nodes.filter(n => n.id <= currentUnlockedId);
    if (active.length <= 1) return '';
    let d = `M ${active[0].x} ${active[0].y}`;
    active.slice(0, -1).forEach((c, i) => {
      const n = active[i + 1], dy = (n.y - c.y) * 0.5;
      d += ` C ${c.x} ${c.y + dy}, ${n.x} ${n.y - dy}, ${n.x} ${n.y}`;
    });
    return d;
  }, [nodes, currentUnlockedId]);

  // ── Collect all scalable elements ───────────────────────────────────────────
  const refreshScaleElements = useCallback(() => {
    if (!scrollRef.current) return;
    const items = scrollRef.current.querySelectorAll<HTMLElement>('.roadmap-scale-item');
    scaleElementsRef.current = Array.from(items);
  }, []);

  useEffect(() => {
    refreshScaleElements();
  }, [currentUnlockedId, nodes, refreshScaleElements]);

  // ── Auto-scroll to active level on mount ─────────────────────────────────────
  useEffect(() => {
    if (initScrolled.current) return;
    const container = scrollRef.current;
    if (!container) return;
    const timer = setTimeout(() => {
      const el = activeRef.current;
      if (el) {
        const h = container.clientHeight;
        container.scrollTo({ top: Math.max(0, el.offsetTop - h * 0.55), behavior: 'smooth' });
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
      initScrolled.current = true;
    }, 250);
    return () => clearTimeout(timer);
  }, [currentUnlockedId]);

  // ── rAF scroll-linked perspective scale ───────────────────────────────────────
  // Reads each scalable element's viewport Y and applies dynamic scaling so
  // objects close to the bottom render at actual/full size, and elements toward
  // the top smoothly scale down — creating a true 3D road depth effect across all
  // nodes, red obstacle clamps, dormant clamps, hazards, and sector banners.
  const tick = useCallback(() => {
    const container = scrollRef.current;
    if (container) {
      if (scaleElementsRef.current.length === 0) {
        refreshScaleElements();
      }

      const viewH = container.clientHeight;
      const contTop = container.getBoundingClientRect().top;

      scaleElementsRef.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top - contTop + rect.height * 0.5;
        // ny: 0 = top of scroll view (far), 1 = bottom of scroll view (near)
        const ny = Math.max(0, Math.min(1, centerY / viewH));

        // Strict limit for closer objects: growth caps at FOREGROUND_LIMIT_Y so
        // elements closer to the screen stay comfortably within SCALE_MAX and never over-inflate.
        const progress = Math.max(0, Math.min(1, ny / FOREGROUND_LIMIT_Y));
        const eased = Math.sin((progress * Math.PI) / 2);
        const scale = SCALE_MIN + eased * (SCALE_MAX - SCALE_MIN);

        const baseTransform = el.getAttribute('data-base-transform') || 'translate(-50%, -50%)';
        el.style.transform = `${baseTransform} scale(${scale.toFixed(3)})`;
        el.style.transformOrigin = 'center center';

        // Only fade out elements when dissolving into the horizon haze at the very top
        if (ny < FADE_ZONE) {
          el.style.opacity = (ny / FADE_ZONE).toFixed(3);
        } else {
          el.style.opacity = '';
        }
        el.style.willChange = 'transform, opacity';
      });
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [refreshScaleElements]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // ── Interaction handlers ──────────────────────────────────────────────────────
  const handleLevelClick = (levelId: number) => {
    if (!localProgress[String(levelId)]) {
      showAlert({
        title: 'ROUTE BLOCKED',
        message: `Firewall obstacle active! Clear Level ${levelId - 1} to shatter the route blocker and connect the path to Level ${levelId < 10 ? '0' + levelId : levelId}.`,
        titleColor: '#ff0844',
        btn1Text: 'DISMISS',
        btn1Color: '#00f7ff',
      });
      return;
    }
    const level = localLevels[levelId - 1];
    if (level) openPreview(level);
  };

  const handleBlockerClick = (blocker: RouteBlocker) => {
    showAlert({
      title: 'ROUTE BLOCKED',
      message: `The route to Level ${blocker.toLevel} is blocked! Complete Level ${blocker.fromLevel} to destroy this obstacle and open the path.`,
      titleColor: '#ff0844',
      btn1Text: 'DEPLOY CORE',
      btn1Color: '#00f7ff',
    });
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative w-full h-full overflow-hidden select-none bg-[#03040c]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 95% 20% at 50% 0%,   rgba(255,215,0,0.12)   0%, transparent 75%),
          radial-gradient(ellipse 90% 20% at 50% 30%,  rgba(244,63,94,0.10)   0%, transparent 75%),
          radial-gradient(ellipse 90% 20% at 50% 65%,  rgba(183,115,255,0.10) 0%, transparent 75%),
          radial-gradient(ellipse 95% 25% at 50% 100%, rgba(0,247,255,0.14)   0%, transparent 75%)
        `,
      }}
    >
      {/* Distance-haze gradient at top (vanishing-point zone) */}
      <div
        className="absolute top-0 inset-x-0 h-28 pointer-events-none z-30"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(0,247,255,0.10) 0%, transparent 80%),' +
            'linear-gradient(to bottom, #03040c 0%, rgba(3,4,12,0.90) 38%, rgba(3,4,12,0.4) 68%, transparent 100%)',
        }}
      />

      {/* ── Scroll container ────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          paddingBottom: '140px',
          backgroundImage: `
            radial-gradient(ellipse 95% 18% at 50% 1%,   rgba(255,215,0,0.16)   0%, transparent 75%),
            radial-gradient(ellipse 90% 18% at 50% 24%,  rgba(244,63,94,0.13)   0%, transparent 75%),
            radial-gradient(ellipse 90% 18% at 50% 48%,  rgba(183,115,255,0.13) 0%, transparent 75%),
            radial-gradient(ellipse 90% 18% at 50% 72%,  rgba(99,102,241,0.14)  0%, transparent 75%),
            radial-gradient(ellipse 95% 20% at 50% 98%,  rgba(0,247,255,0.16)   0%, transparent 75%)
          `,
        }}
      >
        {/* ── Map canvas ──────────────────────────────────────────────────── */}
        <div
          className="relative mx-auto overflow-visible w-full max-w-[440px]"
          style={{ height: `${TOTAL_HEIGHT}px` }}
        >
          {/* Ambient floating bricks */}
          {floatingBricks.map((b) => (
            <div
              key={`brick-${b.id}`}
              className="roadmap-scale-item absolute rounded-md pointer-events-none"
              data-base-transform={`rotate(${b.rotation}deg)`}
              style={{
                left: `${b.x}px`,
                top: `${b.y}px`,
                width: `${b.w}px`,
                height: `${b.h}px`,
                backgroundColor: b.color,
                opacity: b.opacity,
                boxShadow: `0 0 14px ${b.glow}, inset 0 1px 1px #fff`,
                transform: `rotate(${b.rotation}deg)`,
                border: '1px solid rgba(255,255,255,0.2)',
                willChange: 'transform, opacity',
              }}
            />
          ))}

          {/* Laser Conduit SVG */}
          <RoadmapConduitSvg
            nodes={nodes}
            pathData={conduitPathData}
            activePathData={activePathData}
            currentUnlockedId={currentUnlockedId}
          />

          {/* Route Blockers (Red Active Clamps, Dormant Clamps) & Ambient Hazards */}
          <RoadmapObstacles
            obstacles={obstacles}
            routeBlockers={routeBlockers}
            onBlockerClick={handleBlockerClick}
          />

          {/* Sector Gateway Banners & Summit Apex Reactor */}
          <RoadmapSectorBanner nodes={nodes} />

          {/* Level Energy Cells */}
          {nodes.map((node) => {
            const progress   = localProgress[String(node.id)];
            const isComplete = progress?.completed;
            const isCurrent  = node.id === currentUnlockedId && !isComplete;

            return (
              <RoadmapNodeItem
                key={`node-${node.id}`}
                ref={isCurrent ? activeRef : undefined}
                node={node}
                progress={progress}
                isCurrent={isCurrent}
                onLevelClick={handleLevelClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
