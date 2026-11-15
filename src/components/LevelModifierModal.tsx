import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { CANVAS_WIDTH } from '../constants/game';
import { CustomCyberButton } from './common/CustomCyberButton';
import { CustomCyberSwitch } from './common/CustomCyberSwitch';

export const LevelModifierModal: React.FC = () => {
  const {
    editingLevel,
    closeModifier,
    updateLevelPrivacy,
    deleteUserLevel,
    showAlert,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (editingLevel) {
      setIsPublic(!!editingLevel.isPublic);
      if (canvasRef.current) {
        drawLevelPreviewOnCanvas(canvasRef.current, editingLevel.blocks, 260, 260);
      }
    }
  }, [editingLevel]);

  if (!editingLevel) return null;

  const handleDelete = () => {
    showAlert({
      title: 'Delete Level',
      message: `Are you sure you want to delete level ${editingLevel.id}? This action cannot be undone.`,
      btn1Text: 'Cancel',
      btn2Text: 'Delete',
      btn2Color: '#ff0844',
      onConfirm: () => {
        deleteUserLevel(editingLevel.id);
        closeModifier();
      },
    });
  };

  const handleSave = () => {
    updateLevelPrivacy(editingLevel.id, isPublic);
    closeModifier();
  };

  return (
    <div
      id="levelModifier"
      className="active"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModifier();
        }
      }}
    >
      <div className="btn" id="closeModifier" onClick={closeModifier}>
        <i className="sbi-cross1" />
      </div>

      <div className="inner">
        <div className="cvs">
          <canvas
            ref={canvasRef}
            id="cvsModifier"
            width={CANVAS_WIDTH}
            height={CANVAS_WIDTH * 0.9}
          />
        </div>

        <div className="lvl-details">
          <div className="flex selected-lvl">
            <span>Level</span>
            <p id="M_lvlNo">{editingLevel.id}</p>
          </div>
          <div className="flex rank">
            <span>Status</span>
            <p id="M_lvlRank">{isPublic ? 'Public' : 'Private'}</p>
          </div>
          <div className="flex time">
            <span className="sbi-play-circle" />
            <p id="M_playCount">{editingLevel.playCount || 0}</p>
          </div>
        </div>

        {/* Privacy Setting with CustomCyberSwitch */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/40 border border-white/10">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-300">
            Publish Online:
          </span>
          <CustomCyberSwitch
            checked={isPublic}
            onChange={(checked) => setIsPublic(checked)}
            variant="neon-green"
            size="md"
            showText={true}
            onLabel="PUB"
            offLabel="PRV"
            ariaLabel="Toggle Public or Private"
          />
        </div>

        {/* Action Buttons using CustomCyberButton */}
        <div className="flex justify-between items-center gap-3 mt-1">
          <CustomCyberButton
            variant="magenta"
            size="md"
            shape="rounded"
            leftIcon={<i className="sbi-trash text-sm mr-1" />}
            onClick={handleDelete}
            className="flex-1 py-2"
          >
            Delete
          </CustomCyberButton>

          <CustomCyberButton
            variant="cyan"
            size="md"
            shape="rounded"
            glow={true}
            leftIcon={<i className="sbi-save2 text-sm mr-1" />}
            onClick={handleSave}
            className="flex-1 py-2"
          >
            Save
          </CustomCyberButton>
        </div>
      </div>
    </div>
  );
};
