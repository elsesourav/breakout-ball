import React from 'react';
import { useGame } from '../../context/GameContext';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';
import { OverallScoreLeaderboard } from '../leaderboard/OverallScoreLeaderboard';

export const LeaderboardView: React.FC = () => {
  const { setActiveTab } = useGame();

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center pb-8 select-none cyber-grid-bg no-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* ── 1. Page Header with Back Button ── */}
      <PageHeaderWithBack
        title="GLOBAL RANKINGS"
        subtitle="APEX PILOTS // LEADERBOARD"
        onBack={() => setActiveTab('local')}
      />

      {/* ── 2. Leaderboard Content Area ── */}
      <div className="w-full max-w-sm px-3.5 pt-3 flex-1 flex flex-col min-h-0">
        <div
          style={{
            height: 'calc(100dvh - 90px)',
            maxHeight: 'calc(100dvh - 90px)',
            minHeight: '400px',
          }}
          className="w-full flex flex-col min-h-0"
        >
          <OverallScoreLeaderboard />
        </div>
      </div>
    </div>
  );
};
