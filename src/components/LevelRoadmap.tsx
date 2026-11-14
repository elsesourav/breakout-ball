import React, { useEffect, useRef, useMemo } from 'react';
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

export const LevelRoadmap: React.FC = () => {
  const { localLevels, localProgress, openPreview, showAlert } = useGame();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeNodeRef = useRef<HTMLDivElement | null>(null);
  const hasInitialScrolled = useRef<boolean>(false);

  // Compute energy conduit nodes along an arcade ricochet path with generous 175px spacing
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
      else if (i > 6) zone = 2;

      const sector = SECTOR_CONFIG[i];

      list.push({
        id: i,
        x: Math.round(x),
        y: Math.round(y),
        zone,
        sector,
      });
    }
    return list;
  }, []);

  // Find player's current active unlocked level
  const currentUnlockedId = useMemo(() => {
    let highest = 1;
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      if (localProgress[String(i)] !== undefined) {
        highest = i;
      }
    }
    return highest;
  }, [localProgress]);

  // Ambient floating Breakout Bricks in outer margins (generous room, theme aligned)
  const floatingBricks: FloatingBrick[] = useMemo(() => {
    const bricks: FloatingBrick[] = [];
    const brickColors = [
      { color: '#00f7ff', glow: 'rgba(0, 247, 255, 0.6)' },
      { color: '#818cf8', glow: 'rgba(129, 140, 248, 0.6)' },
      { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)' },
      { color: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' },
      { color: '#ffd700', glow: 'rgba(255, 215, 0, 0.6)' },
    ];

    for (let i = 0; i < 18; i++) {
      const palette = brickColors[i % brickColors.length];
      const y = (TOTAL_HEIGHT / 18) * i + ((i * 47) % 60);
      const isLeft = i % 2 === 0;
      const w = 34 + ((i * 7) % 12);
      const h = 15 + ((i * 3) % 6);
      const x = isLeft
        ? 20 + ((i * 15) % 25)
        : SVG_WIDTH - w - 20 - ((i * 17) % 25);

      bricks.push({
        id: i,
        x,
        y,
        w,
        h,
        color: palette.color,
        glow: palette.glow,
        rotation: ((i * 17) % 30) - 15,
        opacity: 0.18 + ((i * 5) % 15) * 0.01,
      });
    }
    return bricks;
  }, []);

  // Ambient kinetic hazards positioned safely in outer curves away from the conduit track
  const obstacles: Obstacle[] = useMemo(() => {
    return [
      {
        id: 'titanium-1',
        type: 'titanium',
        x: 65,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 2.5 * SPACING,
      },
      {
        id: 'plasma-1',
        type: 'plasma',
        x: 315,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 4.5 * SPACING,
      },
      {
        id: 'titanium-2',
        type: 'titanium',
        x: 315,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 8.5 * SPACING,
      },
      {
        id: 'plasma-2',
        type: 'plasma',
        x: 65,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 10.5 * SPACING,
      },
      {
        id: 'titanium-3',
        type: 'titanium',
        x: 65,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 14.5 * SPACING,
      },
      {
        id: 'plasma-3',
        type: 'plasma',
        x: 315,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 16.5 * SPACING,
      },
      {
        id: 'titanium-4',
        type: 'titanium',
        x: 315,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 20.5 * SPACING,
      },
      {
        id: 'plasma-4',
        type: 'plasma',
        x: 65,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 22.5 * SPACING,
      },
    ];
  }, []);

  // Compute route blockers on each path between consecutive levels
  const routeBlockers: RouteBlocker[] = useMemo(() => {
    const list: RouteBlocker[] = [];
    for (let i = 1; i < nodes.length; i++) {
      const curr = nodes[i - 1];
      const next = nodes[i];
      const midX = Math.round((curr.x + next.x) / 2);
      const midY = Math.round((curr.y + next.y) / 2);

      const isCleared = i < currentUnlockedId;
      const isActive = i === currentUnlockedId;

      list.push({
        id: `route-blocker-${i}`,
        fromLevel: i,
        toLevel: i + 1,
        x: midX,
        y: midY,
        type: i % 3 === 0 ? 'quantum_gate' : i % 2 === 0 ? 'plasma_shield' : 'firewall',
        title: `FIREWALL ${i < 10 ? '0' + i : i}`,
        isCleared,
        isActive,
      });
    }
    return list;
  }, [nodes, currentUnlockedId]);

  // Construct smooth cubic bezier conduit path
  const conduitPathData = useMemo(() => {
    if (nodes.length === 0) return '';
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];
      const dy = (next.y - curr.y) * 0.5;
      const cp1x = curr.x;
      const cp1y = curr.y + dy;
      const cp2x = next.x;
      const cp2y = next.y - dy;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  }, [nodes]);

  // Construct active laser pulse path only covering unlocked progression
  const activePathData = useMemo(() => {
    const activeNodes = nodes.filter((n) => n.id <= currentUnlockedId);
    if (activeNodes.length <= 1) return '';
    let d = `M ${activeNodes[0].x} ${activeNodes[0].y}`;
    for (let i = 0; i < activeNodes.length - 1; i++) {
      const curr = activeNodes[i];
      const next = activeNodes[i + 1];
      const dy = (next.y - curr.y) * 0.5;
      d += ` C ${curr.x} ${curr.y + dy}, ${next.x} ${next.y - dy}, ${next.x} ${next.y}`;
    }
    return d;
  }, [nodes, currentUnlockedId]);

  // On first load, scroll smoothly to the active unlocked level
  useEffect(() => {
    if (hasInitialScrolled.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const timer = setTimeout(() => {
      const activeEl = activeNodeRef.current;
      if (activeEl) {
        const containerHeight = container.clientHeight;
        const targetScrollTop = activeEl.offsetTop - containerHeight / 2;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
      hasInitialScrolled.current = true;
    }, 250);

    return () => clearTimeout(timer);
  }, [currentUnlockedId]);

  // Handle level node tap
  const handleLevelClick = (levelId: number) => {
    const isUnlocked = localProgress[String(levelId)] !== undefined;

    if (!isUnlocked) {
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
    if (level) {
      openPreview(level);
    }
  };

  // Handle route blocker tap
  const handleBlockerClick = (blocker: RouteBlocker) => {
    showAlert({
      title: 'ROUTE BLOCKED',
      message: `The route to Level ${blocker.toLevel} is blocked! Complete Level ${blocker.fromLevel} to destroy this obstacle and open the path.`,
      titleColor: '#ff0844',
      btn1Text: 'DEPLOY CORE',
      btn1Color: '#00f7ff',
    });
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none bg-[#03040c]"
      style={{
        perspective: '900px',
        perspectiveOrigin: '50% 88%',
        backgroundImage: `
          radial-gradient(ellipse 95% 20% at 50% 0%, rgba(255, 215, 0, 0.12) 0%, transparent 75%),
          radial-gradient(ellipse 90% 20% at 50% 30%, rgba(244, 63, 94, 0.1) 0%, transparent 75%),
          radial-gradient(ellipse 90% 20% at 50% 65%, rgba(183, 115, 255, 0.1) 0%, transparent 75%),
          radial-gradient(ellipse 95% 25% at 50% 100%, rgba(0, 247, 255, 0.14) 0%, transparent 75%)
        `,
      }}
    >
      {/* Top Atmospheric Horizon Gradient overlay */}
      <div
        className="absolute top-0 inset-x-0 h-24 pointer-events-none z-30"
        style={{
          background:
            'linear-gradient(to bottom, #03040c 0%, rgba(3, 4, 12, 0.9) 45%, transparent 100%)',
        }}
      />

      {/* Edge-to-Edge Native Scroll Container - Seamless Fit with Zero Uncovered Outside Gaps */}
      <div
        ref={scrollContainerRef}
        className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          contain: 'content',
          width: '100%',
          height: '100%',
          paddingBottom: '140px',
          backgroundImage: `
            radial-gradient(ellipse 95% 18% at 50% 1%, rgba(255, 215, 0, 0.16) 0%, transparent 75%),
            radial-gradient(ellipse 90% 18% at 50% 24%, rgba(244, 63, 94, 0.13) 0%, transparent 75%),
            radial-gradient(ellipse 90% 18% at 50% 48%, rgba(183, 115, 255, 0.13) 0%, transparent 75%),
            radial-gradient(ellipse 90% 18% at 50% 72%, rgba(99, 102, 241, 0.14) 0%, transparent 75%),
            radial-gradient(ellipse 95% 20% at 50% 98%, rgba(0, 247, 255, 0.16) 0%, transparent 75%)
          `,
        }}
      >
        {/* 3D Tilted Board: Oversized 136% width so 3D perspective narrowing never clips or exposes corners */}
        <div
          className="relative mx-auto overflow-visible select-none"
          style={{
            width: '136%',
            marginLeft: '-18%',
            height: `${TOTAL_HEIGHT}px`,
            transform: 'rotateX(14deg)',
            transformOrigin: '50% 100%',
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          <div
            className="relative mx-auto overflow-visible w-full max-w-[440px]"
            style={{
              height: `${TOTAL_HEIGHT}px`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Floating Breakout Bricks in generous margins */}
            {floatingBricks.map((b) => (
              <div
                key={`brick-${b.id}`}
                className="absolute rounded-md pointer-events-none transition-transform"
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
                }}
              />
            ))}

            {/* Laser Conduit SVG with Cleared Connected vs Blocked Severed Paths */}
            <RoadmapConduitSvg
              nodes={nodes}
              pathData={conduitPathData}
              activePathData={activePathData}
              currentUnlockedId={currentUnlockedId}
            />

            {/* Route Blockers & Map Obstacles (Physical 3D Clamps & Ambient Hazards) */}
            <RoadmapObstacles
              obstacles={obstacles}
              routeBlockers={routeBlockers}
              onBlockerClick={handleBlockerClick}
            />

            {/* Sector Gateway Banners */}
            <RoadmapSectorBanner nodes={nodes} />

            {/* Level Energy Cells */}
            {nodes.map((node) => {
              const progress = localProgress[String(node.id)];
              const isComplete = progress?.completed;
              const isCurrent = node.id === currentUnlockedId && !isComplete;

              return (
                <RoadmapNodeItem
                  key={`node-${node.id}`}
                  ref={isCurrent ? activeNodeRef : undefined}
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
    </div>
  );
};
