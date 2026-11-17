import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { currencyService, DailyCollectStatus } from '../../services/currency';
import { soundManager } from '../../audio';
import { cyberToast } from '../common/CyberToast';
import {
  TOTAL_LEVELS,
  SPACING,
  SVG_WIDTH,
  BOTTOM_OFFSET,
  TOTAL_HEIGHT,
  SECTOR_CONFIG,
  SECTOR_PALETTES,
  getRoadmapObstacles,
  RoadmapNode,
  FloatingBrick,
  Obstacle,
  RouteBlocker,
  getSectorIndex,
} from '../roadmap/types';
import { LevelPathSvg } from '../roadmap/LevelPathSvg';
import { RoadmapObstacles } from '../roadmap/RoadmapObstacles';
import { RoadmapSectorBanner } from '../roadmap/RoadmapSectorBanner';
import { RoadmapNodeItem } from '../roadmap/RoadmapNodeItem';
import { LevelMapHeader } from '../roadmap/LevelMapHeader';
import { arcadeScrollService } from '../../services/arcadeScroll';

// ─── Scroll-linked perspective scale ─────────────────────────────────────────
const SCALE_HORIZON = 0.85;      // Subtle arcade depth (85% size at top of screen)
const SCALE_FOREGROUND = 1.0;    // Full size (100%) at foreground
const SCALE_MIN = 0.85;
const SCALE_MAX = 1.0;
const FOREGROUND_LIMIT_Y = 0.48;
const FADE_ZONE = 0.0;          // Full screen visibility without artificial blackout zones

