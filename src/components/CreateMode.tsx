import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { LevelData } from '../types/game';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { CANVAS_WIDTH } from '../constants/game';
import { ArcadeButton, Badge } from '@elsesourav/react-ui';

export const CreateMode: React.FC = () => {
  const { userCreatedLevels, openDesigner, openPreview, openModifier } = useGame();

  return (
    <div className="map extra" id="userCreateMap">
      <div className="top my-1">
        <ArcadeButton
          variant="cyan"
          size="md"
          shape="rounded"
          mask={true}
          shine={true}
          shineMode="sweep"
          glow={true}
          leftIcon={<i className="sbi-plus1 text-base mr-1" />}
          onClick={openDesigner}
          className="w-[92%] py-2.5 tracking-wider"
        >
          Create a Level
        </ArcadeButton>
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
            className="flex flex-col items-center justify-center text-center p-8 gap-3 col-span-2 text-slate-400 font-sans"
          >
            <div className="w-16 h-16 rounded-full bg-surface-elevated/40 border border-border flex items-center justify-center text-2xl text-cyan-400">
              <i className="sbi-plus1" />
            </div>
            <p className="text-sm">No custom levels designed yet.</p>
            <p className="text-xs text-slate-500">Tap "Create a Level" to design your custom block layouts!</p>
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
    <div className="level show relative group" onClick={onSelect}>
      <div className="absolute top-2 right-2 z-10">
        <Badge
          variant={level.isPublic ? 'primary' : 'warning'}
          size="sm"
          className="text-[10px] uppercase font-bold"
        >
          {level.isPublic ? 'Public' : 'Private'}
        </Badge>
      </div>

      <canvas
        ref={canvasRef}
        className="levelCvs"
        width={CANVAS_WIDTH}
        height={CANVAS_WIDTH * 0.9}
      />

      <div className="details">
        <div className="playCount">
          <i className="sbi-play-circle text-amber-400" />
          <p className="count">{level.playCount || 0}</p>
        </div>
        <p className="id font-mono font-bold text-cyan-300">{level.id}</p>
        <button
          className="sbi-settings setting p-1 hover:text-cyan-400 transition-colors"
          title="Level Settings"
          onClick={onSettings}
        />
      </div>
    </div>
  );
};
