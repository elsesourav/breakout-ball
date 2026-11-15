import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { CyberSectionHeader } from './CyberSectionHeader';
import { CoreIcon } from './CoreIcon';
import { currencyService, DailyCollectStatus } from '../services/currency';
import { soundManager } from '../utils/audio';
import { cyberToast } from './common/CyberToast';
import { Star, Clock } from 'lucide-react';
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

// ─── Scroll-linked perspective scale ─────────────────────────────────────────
// Screen-linked perspective depth with strict foreground size ceiling:
//   normalizedY = 0  → top of viewport (far / vanishing point)  → SCALE_MIN
//   normalizedY >= FOREGROUND_LIMIT_Y → closer objects          → capped at SCALE_MAX
// Objects smoothly scale from distant horizon size up to actual size (1.0)
// in the closer foreground and summit, ensuring comfortable legibility.
const SCALE_MIN = 0.50;          // horizon vanishing size limit
const SCALE_MAX = 1.0;           // actual size (100%) for foreground and summit
const FOREGROUND_LIMIT_Y = 0.48; // foreground threshold where size growth reaches its limit
const FADE_ZONE = 0.08;          // top 8% of viewport dissolves into horizon haze

// Retain user's current scroll position across tab navigation (no jarring auto-scroll)
let savedArcadeScrollTop: number | null = null;

const formatRemainingTime = (ms: number): string => {
  if (ms <= 0) return '0h 00m 00s';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
};

