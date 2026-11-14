import React from 'react';
import { Trophy } from 'lucide-react';
import { RoadmapNode, SVG_WIDTH } from './types';

interface RoadmapSectorBannerProps {
  nodes: RoadmapNode[];
}

export const RoadmapSectorBanner: React.FC<RoadmapSectorBannerProps> = ({ nodes }) => {
  const summitNode = nodes[nodes.length - 1];

  return (
    <>
      {/* Sector Gateway Headers (Themed Milestones) - Clean Typography, No Magic Icon */}
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
              // Sector 1 entrance sits cleanly below Level 1; other sectors sit comfortably above their milestone
              top: isEntrance ? `${node.y + 75}px` : `${node.y - 110}px`,
            }}
          >
            <div
              className="flex flex-col items-center px-4 py-2 rounded-xl border select-none whitespace-nowrap shadow-xl"
              style={{
                backgroundColor: 'rgba(6, 10, 26, 0.96)',
                borderColor: sector.color,
                boxShadow: `0 4px 20px rgba(0,0,0,0.85), 0 0 14px ${sector.accentGlow}, inset 0 1px 1px rgba(255,255,255,0.25)`,
              }}
            >
              {/* Clean Crisp Sector Heading without Magic/Sparkle Icon */}
              <div className="flex items-center gap-1.5 leading-none whitespace-nowrap">
                <span
                  className="font-display font-black text-xs tracking-wider whitespace-nowrap text-white"
                  style={{
                    letterSpacing: '0.08em',
                  }}
                >
                  SECTOR {sector.number}
                </span>
                <span
                  style={{ color: sector.color }}
                  className="font-display font-black text-xs"
                >
                  //
                </span>
                <span
                  className="font-display font-black text-xs tracking-wider whitespace-nowrap"
                  style={{
                    color: sector.color,
                    letterSpacing: '0.08em',
                    textShadow: `0 0 10px ${sector.color}`,
                  }}
                >
                  {sector.name}
                </span>
              </div>

              {/* Subtitle in Clean Slate Contrast */}
              <span className="font-tech text-[10px] font-bold tracking-wider mt-1 whitespace-nowrap text-slate-300">
                {sector.subtitle}
              </span>
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
            top: `${summitNode.y - 95}px`,
          }}
        >
          {/* Golden Apex Ring */}
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.18)',
              border: '2.5px solid #ffd700',
              boxShadow: '0 4px 0 #92400e, 0 8px 25px rgba(255, 215, 0, 0.8), inset 0 2px 4px #ffffff',
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
          >
            <Trophy style={{ color: '#ffd700' }} className="w-7 h-7 drop-shadow-[0_0_12px_#ffd700]" />
          </div>
          <span
            className="font-display font-black text-sm tracking-widest text-amber-300"
            style={{
              textShadow: '0 0 14px rgba(255, 215, 0, 0.75)',
              letterSpacing: '0.1em',
            }}
          >
            GRAND APEX REACTOR
          </span>
          <span className="font-tech text-[10px] font-bold tracking-wide text-amber-100">
            FINAL OVERDRIVE CORE
          </span>
        </div>
      )}
    </>
  );
};
