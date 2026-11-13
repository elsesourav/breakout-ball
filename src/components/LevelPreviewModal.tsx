import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { CANVAS_WIDTH } from '../constants/game';
import { ArcadeButton, LeaderboardTable, LeaderboardItem } from '@elsesourav/react-ui';

export const LevelPreviewModal: React.FC = () => {
  const {
    selectedLevel,
    setScreen,
    startPlayLevel,
    localLevels,
    localProgress,
    leaderboards,
    user,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (selectedLevel && canvasRef.current) {
      drawLevelPreviewOnCanvas(canvasRef.current, selectedLevel.blocks, 360, 360);
    }
  }, [selectedLevel]);

  if (!selectedLevel) return null;

  const progress = localProgress[selectedLevel.id];
  const userRank = progress?.rank ? progress.rank : '∞';
  const bestTime = progress?.bestTime ? progress.bestTime.toFixed(1) : '∞';

  const rankingList = leaderboards[selectedLevel.id] || leaderboards.default || [];

  const leaderboardItems: LeaderboardItem[] = rankingList.map((entry, idx) => ({
    id: String(idx + 1),
    rank: entry.rank || idx + 1,
    name: entry.username,
    score: Math.round(10000 / Math.max(1, entry.time)),
    time: `${entry.time.toFixed(1)}s`,
    isCurrentUser: entry.username === user.username,
  }));

  const handleNextLevel = () => {
    const currentNum = parseInt(selectedLevel.id, 10);
    if (!isNaN(currentNum)) {
      const nextNum = currentNum + 1;
      const nextLvl = localLevels.find((l) => l.id === String(nextNum));
      if (nextLvl) {
        startPlayLevel(nextLvl);
        return;
      }
    }
    startPlayLevel(selectedLevel);
  };

  return (
    <div id="showPreview" className="active">
      <button id="previewClose" onClick={() => setScreen('menu')}>
        <i className="sbi-arrow-left2" />
      </button>

      <div className="rapper">
        <div className="canvas-and-lvl-details">
          <canvas
            ref={canvasRef}
            id="preview"
            width={CANVAS_WIDTH}
            height={CANVAS_WIDTH * 0.9}
          />
          <div className="lvl-details">
            <div className="flex selected-lvl">
              <p>Level</p>
              <div id="lvlNo">{selectedLevel.id}</div>
            </div>
            <div className="flex rank">
              <p>Your Rank</p>
              <div id="lvlRank">{userRank}</div>
            </div>
            <div className="flex time">
              <i className="sbi-stopwatch1" />
              <div>
                <p id="lvlTime">{bestTime}</p>
                <span>s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Creator Info */}
        <div className="flex items-center justify-between px-1 my-0.5 text-xs text-cyan-400 font-semibold">
          <span>
            By <span className="text-cyan-300 font-bold">@{selectedLevel.creator}</span>
          </span>
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">
            {!isNaN(Number(selectedLevel.id)) ? 'Campaign' : 'Community'}
          </span>
        </div>

        {/* Action Controls using ArcadeButton */}
        <div className="flex items-center gap-2 w-full my-1">
          <ArcadeButton
            variant="breakout-start"
            size="md"
            shape="pill"
            shine={true}
            shineMode="starburst"
            mask={true}
            glow={true}
            onClick={() => startPlayLevel(selectedLevel)}
            className="flex-1 py-2 text-sm font-black tracking-wider"
          >
            {progress?.completed ? 'PLAY AGAIN' : 'START'}
          </ArcadeButton>

          <ArcadeButton
            variant="cyan"
            size="sm"
            shape="rounded"
            mask={true}
            onClick={handleNextLevel}
            title="Next Level"
            className="w-10 h-10 p-0"
          >
            <i className="sbi-double-arrow text-base" />
          </ArcadeButton>

          <ArcadeButton
            variant="blue"
            size="sm"
            shape="rounded"
            mask={true}
            onClick={() => setScreen('menu')}
            title="Home"
            className="w-10 h-10 p-0"
          >
            <i className="sbi-home text-base" />
          </ArcadeButton>
        </div>

        {/* Players Ranking with LeaderboardTable */}
        <div className="w-full mt-1">
          <LeaderboardTable
            variant="breakout"
            title="Players Ranking"
            items={leaderboardItems}
            searchable={false}
            highlightPodium={true}
            maxRows={4}
            className="w-full text-xs"
          />
        </div>
      </div>
    </div>
  );
};