export const LevelMap: React.FC = () => {
  const { localLevels, localProgress, openPreview, showAlert, user, setActiveTab } = useGame();
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [displayCores, setDisplayCores] = useState<number>(() => currencyService.getBalance());
  const [dailyStatus, setDailyStatus] = useState<DailyCollectStatus>(() => currencyService.getDailyCollectStatus());
  const [remainingMs, setRemainingMs] = useState<number>(() => currencyService.getDailyCollectStatus().remainingMs);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const activeRef    = useRef<HTMLDivElement | null>(null);
  const hazeRef      = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const countUpRef   = useRef<number | null>(null);
  const isClaimLockedRef = useRef<boolean>(false);

  // Smooth count-up counter timed with flying particle arrivals
  const startCountUp = useCallback((target: number) => {
    if (countUpRef.current) cancelAnimationFrame(countUpRef.current);

    const startVal = displayCores;
    const diff = target - startVal;
    if (diff <= 0) {
      setDisplayCores(target);
      return;
    }

    const duration = 900; // ms
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + diff * ease);

      setDisplayCores(current);

      if (progress < 1) {
        countUpRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayCores(target);
        countUpRef.current = null;
      }
    };

    countUpRef.current = requestAnimationFrame(tick);
  }, [displayCores]);

  // Sync available cores and live daily bonus ticker
  useEffect(() => {
    const updateDaily = () => {
      const status = currencyService.getDailyCollectStatus();
      setDailyStatus(status);
      setRemainingMs(status.remainingMs);
    };

    updateDaily();

    const handleCurrencyChange = () => {
      const b = currencyService.getBalance();
      setCores(b);
      setDisplayCores(b);
      updateDaily();
    };
    window.addEventListener('currency_balance_changed', handleCurrencyChange);

    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setCores(b);
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

  // When FREE button is clicked on Level Map, redirect directly to Core Shop
  const handleDailyFreeClick = () => {
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
      {/* ── Top Cyber Section Header (Profile & Cores) ──────────────────── */}
      <div
        className="absolute top-0 inset-x-0 z-40 w-full flex justify-center bg-[#06081c]/95 backdrop-blur-md shadow-lg"
        style={{
          borderBottom: '1px solid rgba(0, 247, 255, 0.22)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(0, 247, 255, 0.08)',
        }}
      >
        <CyberSectionHeader
          title={user.fullName || user.username.toUpperCase() || 'CYBER PLAYER'}
          subtitle={`@${user.username || 'player'}`}
          rightSlot={
            <button
              type="button"
              id="header-cores-badge"
              onClick={() => { setActiveTab('armory'); if (typeof window !== 'undefined') { window.history.pushState(null, '', '/shop'); window.dispatchEvent(new CustomEvent('open-core-shop')); } }}
              title="View Cores & Shop"
              style={{
                background: isPulsing
                  ? 'linear-gradient(135deg, rgba(0, 247, 255, 0.28) 0%, rgba(99, 102, 241, 0.32) 100%)'
                  : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
                border: isPulsing
                  ? '1.2px solid #00f7ff'
                  : '1.2px solid rgba(0, 247, 255, 0.45)',
                boxShadow: isPulsing
                  ? '0 0 14px rgba(0, 247, 255, 0.5)'
                  : '0 0 12px rgba(0, 247, 255, 0.25)',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(0,247,255,0.4)] active:scale-95 group transition-all"
            >
              <CoreIcon
                size={15}
                glow
                variant="cyan"
                className="transition-transform duration-300 group-hover:rotate-12"
              />
              <span className={`font-tech font-bold text-xs transition-colors ${isPulsing ? 'text-white' : 'text-cyan-200'}`}>
                {displayCores.toLocaleString()}
              </span>
              <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
                CORES
              </span>
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 border border-cyan-400/60 text-cyan-300 flex items-center justify-center text-[10px] font-bold group-hover:bg-cyan-400 group-hover:text-black transition-colors ml-0.5">
                +
              </span>
            </button>
          }
        />
      </div>

      {/* ── Floating Controls Layer: Left (FREE Round Button) & Right (STAR Fixed Badge) ─ */}
      <div className="absolute top-[58px] inset-x-0 z-50 pointer-events-none flex justify-center">
        <div className="w-full max-w-[440px] px-3 sm:px-4 flex items-center justify-between">
          {/* Left: Floating Round FREE Button (Big with continuous shine & ambient pulse) */}
          {dailyStatus.canCollect ? (
            <div className="relative pointer-events-auto">
              <motion.button
                type="button"
                id="daily-free-collect-button"
                onClick={handleDailyFreeClick}
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  background:
                    'radial-gradient(circle at 35% 35%, rgba(0, 247, 255, 0.5) 0%, rgba(6, 182, 212, 0.55) 45%, rgba(14, 25, 54, 0.98) 100%)',
                }}
                className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full border-2 border-cyan-300 flex flex-col items-center justify-center cursor-pointer select-none relative group btn-shine-sweep animate-pulse-cyan-glow"
                title="Claim 50 Free Cores in Core Shop!"
              >
                <span className="text-2xl leading-none filter drop-shadow">🎁</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <CoreIcon size={14} variant="cyan" glow />
                  <span className="font-tech font-black text-[11px] text-cyan-100 tracking-wider leading-none">
                    FREE
                  </span>
                </div>
              </motion.button>
              <span className="absolute -top-1 -right-1 px-1.5 h-5 min-w-[20px] rounded-full bg-cyan-300 border-2 border-[#03040c] text-[9.5px] font-black text-black flex items-center justify-center shadow-[0_0_12px_#00f7ff] animate-pulse font-tech pointer-events-none z-10">
                +50
              </span>
            </div>
          ) : (
            <div />
          )}

          {/* Right: Fixed Star Badge */}
          <div
            style={{
              background:
                'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(24, 18, 5, 0.94) 100%)',
              border: '1.2px solid rgba(251, 191, 36, 0.45)',
              boxShadow:
                '0 0 14px rgba(251, 191, 36, 0.25), 0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-amber-300 font-tech font-bold text-xs pointer-events-auto select-none"
            title={`${totalStars} Stars Collected in Arcade`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="text-sm font-black text-amber-300 tracking-wide">{totalStars}</span>
            <span className="text-[10px] text-amber-400/70 font-normal">/ {TOTAL_LEVELS * 3}</span>
          </div>
        </div>
      </div>

      {/* Distance-haze gradient at top (vanishing-point zone) */}
      <div
        ref={hazeRef}
        className="absolute top-0 inset-x-0 h-32 pointer-events-none z-30 transition-opacity duration-150"
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
                onLevelClick={handleLevelClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
