import React from 'react';

interface ArenaSkeletonGridProps {
  count?: number;
}

export const ArenaSkeletonGrid: React.FC<ArenaSkeletonGridProps> = ({ count = 6 }) => {
  return (
    <div className="w-full max-w-sm px-4 sm:px-5 grid grid-cols-2 gap-3 mb-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`skeleton-${idx}`}
          style={{
            backgroundColor: 'rgba(8, 13, 36, 0.94)',
            border: '1.5px solid rgba(0, 247, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            borderRadius: '14px',
          }}
          className="relative flex flex-col overflow-hidden animate-pulse select-none"
        >
          {/* Canvas Box Skeleton with Cyber Shimmer */}
          <div className="w-full h-24 bg-[#040614] relative overflow-hidden border-b border-cyan-500/15 flex items-center justify-center">
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />

            {/* Faux block grid placeholders */}
            <div className="grid grid-cols-5 gap-1.5 opacity-25">
              {Array.from({ length: 10 }).map((__, bIdx) => (
                <div
                  key={`b-${bIdx}`}
                  className="w-4 h-2 rounded-[2px] bg-cyan-400/30"
                  style={{ animationDelay: `${(bIdx * 0.1).toFixed(1)}s` }}
                />
              ))}
            </div>
          </div>

          {/* Details Bar Skeleton */}
          <div className="px-2.5 py-2.5 flex flex-col gap-2 min-w-0">
            {/* Row 1: Title + Stage ID */}
            <div className="flex items-center justify-between gap-2">
              <div
                className="h-3 rounded bg-slate-700/60"
                style={{ width: `${55 + (idx % 3) * 15}%` }}
              />
              <div className="h-2.5 w-10 rounded bg-cyan-500/20" />
            </div>

            {/* Row 2: Creator + Plays */}
            <div className="flex items-center justify-between gap-2">
              <div className="h-2.5 w-16 rounded bg-slate-800/80" />
              <div className="h-2.5 w-9 rounded bg-amber-500/20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