export const ArcadeView: React.FC = () => {
  const { localLevels, localProgress, openPreview, user, setActiveTab, isOpeningLevel, selectedLevel } = useGame();
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
    setActiveTab('shop');
  };

  // Cached list of all scalable map elements (.roadmap-scale-item) and conduit segments
  const scaleElementsRef = useRef<HTMLElement[]>([]);
  const conduitSegmentsRef = useRef<SVGGElement[]>([]);

  // ── Node layout (shifted to the right: center 230, sway 74 for ample left clearance) ──
  const nodes: RoadmapNode[] = useMemo(() => {
    const list: RoadmapNode[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const y = TOTAL_HEIGHT - BOTTOM_OFFSET - (i - 1) * SPACING;
      const angle = (i - 1) * 1.05;
      const x = 230 + Math.sin(angle) * 74;
      const zone = getSectorIndex(i);
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

  // ── Next playable level to conquer (The active frontier that needs to be played) ──
  const nextPlayableLevelId = useMemo(() => {
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const p = localProgress[String(i)];
      if (p !== undefined && !p.completed) return i;
    }
    return currentUnlockedId || 1;
  }, [localProgress, currentUnlockedId]);

  // ── Target Level for Centering ───────────────────────────────────────────────
  const currentPlayLevelId = useMemo(() => {
    if (selectedLevel) {
      const num = parseInt(selectedLevel.id, 10);
      const isComplete = localProgress[String(num)]?.completed;
      if (!isNaN(num) && num >= 1 && num <= TOTAL_LEVELS && !isComplete) return num;
    }
    const savedLast = arcadeScrollService.getLastPlayedLevel();
    const isSavedComplete = localProgress[String(savedLast)]?.completed;
    if (savedLast >= 1 && savedLast <= TOTAL_LEVELS && !isSavedComplete) {
      return savedLast;
    }
    return nextPlayableLevelId;
  }, [selectedLevel, localProgress, nextPlayableLevelId]);

  // ── Total Campaign Stars Earned ──────────────────────────────────────────────
  const totalStars = useMemo(() => {
    return Object.values(localProgress).reduce((acc, p) => {
      if (!p.completed) return acc;
      return acc + (p.stars ?? 3);
    }, 0);
  }, [localProgress]);

  // ── Ambient floating bricks (Sector-Themed Palette Progression) ─────────────
  const floatingBricks: FloatingBrick[] = useMemo(() => {
    const bricks: FloatingBrick[] = [];
    for (let i = 0; i < 45; i++) {
      const y = (TOTAL_HEIGHT / 45) * i + ((i * 47) % 55);
      const approxLevel = Math.max(1, Math.min(TOTAL_LEVELS, Math.round(((TOTAL_HEIGHT - y - BOTTOM_OFFSET) / SPACING) + 1)));
      const sectorId = getSectorIndex(approxLevel);
      const palette = SECTOR_PALETTES[sectorId] || SECTOR_PALETTES[1];
      const p = palette[i % palette.length];

      const iL = i % 2 === 0;
      const w = 34 + ((i * 7) % 12);
      const h = 15 + ((i * 3) % 6);
      const x = iL ? 80 + ((i * 12) % 25) : SVG_WIDTH - w - 12 - ((i * 14) % 18);
      bricks.push({
        id: i, x, y, w, h, color: p.color, glow: p.glow,
        rotation: ((i * 17) % 30) - 15, opacity: 0.20 + ((i * 5) % 15) * 0.01,
      });
    }
    return bricks;
  }, []);

  // ── Kinetic hazards (flanking the shifted path with Sector-Themed Obstacles) ──
  const obstacles: Obstacle[] = useMemo(
    () => getRoadmapObstacles(TOTAL_HEIGHT, BOTTOM_OFFSET, SPACING),
    []
  );

  // ── Route blockers with Sector Assignment ────────────────────────────────────
  const routeBlockers: RouteBlocker[] = useMemo(() => {
    return nodes.slice(0, -1).map((curr, idx) => {
      const i = idx + 1;
      const next = nodes[idx + 1];
      const sectorId = getSectorIndex(i);
      return {
        id: `route-blocker-${i}`,
        fromLevel: i,
        toLevel: i + 1,
        x: Math.round((curr.x + next.x) / 2),
        y: Math.round((curr.y + next.y) / 2),
        sector: sectorId,
        type: i % 3 === 0 ? 'quantum_gate' : i % 2 === 0 ? 'plasma_shield' : 'firewall',
        title: `FIREWALL ${i < 10 ? '0' + i : i}`,
        isCleared: i < currentUnlockedId,
        isActive: i === currentUnlockedId,
      } as RouteBlocker;
    });
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

  const userInteractedRef = useRef<boolean>(false);
  const initialCenteredLevelRef = useRef<number | null>(null);

  const getScrollTopForLevel = useCallback((levelId: number, container: HTMLElement) => {
    const clampedLevel = Math.max(1, Math.min(TOTAL_LEVELS, levelId));
    const targetY = TOTAL_HEIGHT - BOTTOM_OFFSET - (clampedLevel - 1) * SPACING;
    const viewH = container.clientHeight || window.innerHeight;
    const maxScroll = Math.max(0, container.scrollHeight - viewH);
    return Math.max(0, Math.min(maxScroll, Math.round(targetY - viewH * 0.5)));
  }, []);

  // ── Immediately position scroll to current play level without jarring jumps ──
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const savedTop = arcadeScrollService.getSavedScroll();
    if (!userInteractedRef.current && (savedTop === null || initialCenteredLevelRef.current !== currentPlayLevelId)) {
      const targetTop = getScrollTopForLevel(currentPlayLevelId, container);
      container.scrollTop = targetTop;
      arcadeScrollService.setSavedScroll(targetTop);
      initialCenteredLevelRef.current = currentPlayLevelId;
    } else if (savedTop !== null) {
      container.scrollTop = savedTop;
    }
  }, [currentPlayLevelId, getScrollTopForLevel]);

  // ── rAF scroll-linked perspective scale ───────────────────────────────────────
  // Projects both objects and conduit path segments with authentic 3D perspective:
  // 1. Foreground (bottom of screen): large scale (1.08x), vivid brightness, and wide spacing.
  // 2. Horizon (top of screen): noticeably small scale (0.38x), atmospheric depth, and compressed spacing.
  const tick = useCallback(() => {
    const container = scrollRef.current;
    if (container) {
      if (scaleElementsRef.current.length === 0) {
        refreshScaleElements();
      }

      const scrollTop = container.scrollTop;
      const viewH = container.clientHeight;

      // Perspective projection function:
      // Computes yShift (vertical distance foreshortening) and scale across the entire viewport.
      const projectY = (rawY: number) => {
        const u = rawY / viewH;

        // When scrolled near the summit (top of map), smoothly boost scale so Stage 50 reaches full 1.08x size
        const topScrollBoost = Math.max(0, 1 - scrollTop / 350);
        if (topScrollBoost >= 0.95) {
          return { yShift: 0, scale: SCALE_FOREGROUND, u, progress: 1, topScrollBoost: 1 };
        }

        // Viewport depth progress: 1.0 at bottom (close/big), 0.0 at top (distant/small)
        const v = Math.max(0, Math.min(1, u / 0.96));
        const progress = Math.pow(v, 0.85);

        // Continuous perspective scale: distant nodes 85% and close nodes 100%
        const baseScale = SCALE_HORIZON + progress * (SCALE_FOREGROUND - SCALE_HORIZON);
        const scale = baseScale + (SCALE_FOREGROUND - baseScale) * topScrollBoost;

        // Natural full-screen flow with zero displacement pushing nodes away from the top
        const yShift = 0;

        return { yShift, scale, u, progress, topScrollBoost };
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
        const { yShift, scale, u, progress, topScrollBoost } = projectY(rawY);

        const baseTransform = el.getAttribute('data-base-transform') || 'translate(-50%, -50%)';
        el.style.transform = `${baseTransform} translateY(${yShift.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        el.style.transformOrigin = 'center center';

        // 3D atmospheric depth lighting: close objects vivid, distant objects atmospheric
        const brightness = Math.min(1.08, 0.78 + progress * 0.30);
        el.style.filter = `brightness(${brightness.toFixed(2)})`;

        // Only fade out elements when dissolving into the horizon haze at the very top (disabled when scrolled to summit)
        const effectiveFadeZone = FADE_ZONE * (1 - topScrollBoost);
        if (effectiveFadeZone > 0.001 && u < effectiveFadeZone) {
          el.style.opacity = (Math.max(0, u) / effectiveFadeZone).toFixed(3);
        } else {
          el.style.opacity = '';
        }
        el.style.willChange = 'transform, opacity, filter';
      });

      // 2. Transform all conduit path segments: makes the distant path thin and compressed
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
        const sy = dy !== 0 ? Math.max(0.30, Math.min(1.0, projDy / dy)) : 1.0;
        const ty = pCurr.yShift;
        const Yt = ty + currY * (1 - sy);

        // Native SVG transform: scale strictly in Y with zero horizontal shift,
        // guaranteeing 100% exact, gapless alignment with node centers!
        g.setAttribute('transform', `translate(0, ${Yt.toFixed(2)}) scale(1, ${sy.toFixed(4)})`);
        g.style.transform = '';

        // Dynamic perspective stroke-factor: shrinks stroke thickness at the top (SMALL)
        const strokeFactor = Math.max(0.32, Math.min(1.10, pMid.scale / SCALE_FOREGROUND));
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
    if (level) {
      arcadeScrollService.setLastPlayedLevel(levelId);
      arcadeScrollService.reset();
      openPreview(level);
    }
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
      {/* ── Top Bar & Floating Controls ────────────────── */}
      <LevelMapHeader
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
        onPointerDown={() => { userInteractedRef.current = true; }}
        onTouchStart={() => { userInteractedRef.current = true; }}
        onWheel={() => { userInteractedRef.current = true; }}
        onScroll={() => {
          if (scrollRef.current && userInteractedRef.current) {
            arcadeScrollService.setSavedScroll(scrollRef.current.scrollTop);
          }
        }}
        className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          pointerEvents: isOpeningLevel ? 'none' : 'auto',
          paddingTop: '20px',
          paddingBottom: '0px',
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
            const isCurrent  = node.id === nextPlayableLevelId;

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

export const LevelMap = ArcadeView;
