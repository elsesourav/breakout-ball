import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { LevelData } from '../../types/game';
import { drawLevelPreviewOnCanvas, generateLevelId } from '../../utils/helpers';
import { CANVAS_WIDTH } from '../../constants/game';
import { CustomCyberButton } from '../common/CustomCyberButton';
import { CustomCyberSwitch } from '../common/CustomCyberSwitch';
import { Pencil, Trash2, Check, CopyPlus, X, Lock } from 'lucide-react';
import { initDesignerForEditLevel } from '../designer';
import { authService } from '../../services/auth';
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

  const isPublicLevel = Boolean(editingLevel.isPublic);

  const handleDelete = () => {
    showAlert({
      title: isPublicLevel ? 'DELETE PUBLIC ARENA?' : 'DELETE DRAFT ARENA',
      message: isPublicLevel
        ? `⚠️ WARNING: Arena "${arenaName}" is currently published on the Community Arena. Deleting it will permanently remove it and all community play records. Are you sure you want to delete this public arena?`
        : `Are you sure you want to delete draft arena "${arenaName}"? This action cannot be undone.`,
      btn1Text: 'CANCEL',
      btn2Text: isPublicLevel ? 'CONFIRM DELETE' : 'DELETE',
      btn2Color: '#ff0844',
      onConfirm: () => {
        deleteUserLevel(editingLevel.id);
        cyberToast.info(isPublicLevel ? `Public arena "${arenaName}" deleted.` : `Draft arena "${arenaName}" deleted.`);
        closeModifier();
      },
    });
  };

  const handleEditInDesigner = () => {
    if (isPublicLevel) {
      cyberToast.info('Published arenas are locked. Duplicating to create an editable draft...');
      handleDuplicate();
      return;
    }
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
      creatorId: user.id || authService.getEffectiveUserId(),
      playCount: 0,
      blocks: JSON.parse(JSON.stringify(editingLevel.blocks)),
      isPublic: false,
      createdAt: Date.now(),
    };
    closeModifier();
    initDesignerForEditLevel(duplicate);
    setScreen('designer');
    cyberToast.success(`Arena duplicated as "${candidate}". Opened in Level Designer!`);
    await saveUserLevel(duplicate);
  };

  const handleSave = async () => {
    if (isPublicLevel) {
      closeModifier();
      return;
    }
    const trimmed = arenaName.trim() || editingLevel.name || `Core #${editingLevel.id}`;
    if (isPublic) {
      showAlert({
        title: 'PUBLISH ARENA TO COMMUNITY?',
        message: `Once published as Public, "${trimmed}" will be permanently locked from future edits and renaming. Continue?`,
        btn1Text: 'CANCEL',
        btn2Text: 'PUBLISH & LOCK',
        btn2Color: '#00f7ff',
        onConfirm: async () => {
          await saveUserLevel({
            ...editingLevel,
            name: trimmed,
            isPublic: true,
          });
          cyberToast.success(`Arena "${trimmed}" published and locked!`);
          closeModifier();
        },
      });
      return;
    }

    await saveUserLevel({
      ...editingLevel,
      name: trimmed,
      isPublic: false,
    });
    cyberToast.success('Draft arena updated!');
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
          <div className="flex items-center justify-between">
            <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
              ARENA NAME
            </label>
            {isPublicLevel && (
              <span className="text-[10px] text-amber-400 font-tech font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> LOCKED (PUBLISHED)
              </span>
            )}
          </div>
          <input
            type="text"
            value={arenaName}
            disabled={isPublicLevel}
            maxLength={28}
            onChange={(e) => setArenaName(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl bg-cyan-950/40 border text-cyan-200 font-display font-bold text-sm focus:outline-none transition-colors ${
              isPublicLevel
                ? 'opacity-65 cursor-not-allowed border-amber-500/40 text-slate-300'
                : 'border-cyan-500/40 focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,247,255,0.4)]'
            }`}
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
          {isPublicLevel ? (
            <button
              type="button"
              onClick={handleDuplicate}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1.5px solid rgba(245, 158, 11, 0.5)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.25)',
              }}
              className="flex-1 py-2.5 rounded-xl font-display font-black text-xs text-amber-300 hover:text-white hover:bg-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>DUPLICATE TO EDIT</span>
            </button>
          ) : (
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
              <span>EDIT DRAFT</span>
            </button>
          )}
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

        {/* Privacy Setting */}
        {isPublicLevel ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 w-full">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMMUNITY ARENA</span>
            </div>
            <span className="text-[10px] font-tech font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-400/40">
              PUBLISHED & LOCKED
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/40 border border-white/10 w-full">
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
        )}

        {isPublicLevel && (
          <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] font-tech text-amber-200/90 leading-tight w-full text-center">
            🔒 Published arenas cannot be modified. Duplicate to forge an editable draft.
          </div>
        )}

        {/* Action Buttons using CustomCyberButton */}
        <div className="flex justify-between items-center gap-3 mt-1 w-full">
          <CustomCyberButton
            variant="magenta"
            size="md"
            shape="rounded"
            leftIcon={<i className="sbi-trash text-sm mr-1" />}
            onClick={handleDelete}
            className="flex-1 py-2"
          >
            {isPublicLevel ? 'Delete Public Arena' : 'Delete'}
          </CustomCyberButton>

          {!isPublicLevel && (
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
          )}
        </div>
      </div>
    </div>
  );
};
