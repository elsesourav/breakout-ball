import React from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';

export const LocalMode: React.FC = () => {
  const { localLevels, localProgress, openPreview } = useGame();

  // Show 30 levels in the grid
  const totalLevels = 30;

  const handleLevelClick = (levelNumber: number) => {
    const isUnlocked = localProgress[String(levelNumber)] !== undefined;
    if (!isUnlocked) return;

    // Find custom level or generate procedural layout
    let levelData = localLevels.find((l) => l.id === String(levelNumber));
    if (!levelData) {
      levelData = {
        id: String(levelNumber),
        name: `Level ${levelNumber}`,
        creator: 'sourav',
        playCount: 100 + levelNumber * 12,
        blocks: [
          { x: 2, y: 2, h: (levelNumber % 5) + 1 },
          { x: 3, y: 2, h: (levelNumber % 5) + 1 },
          { x: 4, y: 2, h: (levelNumber % 5) + 1 },
          { x: 5, y: 2, h: (levelNumber % 5) + 1 },
          { x: 6, y: 2, h: (levelNumber % 5) + 1 },
          { x: 3, y: 3, h: ((levelNumber + 1) % 5) + 1 },
          { x: 4, y: 3, h: 6 },
          { x: 5, y: 3, h: ((levelNumber + 1) % 5) + 1 },
          { x: 4, y: 4, h: ((levelNumber + 2) % 5) + 1 },
        ],
      };
    }
    openPreview(levelData);
  };

  return (
    <div id="localMode" className="map">
      {Array.from({ length: totalLevels }).map((_, index) => {
        const levelNum = index + 1;
        const progress = localProgress[String(levelNum)];
        const isUnlocked = progress !== undefined;
        const isComplete = progress?.completed;
        const rank = progress?.rank ? progress.rank : '∞';
        const bestTime = progress?.bestTime ? progress.bestTime.toFixed(1) : '∞';

        let levelClasses = 'level';
        if (!isUnlocked) levelClasses += ' lock';
        if (isComplete) levelClasses += ' complete';

        return (
          <div
            key={levelNum}
            className={levelClasses}
            onClick={() => handleLevelClick(levelNum)}
          >
            <div className="top">
              <div className="hashtag">
                <i className="sbi-trophy2" />
                <p className="local-user-rank">{rank}</p>
              </div>
              <div className="is-lock-or-complete">
                <i className="sbi-lock-outline lock" />
                <i className="sbi-check-square-o check" />
              </div>
            </div>

            <div className="icon-and-no">
              <i className="sbi-fire" />
              <p className="no">{levelNum}</p>
            </div>

            <div className="complete-time">
              <i className="sbi-stopwatch1" />
              <p className="time">{bestTime}</p>
              <span>s</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
