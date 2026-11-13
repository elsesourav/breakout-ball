import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { CANVAS_WIDTH } from '../constants/game';

export const CreateMode: React.FC = () => {
  const { userCreatedLevels, openDesigner, openPreview, openModifier } = useGame();

  return (
    <div className="map extra" id="userCreateMap">
      <div className="top">
        <div className="box" id="createLevel" onClick={openDesigner}>
          <i className="sbi-plus1" />
          <p>Create a Level</p>
        </div>
      </div>

      <div id="createMode" className="inner">
        {userCreatedLevels.map((lvl) => (
          <UserLevelCard
            key={lvl.id}
            level={lvl}
            onSelect={() => openPreview(lvl)}
            onSettings={(e) => {
              e.stopPropagation();
              openModifier(lvl);
            }}
          />
        ))}

        {userCreatedLevels.length === 0 && (
          <div
            style={{
              color: '#888',
              textAlign: 'center',
              gridColumn: 'span 2',
              padding: '60px 20px',
              fontFamily: 'f3',
              fontSize: '14px',
            }}
          >
            No custom levels yet. Click <strong>"Create a Level"</strong> above to design your first custom stage!
          </div>
        )}
      </div>
    </div>
  );
};

const UserLevelCard: React.FC<{
  level: LevelData;
  onSelect: () => void;
  onSettings: (e: React.MouseEvent) => void;
}> = ({ level, onSelect, onSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawLevelPreviewOnCanvas(canvasRef.current, level.blocks, 240, 240);
    }
  }, [level]);

  return (
    <div className="level show" onClick={onSelect}>
      <div className={`privacy ${!level.isPublic ? 'active' : ''}`}>
        <i className="sbi-groups" title="Public" />
        <i className="sbi-person" title="Private" />
      </div>

      <canvas
        ref={canvasRef}
        className="levelCvs"
        width={CANVAS_WIDTH}
        height={CANVAS_WIDTH * 0.9}
      />

      <div className="details">
        <div className="playCount">
          <i className="sbi-play-circle" />
          <p className="count">{level.playCount || 0}</p>
        </div>
        <p className="id">{level.id}</p>
        <p
          className="sbi-settings setting"
          title="Level Settings"
          onClick={onSettings}
        />
      </div>
    </div>
  );
};
