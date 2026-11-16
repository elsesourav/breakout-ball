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

        const bannerY = isEntrance ? node.y + 60 : node.y - 58;

        return (
          <div
            key={`sector-banner-${node.id}`}
            className="roadmap-scale-item absolute z-10 flex flex-col items-center pointer-events-none select-none px-2"
            data-base-transform="translateX(-50%)"
            data-y={bannerY}
            style={{
              left: `${(230 / SVG_WIDTH) * 100}%`,
              // Sector 1 entrance sits cleanly below Level 1; other sectors sit comfortably at the midpoint between milestone levels
              top: `${bannerY}px`,
              transform: 'translateX(-50%)',
              willChange: 'transform, opacity',
            }}
          >
            <div
              className="flex flex-col items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border select-none shadow-xl max-w-full text-center"
              style={{
                backgroundColor: 'rgba(6, 10, 26, 0.96)',
                borderColor: sector.color,
                boxShadow: `0 4px 20px rgba(0,0,0,0.85), 0 0 14px ${sector.accentGlow}, inset 0 1px 1px rgba(255,255,255,0.25)`,
              }}
            >
              {/* Clean Crisp Sector Heading without Magic/Sparkle Icon */}
              <div className="flex items-center justify-center gap-1.5 leading-none whitespace-nowrap">
                <span
                  className="font-display font-black text-[10.5px] sm:text-xs tracking-wider whitespace-nowrap text-white"
                  style={{
                    letterSpacing: '0.08em',
                  }}
                >
                  SECTOR {sector.number}
                </span>
                <span
                  style={{ color: sector.color }}
                  className="font-display font-black text-[10.5px] sm:text-xs"
                >
                  //
                </span>
                <span
                  className="font-display font-black text-[10.5px] sm:text-xs tracking-wider whitespace-nowrap"
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
              <span className="font-tech text-[9px] sm:text-[9.5px] font-bold tracking-wider mt-0.5 sm:mt-1 whitespace-nowrap text-slate-300 text-center">
                {sector.subtitle}
              </span>
            </div>
          </div>
        );
      })}

      {/* Grand Apex Summit Reactor at Level 50 */}
      {summitNode && (
        <div
          className="roadmap-scale-item absolute z-30 flex flex-col items-center pointer-events-none select-none px-2"
          data-base-transform="translateX(-50%)"
          data-y={summitNode.y - 140}
          style={{
            left: `${(230 / SVG_WIDTH) * 100}%`,
            top: `${summitNode.y - 140}px`,
            transform: 'translateX(-50%)',
            willChange: 'transform, opacity',
          }}
        >
          {/* Golden Apex Ring */}
          <div
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.18)',
              border: '2.5px solid #ffd700',
              boxShadow: '0 4px 0 #92400e, 0 8px 25px rgba(255, 215, 0, 0.8), inset 0 2px 4px #ffffff',
            }}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2"
          >
            <Trophy style={{ color: '#ffd700' }} className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_0_12px_#ffd700]" />
          </div>

          {/* High-tech Apex Cyber Card - Perfectly Centered, Never Cut Off */}
          <div
            className="flex flex-col items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border select-none shadow-2xl backdrop-blur-md max-w-full text-center"
            style={{
              backgroundColor: 'rgba(6, 10, 26, 0.98)',
              borderColor: '#ffd700',
              boxShadow:
                '0 4px 20px rgba(0,0,0,0.9), 0 0 14px rgba(255, 215, 0, 0.45), inset 0 1px 1px rgba(255,255,255,0.25)',
            }}
          >
            <div className="flex items-center justify-center gap-1.5 leading-none whitespace-nowrap">
              <span
                className="font-display font-black text-[10.5px] sm:text-xs tracking-wider whitespace-nowrap text-amber-300"
                style={{
                  letterSpacing: '0.08em',
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.7)',
                }}
              >
                GRAND APEX
              </span>
              <span className="font-display font-black text-[10.5px] sm:text-xs text-amber-400">
                //
              </span>
              <span
                className="font-display font-black text-[10.5px] sm:text-xs tracking-wider whitespace-nowrap text-white"
                style={{
                  letterSpacing: '0.08em',
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.6)',
                }}
              >
                STAGE 50
              </span>
            </div>

            <span className="font-tech text-[9px] sm:text-[9.5px] font-bold tracking-wider mt-0.5 sm:mt-1 whitespace-nowrap text-amber-200/90 text-center">
              FINAL OVERDRIVE CORE
            </span>
          </div>
        </div>
      )}
    </>
  );
};
