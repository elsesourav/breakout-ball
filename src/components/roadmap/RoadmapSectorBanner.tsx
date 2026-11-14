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
            className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
            style={{
              left: `${(node.x / SVG_WIDTH) * 100}%`,
              // Sector 1 entrance sits cleanly below Level 1; other sectors sit above their milestone
              top: isEntrance ? `${node.y + 60}px` : `${node.y - 78}px`,
              contentVisibility: 'auto',
              containIntrinsicSize: '240px 60px',
            }}
          >
            <div
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border shadow-lg"
              style={{
                backgroundColor: 'rgba(8, 12, 32, 0.95)',
                borderColor: sector.color,
                boxShadow: `0 0 16px ${sector.accentGlow}, inset 0 0 8px ${sector.accentGlow}`,
              }}
            >
              <Sparkles style={{ color: sector.color }} className="w-3.5 h-3.5 flex-shrink-0" />
              <div className="flex flex-col items-start leading-none">
                <span
                  className="font-display font-black text-[11px] tracking-wider"
                  style={{
                    color: sector.color,
                    textShadow: `0 0 8px ${sector.accentGlow}`,
                  }}
                >
                  SECTOR {sector.number} // {sector.name}
                </span>
                <span
                  className="font-ui text-[9px] font-semibold tracking-wider mt-0.5"
                  style={{ color: '#94a3b8' }}
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
          className="absolute z-10 -translate-x-1/2 flex flex-col items-center pointer-events-none"
          style={{
            left: `${(summitNode.x / SVG_WIDTH) * 100}%`,
            top: `${summitNode.y - 100}px`,
            contentVisibility: 'auto',
            containIntrinsicSize: '160px 80px',
          }}
        >
          {/* Golden Apex Ring */}
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.15)',
              border: '2.5px solid #ffd700',
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.7)',
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center"
          >
            <Trophy style={{ color: '#ffd700' }} className="w-7 h-7 drop-shadow-[0_0_10px_#ffd700]" />
          </div>
          <span
            className="font-display font-black text-xs tracking-widest mt-1.5"
            style={{
              color: '#ffd700',
              textShadow: '0 0 12px rgba(255, 215, 0, 0.9), 0 2px 4px #000',
            }}
          >
            GRAND APEX REACTOR
          </span>
          <span
            className="font-ui text-[10px] font-semibold tracking-wide"
            style={{ color: '#fef08a' }}
          >
            FINAL OVERDRIVE CORE
          </span>
        </div>
      )}
    </>
  );
};
