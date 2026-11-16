import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useGame } from '../context/GameContext';
import { currencyService, DailyCollectStatus } from '../services/currency';
import { soundManager } from '../utils/audio';
import { cyberToast } from './common/CyberToast';
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
import { LevelPathSvg } from './roadmap/LevelPathSvg';
import { RoadmapObstacles } from './roadmap/RoadmapObstacles';
import { RoadmapSectorBanner } from './roadmap/RoadmapSectorBanner';
import { RoadmapNodeItem } from './roadmap/RoadmapNodeItem';
import { LevelMapHeader } from './roadmap/LevelMapHeader';

// ─── Scroll-linked perspective scale ─────────────────────────────────────────
const SCALE_MIN = 0.50;          // horizon vanishing size limit
const SCALE_MAX = 1.0;           // actual size (100%) for foreground and summit
const FOREGROUND_LIMIT_Y = 0.48; // foreground threshold where size growth reaches its limit
const FADE_ZONE = 0.08;          // top 8% of viewport dissolves into horizon haze

// Retain user's current scroll position across tab navigation (no jarring auto-scroll)
let savedArcadeScrollTop: number | null = null;

export const LevelMap: React.FC = () => {
  const { localLevels, localProgress, openPreview, user, setActiveTab, isOpeningLevel } = useGame();
  const [displayCores, setDisplayCores] = useState<number>(() => currencyService.getBalance());
  const [dailyStatus, setDailyStatus] = useState<DailyCollectStatus>(() => currencyService.getDailyCollectStatus());
  const [isPulsing] = useState<boolean>(false);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const activeRef    = useRef<HTMLDivElement | null>(null);
  const hazeRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);

  // Sync available cores and live daily bonus ticker
  useEffect(() => {
    const updateDaily = () => {
      const status = currencyService.getDailyCollectStatus();
      setDailyStatus(status);
    };

    updateDaily();

    const handleCurrencyChange = () => {
      const b = currencyService.getBalance();
      setDisplayCores(b);
      updateDaily();
    };
    window.addEventListener('currency_balance_changed', handleCurrencyChange);

    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setDisplayCores(b);
      updateDaily();
    });

    const timer = setInterval(() => {
      updateDaily();
    }, 1000);

    return () => {
      window.removeEventListener('currency_balance_changed', handleCurrencyChange);
      clearInterval(timer);
    };
  }, [user.username]);

  // When FREE or Cores button is clicked, redirect directly to Core Shop
  const handleOpenShop = () => {
    soundManager.playClick('cyber');
    setActiveTab('armory');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/shop');
      window.dispatchEvent(new CustomEvent('open-core-shop'));
    }
  };

  // Cached list of all scalable map elements (.roadmap-scale-item) and conduit segments
  const scaleElementsRef = useRef<HTMLElement[]>([]);
  const conduitSegmentsRef = useRef<SVGGElement[]>([]);

  // ── Node layout ─────────────────────────────────────────────────────────────
  const nodes: RoadmapNode[] = useMemo(() => {
    const list: RoadmapNode[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const y = TOTAL_HEIGHT - BOTTOM_OFFSET - (i - 1) * SPACING;
      const angle = (i - 1) * 1.05;
      const x = 190 + Math.sin(angle) * 95;
      let zone = 1;
      if (i > 40) zone = 5;
      else if (i > 30) zone = 4;
      else if (i > 20) zone = 3;
      else if (i > 10) zone = 2;
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

  // ── Total Campaign Stars Earned ──────────────────────────────────────────────
  const totalStars = useMemo(() => {
    return Object.values(localProgress).reduce((acc, p) => {
      if (!p.completed) return acc;
      return acc + (p.stars ?? 3);
    }, 0);
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
    for (let i = 0; i < 28; i++) {
      const p = palette[i % palette.length];
      const y = (TOTAL_HEIGHT / 28) * i + ((i * 47) % 60);
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
    { id: 'titanium-1', type: 'titanium', x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 3.5  * SPACING },
    { id: 'plasma-1',   type: 'plasma',   x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 7.5  * SPACING },
    { id: 'titanium-2', type: 'titanium', x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 13.5 * SPACING },
    { id: 'plasma-2',   type: 'plasma',   x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 17.5 * SPACING },
    { id: 'titanium-3', type: 'titanium', x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 23.5 * SPACING },
    { id: 'plasma-3',   type: 'plasma',   x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 27.5 * SPACING },
    { id: 'titanium-4', type: 'titanium', x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 33.5 * SPACING },
    { id: 'plasma-4',   type: 'plasma',   x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 37.5 * SPACING },
    { id: 'titanium-5', type: 'titanium', x: 65,  y: TOTAL_HEIGHT - BOTTOM_OFFSET - 43.5 * SPACING },
    { id: 'plasma-5',   type: 'plasma',   x: 315, y: TOTAL_HEIGHT - BOTTOM_OFFSET - 47.5 * SPACING },
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
    const segs = scrollRef.current.querySelectorAll<SVGGElement>('.roadmap-conduit-segment');
    conduitSegmentsRef.current = Array.from(segs);
  }, []);

  useEffect(() => {
    refreshScaleElements();
  }, [currentUnlockedId, nodes, refreshScaleElements]);

  // ── Restore current scroll position without jarring auto-scroll jump ────────
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (savedArcadeScrollTop !== null) {
      container.scrollTop = savedArcadeScrollTop;
    } else {
      const el = activeRef.current;
      const h = container.clientHeight;
      const initialTop = el ? Math.max(0, el.offsetTop - h * 0.55) : container.scrollHeight;
      container.scrollTop = initialTop;
      savedArcadeScrollTop = initialTop;
    }
  }, [currentUnlockedId]);

  // ── rAF scroll-linked perspective scale ───────────────────────────────────────
  // Projects both objects and conduit path segments with screen-space perspective:
  // 1. Objects & paths near the bottom: full size (capped at SCALE_MAX) and full distance.
  // 2. Objects & paths near the top: smoothly small (thinner stroke) and short (compressed distance),
  //    recreating authentic 3D road perspective foreshortening as you scroll through the entire map.
  const tick = useCallback(() => {
    const container = scrollRef.current;
    if (container) {
      if (scaleElementsRef.current.length === 0) {
        refreshScaleElements();
      }

      const scrollTop = container.scrollTop;
      savedArcadeScrollTop = scrollTop;
      const viewH = container.clientHeight;

      // Perspective projection function:
      // Computes yShift (foreshortening compression) and scale for any coordinate on screen.
      const projectY = (rawY: number) => {
        const u = rawY / viewH;

        // When scrolled near the top of the map, smoothly expand foreground scale so summit nodes reach full 1.0 actual size
        const topScrollBoost = Math.max(0, 1 - scrollTop / 350);
        if (topScrollBoost >= 0.95) {
          return { yShift: 0, scale: SCALE_MAX, u, topScrollBoost: 1 };
        }

        const effectiveLimit = Math.max(0.05, FOREGROUND_LIMIT_Y * (1 - topScrollBoost));

        if (u >= effectiveLimit) {
          return { yShift: 0, scale: SCALE_MAX, u, topScrollBoost };
        }

        const t = Math.max(0, Math.min(1, (effectiveLimit - u) / effectiveLimit));
        // Foreshortening compression smoothly fades to zero as scrolled to top
        const yShift = t * t * 75 * Math.max(0, 1 - topScrollBoost);

        const ny = Math.max(0, Math.min(1, u));
        const progress = Math.max(0, Math.min(1, ny / effectiveLimit));
        const eased = Math.sin((progress * Math.PI) / 2);
        const baseScale = SCALE_MIN + eased * (SCALE_MAX - SCALE_MIN);
        const scale = baseScale + (SCALE_MAX - baseScale) * topScrollBoost;

        return { yShift, scale, u, topScrollBoost };
      };

      // Fade out the dark horizon haze when scrolling near the summit so the apex area is crystal clear
      if (hazeRef.current) {
        const hazeOpacity = Math.min(1, scrollTop / 180);
        hazeRef.current.style.opacity = hazeOpacity.toFixed(2);
      }

      // 1. Transform all map objects (nodes, route blockers, dormant clamps, banners, hazards, bricks)
      scaleElementsRef.current.forEach((el) => {
        if (!el) return;
        const dataY = parseFloat(el.getAttribute('data-y') || '');
        const rawY = !isNaN(dataY) ? dataY - scrollTop : el.offsetTop - scrollTop;
        const { yShift, scale, u, topScrollBoost } = projectY(rawY);

        const baseTransform = el.getAttribute('data-base-transform') || 'translate(-50%, -50%)';
        el.style.transform = `${baseTransform} translateY(${yShift.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        el.style.transformOrigin = 'center center';

        // Only fade out elements when dissolving into the horizon haze at the very top (disabled when scrolled to summit)
        const effectiveFadeZone = FADE_ZONE * (1 - topScrollBoost);
        if (effectiveFadeZone > 0.001 && u < effectiveFadeZone) {
          el.style.opacity = (Math.max(0, u) / effectiveFadeZone).toFixed(3);
        } else {
          el.style.opacity = '';
        }
        el.style.willChange = 'transform, opacity';
      });

      // 2. Transform all conduit path segments: makes the top path small (thinner) and short (compressed)
      conduitSegmentsRef.current.forEach((g) => {
        if (!g) return;
        const currY = parseFloat(g.getAttribute('data-curr-y') || '0');
        const nextY = parseFloat(g.getAttribute('data-next-y') || '0');
        const midY = (currY + nextY) * 0.5;

        const rawCurrY = currY - scrollTop;
        const rawNextY = nextY - scrollTop;
        const rawMidY = midY - scrollTop;

        const pCurr = projectY(rawCurrY);
        const pNext = projectY(rawNextY);
        const pMid = projectY(rawMidY);

        // Vertical distance compression: raw vs projected
        const dy = nextY - currY;
        const projDy = (nextY + pNext.yShift) - (currY + pCurr.yShift);
        const sy = dy !== 0 ? Math.max(0.35, Math.min(1.0, projDy / dy)) : 1.0;
        const ty = pCurr.yShift;
        const Yt = ty + currY * (1 - sy);

        // Native SVG transform: scale strictly in Y with zero horizontal shift,
        // guaranteeing 100% exact, gapless alignment with node centers!
        g.setAttribute('transform', `translate(0, ${Yt.toFixed(2)}) scale(1, ${sy.toFixed(4)})`);
        g.style.transform = '';

        // Dynamic perspective stroke-factor: shrinks stroke thickness at the top (SMALL)
        const strokeFactor = Math.max(0.35, Math.min(1.0, pMid.scale / SCALE_MAX));
        g.style.setProperty('--stroke-factor', strokeFactor.toFixed(3));

        if (pMid.u < FADE_ZONE) {
          g.style.opacity = (Math.max(0, pMid.u) / FADE_ZONE).toFixed(3);
        } else {
          g.style.opacity = '';
        }
        g.style.willChange = 'transform, opacity';
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
    // Block the click if a one-time click is made until the level is open!
    if (isOpeningLevel) return;

    if (!localProgress[String(levelId)]) {
      soundManager.playLockTap();
      const prevLevel = levelId - 1;
      cyberToast.locked(`Level ${levelId} Locked • Clear Level ${prevLevel} first`);
      return;
    }
    const level = localLevels[levelId - 1];
    if (level) openPreview(level);
  };

  const handleBlockerClick = (blocker: RouteBlocker) => {
    soundManager.playLockTap();
    cyberToast.locked(`Route Blocked • Clear Level ${blocker.fromLevel} first`);
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
      {/* ── Top Cyber Section Header & Floating Controls ────────────────── */}
      <LevelMapHeader
        user={user}
        displayCores={displayCores}
        isPulsing={isPulsing}
        dailyStatus={dailyStatus}
        totalStars={totalStars}
        onOpenShop={handleOpenShop}
        hazeRef={hazeRef}
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
          pointerEvents: isOpeningLevel ? 'none' : 'auto',
          paddingTop: '72px',
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
              data-y={b.y}
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

          {/* Breakout Ball Kinetic Trajectory Laser SVG */}
          <LevelPathSvg
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
                disabled={isOpeningLevel}
                onLevelClick={handleLevelClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
