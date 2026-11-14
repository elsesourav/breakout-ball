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
          gridTemplateColumns: '36px 1fr 60px 52px',
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

      {/* Ranking Rows - Fixed compact scrollable height showing ~4 rows */}
      <div className="flex flex-col divide-y divide-white/5 max-h-[148px] overflow-y-auto overscroll-contain cyber-scroll pr-1">
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
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.28) 0%, rgba(245, 158, 11, 0.15) 100%)',
                    border: '1.5px solid #ffd700',
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.6), inset 0 0 6px rgba(255, 215, 0, 0.25)',
                  }}
                  className="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 1 - Champion"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-400 animate-pulse drop-shadow-[0_0_8px_#ffd700]" />
                  <span className="font-display font-black text-xs text-yellow-200">1</span>
                </div>
              );
            } else if (isRank2) {
              rankBadge = (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 247, 255, 0.25) 0%, rgba(148, 163, 184, 0.15) 100%)',
                    border: '1.5px solid #00f7ff',
                    boxShadow: '0 0 10px rgba(0, 247, 255, 0.45), inset 0 0 6px rgba(0, 247, 255, 0.2)',
                  }}
                  className="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 2 - Elite"
                >
                  <Flame className="w-3.5 h-3.5 text-cyan-300 fill-cyan-400 animate-pulse drop-shadow-[0_0_8px_#00f7ff]" />
                  <span className="font-display font-black text-xs text-cyan-200">2</span>
                </div>
              );
            } else if (isRank3) {
              rankBadge = (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)',
                    border: '1.5px solid #f97316',
                    boxShadow: '0 0 10px rgba(249, 115, 22, 0.45), inset 0 0 6px rgba(249, 115, 22, 0.2)',
                  }}
                  className="flex items-center justify-center gap-1 px-1.5 py-0.5 rounded-full mx-auto"
                  title="Rank 3 - Ace"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500 animate-pulse drop-shadow-[0_0_8px_#f97316]" />
                  <span className="font-display font-black text-xs text-orange-200">3</span>
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
                  gridTemplateColumns: '36px 1fr 60px 52px',
                  alignItems: 'center',
                  ...rowBgStyle,
                }}
                className={`px-3 py-1.5 transition-colors ${rowBorderClass}`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-center">
                  {rankBadge}
                </div>

                {/* Pilot Username & Initials */}
                <div className="flex items-center gap-1.5 min-w-0 pl-1 overflow-hidden">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-[9px] font-bold font-tech text-white flex-shrink-0">
                    {entry.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span
                    className={`font-ui text-xs truncate ${
                      isUser ? 'font-black text-cyan-300' : 'font-semibold text-slate-200'
                    }`}
                    style={{ color: isUser ? '#00f7ff' : '#e2e8f0' }}
                  >
                    @{entry.username}
                  </span>
                  {isUser && (
                    <span className="text-[8px] font-tech font-bold px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex-shrink-0">
                      YOU
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
      {entries.length > 4 && (
        <div className="py-1 px-3 bg-black/60 border-t border-white/5 flex items-center justify-between text-[9px] font-tech text-slate-400">
          <span>TOP 10 PILOTS</span>
          <span className="text-cyan-400/90 font-bold animate-pulse tracking-wider">SCROLL FOR MORE ▼</span>
        </div>
      )}
    </div>
  );
};
