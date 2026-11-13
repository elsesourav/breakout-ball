import React from 'react';
import { Trophy, Medal, Award, User, Flame } from 'lucide-react';

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
    <div className="w-full flex flex-col rounded-xl bg-[#070a1a]/95 border border-white/10 overflow-hidden shadow-lg backdrop-blur-md">
      {/* Table Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span
            className="font-display font-bold text-xs tracking-wider text-cyan-300"
            style={{ color: '#00f7ff' }}
          >
            {title}
          </span>
        </div>
        <span
          className="font-tech text-[10px] tracking-wider uppercase"
          style={{ color: '#94a3b8' }}
        >
          GLOBAL TOP PILOTS
        </span>
      </div>

      {/* Column Labels */}
      <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-tech text-slate-400 border-b border-white/5 uppercase tracking-wider bg-black/30">
        <span className="col-span-2 text-center">RANK</span>
        <span className="col-span-5 text-left pl-1">PILOT</span>
        <span className="col-span-3 text-right">SCORE</span>
        <span className="col-span-2 text-right pr-1">TIME</span>
      </div>

      {/* Ranking Rows */}
      <div className="flex flex-col divide-y divide-white/5 max-h-36 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="py-3 text-center text-xs font-ui text-slate-400">
            No rankings yet. Be the first to clear this level!
          </div>
        ) : (
          entries.slice(0, 4).map((entry) => {
            const isUser =
              entry.isCurrentUser ||
              (currentUser && currentUser !== 'anonymous' && entry.username === currentUser);

            // Custom Rank Badge for Top 3 vs 4+
            let rankBadge = (
              <span className="font-tech font-bold text-xs text-slate-400">
                #{entry.rank}
              </span>
            );

            if (entry.rank === 1) {
              rankBadge = (
                <div className="flex items-center justify-center gap-0.5 w-6 h-6 rounded-md bg-amber-500/20 border border-amber-400/50 shadow-[0_0_8px_rgba(255,215,0,0.4)] mx-auto">
                  <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span className="font-tech font-black text-[11px] text-amber-300">1</span>
                </div>
              );
            } else if (entry.rank === 2) {
              rankBadge = (
                <div className="flex items-center justify-center gap-0.5 w-6 h-6 rounded-md bg-slate-300/20 border border-slate-300/40 shadow-[0_0_6px_rgba(203,213,225,0.3)] mx-auto">
                  <Medal className="w-3 h-3 text-slate-200" />
                  <span className="font-tech font-black text-[11px] text-slate-200">2</span>
                </div>
              );
            } else if (entry.rank === 3) {
              rankBadge = (
                <div className="flex items-center justify-center gap-0.5 w-6 h-6 rounded-md bg-amber-700/20 border border-amber-600/40 shadow-[0_0_6px_rgba(217,119,6,0.3)] mx-auto">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span className="font-tech font-black text-[11px] text-amber-400">3</span>
                </div>
              );
            }

            const formattedTime =
              typeof entry.time === 'number' ? `${entry.time.toFixed(1)}s` : String(entry.time);

            return (
              <div
                key={`rank-${entry.rank}-${entry.username}`}
                className={`grid grid-cols-12 items-center px-3 py-1.5 transition-colors ${
                  isUser
                    ? 'bg-cyan-950/40 border-l-2 border-cyan-400'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                {/* Rank Badge */}
                <div className="col-span-2 flex items-center justify-center">
                  {rankBadge}
                </div>

                {/* Pilot Username & Initials */}
                <div className="col-span-5 flex items-center gap-1.5 min-w-0 pl-1">
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
                    <span className="text-[8px] font-tech font-bold px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      YOU
                    </span>
                  )}
                </div>

                {/* Score */}
                <div className="col-span-3 text-right">
                  <span
                    className="font-tech font-bold text-xs"
                    style={{ color: '#00f7ff' }}
                  >
                    {entry.score.toLocaleString()}
                  </span>
                </div>

                {/* Time */}
                <div className="col-span-2 text-right pr-1">
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
    </div>
  );
};
