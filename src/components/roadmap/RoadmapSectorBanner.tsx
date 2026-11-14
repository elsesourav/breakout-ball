import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { RoadmapNode, SVG_WIDTH } from './types';

interface RoadmapSectorBannerProps {
  nodes: RoadmapNode[];
}

export const RoadmapSectorBanner: React.FC<RoadmapSectorBannerProps> = ({ nodes }) => {
  const summitNode = nodes[nodes.length - 1];

  return (
    <>
      {/* Sector Gateway Headers (Themed Milestones) */}
      {nodes.map((node) => {
        if (!node.sector) return null;
        const sector = node.sector;
        const isEntrance = node.id === 1;

        return (
          <div
            key={`sector-banner-${node.id}`}
            className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none"
            style={{
              left: `${(node.x / SVG_WIDTH) * 100}%`,
              // Sector 1 entrance sits cleanly below Level 1; other sectors sit above their milestone
              top: isEntrance ? `${node.y + 68}px` : `${node.y - 78}px`,
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg select-none whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(8, 14, 36, 0.98)',
                borderColor: sector.color,
                boxShadow: `0 3px 0 rgba(0,0,0,0.9), 0 6px 18px rgba(0,0,0,0.85), 0 0 20px ${sector.accentGlow}, inset 0 1px 2px rgba(255,255,255,0.4)`,
                transform: 'perspective(500px) rotateX(-6deg)',
              }}
            >
              <Sparkles style={{ color: sector.color }} className="w-3.5 h-3.5 flex-shrink-0 drop-shadow-[0_0_8px_currentColor]" />
              <div className="flex flex-col items-start leading-none whitespace-nowrap">
                <span
                  className="font-display font-black text-xs tracking-wider whitespace-nowrap"
                  style={{
                    color: '#ffffff',
                    textShadow: `0 1px 0 rgba(255,255,255,0.9), 0 2px 0 ${sector.color}, 0 3px 0 ${sector.color}cc, 0 4px 6px rgba(0,0,0,0.95), 0 0 16px ${sector.accentGlow}`,
                    letterSpacing: '0.08em',
                  }}
                >
                  SECTOR {sector.number} // {sector.name}
                </span>
                <span
                  className="font-tech text-[10px] font-bold tracking-wider mt-1 whitespace-nowrap"
                  style={{
                    color: '#e2e8f0',
                    textShadow: `0 1px 2px rgba(0,0,0,0.95), 0 0 10px ${sector.accentGlow}`,
                  }}
                >
                  {sector.subtitle}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Grand Apex Summit Reactor at Level 30 */}
      {summitNode && (
        <div
          className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none"
          style={{
            left: `${(summitNode.x / SVG_WIDTH) * 100}%`,
            top: `${summitNode.y - 100}px`,
            transform: 'perspective(500px) rotateX(-10deg)',
          }}
        >
          {/* Golden Apex Ring */}
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.18)',
              border: '2.5px solid #ffd700',
              boxShadow: '0 4px 0 #92400e, 0 8px 25px rgba(255, 215, 0, 0.8), inset 0 2px 4px #ffffff',
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
          >
            <Trophy style={{ color: '#ffd700' }} className="w-7 h-7 drop-shadow-[0_0_12px_#ffd700]" />
          </div>
          <span
            className="font-display font-black text-sm tracking-widest mt-1.5"
            style={{
              color: '#ffffff',
              textShadow: '0 1px 0 #fff, 0 2px 0 #ffd700, 0 3px 0 #eab308, 0 4px 0 #ca8a04, 0 5px 0 #854d0e, 0 6px 8px rgba(0,0,0,0.95), 0 0 22px #ffd700',
              letterSpacing: '0.1em',
            }}
          >
            GRAND APEX REACTOR
          </span>
          <span
            className="font-tech text-[10px] font-bold tracking-wide"
            style={{
              color: '#fef08a',
              textShadow: '0 1px 0 rgba(0,0,0,0.9), 0 0 8px #ffd700',
            }}
          >
            FINAL OVERDRIVE CORE
          </span>
        </div>
      )}
    </>
  );
};
