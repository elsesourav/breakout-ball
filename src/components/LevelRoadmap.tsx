import React, { useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import {
  TOTAL_LEVELS,
  SPACING,
  SVG_WIDTH,
  BOTTOM_OFFSET,
  TOP_OFFSET,
  TOTAL_HEIGHT,
  SECTOR_CONFIG,
  RoadmapNode,
  FloatingBrick,
  Obstacle,
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

  // Compute energy conduit nodes along an arcade ricochet path
  const nodes: RoadmapNode[] = useMemo(() => {
    const list: RoadmapNode[] = [];
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const y = TOTAL_HEIGHT - BOTTOM_OFFSET - (i - 1) * SPACING;
      const angle = (i - 1) * 1.05;
      const x = 180 + Math.sin(angle) * 92;

      let zone = 1;
      if (i > 15) zone = 4;
      else if (i > 10) zone = 3;
      else if (i > 5) zone = 2;

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

  // Ambient floating Breakout Bricks in background (theme aligned)
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
      const y = (TOTAL_HEIGHT / 18) * i + ((i * 37) % 50);
      const isLeft = i % 2 === 0;
      const x = isLeft ? 35 + ((i * 23) % 45) : 325 - ((i * 29) % 45);

      bricks.push({
        id: i,
        x,
        y,
        w: 38 + ((i * 7) % 18),
        h: 18 + ((i * 3) % 8),
        color: palette.color,
        glow: palette.glow,
        rotation: ((i * 17) % 30) - 15,
        opacity: 0.18 + ((i * 5) % 15) * 0.01,
      });
    }
    return bricks;
  }, []);

  // Kinetic Obstacles placed along the energy path
  const obstacles: Obstacle[] = useMemo(() => {
    return [
      {
        id: 'gate-sector-2',
        type: 'forcefield',
        x: 180,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 4.5 * SPACING,
        label: 'GATE 01',
        locked: currentUnlockedId < 6,
      },
      {
        id: 'titanium-1',
        type: 'titanium',
        x: 105,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 2.5 * SPACING,
      },
      {
        id: 'plasma-1',
        type: 'plasma',
        x: 255,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 3.2 * SPACING,
      },
      {
        id: 'gate-sector-3',
        type: 'forcefield',
        x: 180,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 9.5 * SPACING,
        label: 'GATE 02',
        locked: currentUnlockedId < 11,
      },
      {
        id: 'titanium-2',
        type: 'titanium',
        x: 245,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 7.5 * SPACING,
      },
      {
        id: 'plasma-2',
        type: 'plasma',
        x: 110,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 8.3 * SPACING,
      },
      {
        id: 'gate-sector-4',
        type: 'forcefield',
        x: 180,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 14.5 * SPACING,
        label: 'GATE 03',
        locked: currentUnlockedId < 16,
      },
      {
        id: 'titanium-3',
        type: 'titanium',
        x: 115,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 12.5 * SPACING,
      },
      {
        id: 'plasma-3',
        type: 'plasma',
        x: 245,
        y: TOTAL_HEIGHT - BOTTOM_OFFSET - 13.8 * SPACING,
      },
    ];
  }, [currentUnlockedId]);

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
        title: 'CORE OFFLINE',
        message: `Clear Core ${levelId - 1} to break the firewall and unlock Core ${levelId < 10 ? '0' + levelId : levelId}.`,
        titleColor: '#00f7ff',
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

  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden select-none bg-[#03040c]"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 60% 40% at 50% 100%, rgba(0, 247, 255, 0.12) 0%, transparent 60%),
          linear-gradient(to right, rgba(0, 247, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 247, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 28px 28px, 28px 28px',
      }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: `${SVG_WIDTH}px`,
          height: `${TOTAL_HEIGHT}px`,
        }}
      >
        {/* Floating Breakout Bricks along roadmap */}
        {floatingBricks.map((b) => (
          <div
            key={`brick-${b.id}`}
            className="absolute rounded pointer-events-none transition-transform"
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

        {/* Laser Conduit SVG */}
        <RoadmapConduitSvg nodes={nodes} pathData={conduitPathData} />

        {/* Map Obstacles */}
        <RoadmapObstacles obstacles={obstacles} />

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
  );
};
