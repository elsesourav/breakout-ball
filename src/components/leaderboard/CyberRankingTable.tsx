import React from 'react';
import { Trophy, Flame } from 'lucide-react';

export interface RankingEntry {
  rank: number;
  username: string;
  score: number;
  time: number | string;
  isCurrentUser?: boolean;
}

interface CyberRankingTableProps {
  entries: RankingEntry[];
  title?: string;
  currentUser?: string;
}

export const CyberRankingTable: React.FC<CyberRankingTableProps> = ({
  entries,
  title = 'ARCADE LEADERBOARD',
  currentUser,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(7, 10, 26, 0.95)',
        border: '1.5px solid rgba(0, 247, 255, 0.25)',
        borderRadius: '14px',
      }}
      className="w-full flex flex-col overflow-hidden shadow-lg backdrop-blur-md"
    >
      {/* Table Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span
            className="font-display font-bold text-xs tracking-wider"
            style={{ color: '#00f7ff', textShadow: '0 0 8px rgba(0, 247, 255, 0.35)' }}
          >
            {title}
          </span>
        </div>
        <span
          className="font-tech text-[10px] tracking-wider uppercase font-semibold"
          style={{ color: '#94a3b8' }}
        >
          GLOBAL TOP PILOTS
        </span>
      </div>

      {/* Column Labels with Rigid CSS Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 64px 54px',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        }}
        className="px-3 py-1.5 text-[10px] font-tech text-slate-400 border-b border-white/10 uppercase tracking-wider"
      >
        <span className="text-center font-bold">RANK</span>
        <span className="text-left pl-1 font-bold">PILOT</span>
        <span className="text-right font-bold">SCORE</span>
        <span className="text-right pr-1 font-bold">TIME</span>
      </div>

      {/* Ranking Rows - Expanded height comfortably showing ~6 rows */}
      <div
        style={{
          maxHeight: '215px',
          overflowY: 'auto',
          overscrollBehaviorY: 'contain',
        }}
        className="flex flex-col divide-y divide-white/5 no-scrollbar"
      >
        {entries.length === 0 ? (
          <div className="py-3 text-center text-xs font-ui text-slate-400">
            No rankings yet. Be the first to clear this level!
          </div>
        ) : (
          entries.slice(0, 10).map((entry) => {
            const isUser =
              entry.isCurrentUser ||
              (currentUser && currentUser !== 'anonymous' && entry.username === currentUser);

            const isRank1 = entry.rank === 1;
            const isRank2 = entry.rank === 2;
            const isRank3 = entry.rank === 3;

            // Custom Animated Flame Rank Badge for Top 3 (Uniform Flame Icon with Rank Colors)
            let rankBadge = (
              <span className="font-tech font-bold text-xs text-slate-400">
                #{entry.rank}
              </span>
            );

            if (isRank1) {
              rankBadge = (
                <div
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(245, 158, 11, 0.08) 100%)',
                    border: '1.5px solid #ffd700',
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.55), inset 0 0 4px rgba(255, 215, 0, 0.2)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 1 - Gold Champion"
                >
                  <Flame className="w-3 h-3 text-amber-300 fill-amber-400 animate-pulse drop-shadow-[0_0_6px_#ffd700]" />
                  <span className="font-display font-black text-xs text-yellow-200">1</span>
                </div>
              );
            } else if (isRank2) {
              rankBadge = (
                <div
                  style={{
                    background: 'radial-gradient(circle, rgba(203, 213, 225, 0.25) 0%, rgba(148, 163, 184, 0.08) 100%)',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 0 10px rgba(203, 213, 225, 0.45), inset 0 0 4px rgba(203, 213, 225, 0.2)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 2 - Silver Elite"
                >
                  <Flame className="w-3 h-3 text-slate-200 fill-slate-300 animate-pulse drop-shadow-[0_0_6px_#cbd5e1]" />
                  <span className="font-display font-black text-xs text-slate-100">2</span>
                </div>
              );
            } else if (isRank3) {
              rankBadge = (
                <div
                  style={{
                    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.25) 0%, rgba(180, 83, 9, 0.08) 100%)',
                    border: '1.5px solid #d97706',
                    boxShadow: '0 0 10px rgba(217, 119, 6, 0.45), inset 0 0 4px rgba(217, 119, 6, 0.2)',
                  }}
                  className="flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 3 - Bronze Ace"
                >
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-600 animate-pulse drop-shadow-[0_0_6px_#d97706]" />
                  <span className="font-display font-black text-xs text-amber-300">3</span>
                </div>
              );
            }

            const formattedTime =
              typeof entry.time === 'number' ? `${entry.time.toFixed(1)}s` : String(entry.time);

            let rowBgStyle: React.CSSProperties = {};
            let rowBorderClass = 'hover:bg-white/[0.02]';

            if (isUser) {
              rowBgStyle = {
                background: 'linear-gradient(90deg, rgba(0, 247, 255, 0.16) 0%, rgba(0, 160, 255, 0.05) 100%)',
              };
              rowBorderClass = 'border-l-2 border-cyan-400';
            } else if (isRank1) {
              rowBgStyle = {
                background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 180, 0, 0.02) 70%, transparent 100%)',
              };
              rowBorderClass = 'border-l-2 border-amber-400/80';
            } else if (isRank2) {
              rowBgStyle = {
                background: 'linear-gradient(90deg, rgba(0, 247, 255, 0.08) 0%, rgba(0, 200, 255, 0.02) 70%, transparent 100%)',
              };
              rowBorderClass = 'border-l-2 border-cyan-400/70';
            } else if (isRank3) {
              rowBgStyle = {
                background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.07) 0%, rgba(217, 119, 6, 0.01) 70%, transparent 100%)',
              };
              rowBorderClass = 'border-l-2 border-amber-500/60';
            }

            return (
              <div
                key={`rank-${entry.rank}-${entry.username}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 64px 54px',
                  alignItems: 'center',
                  ...rowBgStyle,
                }}
                className={`px-3 py-2 transition-colors ${rowBorderClass}`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-center">
                  {rankBadge}
                </div>

                {/* Pilot Username & Initials */}
                <div className="flex items-center gap-1.5 min-w-0 pl-1 overflow-hidden">
                  <div
                    style={
                      isUser
                        ? {
                            background: 'linear-gradient(135deg, #00f7ff 0%, #3b82f6 100%)',
                            boxShadow: '0 0 8px rgba(0, 247, 255, 0.45)',
                            color: '#000000',
                          }
                        : undefined
                    }
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-tech flex-shrink-0 ${
                      isUser
                        ? 'font-black'
                        : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white'
                    }`}
                  >
                    {isUser ? 'Y' : entry.username.slice(0, 1).toUpperCase()}
                  </div>
                  {isUser ? (
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className="font-ui font-black text-xs tracking-wide"
                        style={{ color: '#00f7ff', textShadow: '0 0 8px rgba(0, 247, 255, 0.6)' }}
                      >
                        You
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-pulse flex-shrink-0" />
                    </div>
                  ) : (
                    <span className="font-ui text-xs truncate font-semibold text-slate-200">
                      @{entry.username}
                    </span>
                  )}
                </div>

                {/* Score */}
                <div className="text-right">
                  <span
                    className="font-tech font-bold text-xs"
                    style={{ color: '#00f7ff' }}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </div>

                {/* Time */}
                <div className="text-right pr-1">
                  <span
                    className="font-tech font-semibold text-xs"
                    style={{ color: '#cbd5e1' }}
                  >
                    {formattedTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Scrollable Indicator Pill for Top 10 Leaderboard */}
      {entries.length > 6 && (
        <div className="py-1 px-3 bg-black/60 border-t border-white/5 flex items-center justify-between text-[9px] font-tech text-slate-400">
          <span>TOP 10 PILOTS</span>
          <span className="text-cyan-400/90 font-bold animate-pulse tracking-wider">SCROLL FOR MORE ▼</span>
        </div>
      )}
    </div>
  );
};
