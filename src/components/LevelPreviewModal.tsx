import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { CANVAS_WIDTH } from '../constants/game';

export const LevelPreviewModal: React.FC = () => {
  const {
    selectedLevel,
    setScreen,
    startPlayLevel,
    localLevels,
    localProgress,
    leaderboards,
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

        <div className="btn">
          <span id="levelCreatorName">
            <small>@</small>
            {selectedLevel.creator}
          </span>
          <button id="startButton" onClick={() => startPlayLevel(selectedLevel)}>
            <p className="play">{progress?.completed ? 'PLAY AGAIN' : 'START'}</p>
          </button>
          <button id="nextLevelButton" onClick={handleNextLevel} title="Next Level">
            <i className="sbi-double-arrow" />
          </button>
          <button id="homeButton" onClick={() => setScreen('menu')} title="Home">
            <i className="sbi-home" />
          </button>
        </div>

        <div className="leaderboard">
          <div className="title">
            <i className="sbi-trophy2" />
            <p>Players Ranking</p>
          </div>
          <div className="ranking-table" id="rankingTable">
            {rankingList.map((entry, idx) => (
              <div key={idx} className="leaderboard-row">
                <span className="rank-num">#{entry.rank || idx + 1}</span>
                <span className="rank-name">{entry.username}</span>
                <span className="rank-time">{entry.time.toFixed(1)}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
