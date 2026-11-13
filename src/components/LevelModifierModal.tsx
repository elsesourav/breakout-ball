import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { drawLevelPreviewOnCanvas } from '../utils/helpers';
import { CANVAS_WIDTH } from '../constants/game';

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
    <div id="levelModifier" className="active">
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
            <span>Visibility</span>
            <p id="M_lvlRank">{isPublic ? 'Public' : 'Private'}</p>
          </div>
          <div className="flex time">
            <span className="sbi-play-circle" />
            <p id="M_playCount">{editingLevel.playCount || 0}</p>
          </div>
        </div>

        <div className="switch-button">
          <input
            className="switch-button-checkbox"
            type="checkbox"
            name="privacy"
            id="privacyModifier"
            checked={!isPublic}
            onChange={(e) => setIsPublic(!e.target.checked)}
          />
          <label className="switch-button-label" htmlFor="privacyModifier">
            <span className="switch-button-label-span">Private</span>
          </label>
        </div>

        <div className="buttons">
          <button className="btn" id="deleteLevel" onClick={handleDelete} title="Delete Level">
            <i className="sbi-trash" />
          </button>
          <button className="btn" id="saveModifier" onClick={handleSave} title="Save Changes">
            <i className="sbi-save2" />
          </button>
        </div>
      </div>
    </div>
  );
};
