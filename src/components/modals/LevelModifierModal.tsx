import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LevelData } from '../../types/game';
import { drawLevelPreviewOnCanvas, generateLevelId } from '../../utils/helpers';
import { CANVAS_WIDTH } from '../../constants/game';
import { CustomCyberButton } from '../common/CustomCyberButton';
import { CustomCyberSwitch } from '../common/CustomCyberSwitch';
import { Pencil, Trash2, Check, CopyPlus, X } from 'lucide-react';
import { initDesignerForEditLevel } from '../designer';
import { cyberToast } from '../common/CyberToast';

export const LevelModifierModal: React.FC = () => {
  const {
    editingLevel,
    closeModifier,
    saveUserLevel,
    deleteUserLevel,
    showAlert,
    setScreen,
    userCreatedLevels,
    user,
  } = useGame();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [arenaName, setArenaName] = useState('');

  useEffect(() => {
    if (editingLevel) {
      setIsPublic(!!editingLevel.isPublic);
      setArenaName(editingLevel.name || `Core #${editingLevel.id}`);
      if (canvasRef.current) {
        drawLevelPreviewOnCanvas(canvasRef.current, editingLevel.blocks, 260, 260);
      }
    }
  }, [editingLevel]);

  if (!editingLevel) return null;

  const handleDelete = () => {
    showAlert({
      title: 'Delete Level',
      message: `Are you sure you want to delete arena "${arenaName}"? This action cannot be undone.`,
      btn1Text: 'Cancel',
      btn2Text: 'Delete',
      btn2Color: '#ff0844',
      onConfirm: () => {
        deleteUserLevel(editingLevel.id);
        cyberToast.info('Arena deleted.');
        closeModifier();
      },
    });
  };

  const handleEditInDesigner = () => {
    closeModifier();
    initDesignerForEditLevel(editingLevel);
    setScreen('designer');
  };

  const handleDuplicate = async () => {
    const base = (arenaName.trim() || editingLevel.name || 'Arena')
      .replace(/\s*\((?:Copy|V\d+|D\d+)[^)]*\)$/i, '')
      .trim();
    const existingSet = new Set(
      userCreatedLevels.map((l) => (l.name || '').trim().toLowerCase())
    );
    let candidate = `${base} (Copy)`;
    let count = 2;
    while (existingSet.has(candidate.toLowerCase())) {
      candidate = `${base} (Copy ${count})`;
      count++;
    }
    const duplicate: LevelData = {
      id: generateLevelId(),
      name: candidate,
      creator: user.username,
      playCount: 0,
      blocks: JSON.parse(JSON.stringify(editingLevel.blocks)),
      isPublic: false,
      createdAt: Date.now(),
    };
    await saveUserLevel(duplicate);
    cyberToast.success(`Arena duplicated as "${candidate}"!`);
    closeModifier();
  };

  const handleSave = async () => {
    const trimmed = arenaName.trim() || editingLevel.name || `Core #${editingLevel.id}`;
    await saveUserLevel({
      ...editingLevel,
      name: trimmed,
      isPublic,
    });
    cyberToast.success('Arena settings saved!');
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

        {/* Level Name Input Field */}
        <div className="flex flex-col gap-1 w-full px-1">
          <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
            ARENA NAME
          </label>
          <input
            type="text"
            value={arenaName}
            maxLength={28}
            onChange={(e) => setArenaName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 font-display font-bold text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,247,255,0.4)]"
            placeholder="Arena Name"
          />
        </div>

        <div className="lvl-details">
          <div className="flex selected-lvl">
            <span>ID</span>
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

        {/* Edit and Duplicate Action Row */}
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={handleEditInDesigner}
            style={{
              backgroundColor: 'rgba(0, 247, 255, 0.12)',
              border: '1.5px solid rgba(0, 247, 255, 0.5)',
              boxShadow: '0 0 12px rgba(0, 247, 255, 0.25)',
            }}
            className="flex-1 py-2.5 rounded-xl font-display font-black text-xs text-cyan-300 hover:text-white hover:bg-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1.5px solid rgba(99, 102, 241, 0.5)',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.25)',
            }}
            className="flex-1 py-2.5 rounded-xl font-display font-black text-xs text-indigo-300 hover:text-white hover:bg-indigo-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CopyPlus className="w-3.5 h-3.5" />
            <span>DUPLICATE</span>
          </button>
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
