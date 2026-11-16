import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { LevelData } from '../../types/game';
import { drawLevelPreviewOnCanvas, calculateLevelHp, generateLevelId } from '../../utils/helpers';
import { Plus, Settings2, Play, EyeOff, Pencil, CopyPlus, X, Check, AlertCircle, Lock } from 'lucide-react';
import { StudioMatrixForgeIcon } from '../navigation/NavIcons';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';
import { initDesignerForNewLevel, initDesignerForEditLevel } from '../designer';
import { authService } from '../../services/auth';
import { cyberToast } from '../common/CyberToast';

function getUniqueDuplicateName(originalName: string, existingLevels: LevelData[]): string {
  const base = originalName.replace(/\s*\((?:Copy|V\d+|D\d+)[^)]*\)$/i, '').trim() || 'Arena';
  const existingSet = new Set(
    existingLevels.map((l) => (l.name || '').trim().toLowerCase())
  );
  let candidate = `${base} (Copy)`;
  let count = 2;
  while (existingSet.has(candidate.toLowerCase())) {
    candidate = `${base} (Copy ${count})`;
    count++;
  }
  return candidate;
}

export const StudioView: React.FC = () => {
  const {
    userCreatedLevels,
    openPreview,
    openModifier,
    setActiveTab,
    setScreen,
    saveUserLevel,
    user,
  } = useGame();

  const [copyTargetLevel, setCopyTargetLevel] = useState<LevelData | null>(null);
  const [duplicateName, setDuplicateName] = useState('');

  const handleDesignNew = () => {
    initDesignerForNewLevel();
    setScreen('designer');
  };

  const handleEditLevel = (lvl: LevelData) => {
    if (lvl.isPublic) {
      cyberToast.info('Published arenas are locked. Duplicate this arena to create an editable draft.');
      handleOpenDuplicateModal(lvl);
      return;
    }
    initDesignerForEditLevel(lvl);
    setScreen('designer');
  };

  const handleOpenDuplicateModal = (lvl: LevelData) => {
    setCopyTargetLevel(lvl);
    const suggested = getUniqueDuplicateName(lvl.name || 'Arena', userCreatedLevels);
    setDuplicateName(suggested);
  };

  // Real-time validation for unique duplicate name
  const trimmed = duplicateName.trim();
  const sourceName = (copyTargetLevel?.name || '').trim();
  const isEmpty = trimmed.length === 0;
  const isSameAsOriginal = Boolean(
    copyTargetLevel && trimmed.toLowerCase() === sourceName.toLowerCase()
  );
  const isAlreadyTaken = userCreatedLevels.some(
    (l) => (l.name || '').trim().toLowerCase() === trimmed.toLowerCase()
  );

  const isValidUniqueName = !isEmpty && !isSameAsOriginal && !isAlreadyTaken;

  const validationError = useMemo(() => {
    if (isEmpty) return 'Arena name cannot be empty';
    if (isSameAsOriginal) return 'Must be a different name from original arena';
    if (isAlreadyTaken) return 'Name already exists. Must put a unique name';
    return null;
  }, [isEmpty, isSameAsOriginal, isAlreadyTaken]);

  const handleConfirmDuplicate = async () => {
    if (!copyTargetLevel) return;
    if (!isValidUniqueName) {
      cyberToast.error(validationError || 'Please enter a valid unique name.');
      return;
    }
    const duplicate: LevelData = {
      id: generateLevelId(),
      name: trimmed,
      creator: user.username,
      creatorId: user.id || authService.getEffectiveUserId(),
      playCount: 0,
      blocks: JSON.parse(JSON.stringify(copyTargetLevel.blocks)),
      isPublic: false,
      createdAt: Date.now(),
    };
    setCopyTargetLevel(null);
    initDesignerForEditLevel(duplicate);
    setScreen('designer');
    cyberToast.success(`Arena duplicated as "${trimmed}". Opened in Level Designer!`);
    await saveUserLevel(duplicate);
  };

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 py-4 gap-3.5 pb-10 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* Studio Header Bar */}
      <div className="w-full max-w-sm -mt-4 -mx-3.5 mb-2">
        <PageHeaderWithBack
          title="ARENA STUDIO"
          subtitle={`${userCreatedLevels.length} CUSTOM ARENAS`}
          onBack={() => setActiveTab('local')}
          showCores={false}
        />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-2">
        <p className="text-xs text-slate-400 font-ui text-center">
          Design, test, and publish custom Breakout arenas for the community.
        </p>

        {/* Primary CTA: Design New Arena */}
        <button
          type="button"
          onClick={handleDesignNew}
          style={{
            borderRadius: '12px',
            backgroundColor: '#00e5ff',
            backgroundImage: 'linear-gradient(135deg, #00f7ff 0%, #6366f1 100%)',
            boxShadow: '0 0 20px rgba(0, 247, 255, 0.45)',
            border: '1.5px solid #a5f3fc',
          }}
          className="w-full h-11 flex items-center justify-center gap-2 font-display font-black text-xs tracking-wider text-black active:scale-[0.98] transition-all cursor-pointer mt-1"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>DESIGN NEW ARENA</span>
        </button>
      </div>

      {/* Level Designs Grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3 mt-1">
        {userCreatedLevels.map((lvl) => (
          <StudioLevelCard
            key={lvl.id}
            level={lvl}
            onSelect={() => openPreview(lvl)}
            onEdit={() => handleEditLevel(lvl)}
            onDuplicate={() => handleOpenDuplicateModal(lvl)}
            onSettings={() => openModifier(lvl)}
          />
        ))}
      </div>

      {/* Clean Empty State */}
      {userCreatedLevels.length === 0 && (
        <div className="w-full max-w-sm rounded-2xl bg-[#090d24]/90 border border-white/10 p-6 flex flex-col items-center text-center gap-3 shadow-lg backdrop-blur-xl mt-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/35 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,247,255,0.25)] relative">
            <StudioMatrixForgeIcon className="w-11 h-11" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-display font-bold text-sm text-white tracking-wide">
              NO CUSTOM ARENAS YET
            </h3>
            <p className="font-ui text-xs text-slate-400 leading-relaxed max-w-[240px]">
              Tap "DESIGN NEW ARENA" to forge custom brick layouts, hit-points, and challenges!
            </p>
          </div>
        </div>
      )}

      {/* Duplicate Level Modal */}
      {copyTargetLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div
            style={{
              backgroundColor: 'rgba(7, 11, 28, 0.98)',
              border: '1.5px solid rgba(0, 247, 255, 0.45)',
              boxShadow: '0 0 35px rgba(0, 247, 255, 0.25)',
            }}
            className="w-full max-w-sm rounded-2xl flex flex-col gap-3.5 p-5 text-slate-200"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <CopyPlus className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-black text-sm text-[#00f7ff] tracking-wider">
                  DUPLICATE ARENA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCopyTargetLevel(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-tech text-xs text-slate-300">
              Duplicating <span className="text-cyan-300 font-bold">"{sourceName || 'Arena'}"</span>. Put a new unique name:
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="font-tech text-xs font-bold text-slate-300 tracking-wider">
                NEW UNIQUE ARENA NAME
              </label>
              <input
                type="text"
                autoFocus
                value={duplicateName}
                maxLength={28}
                onChange={(e) => setDuplicateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidUniqueName) handleConfirmDuplicate();
                }}
                style={{
                  borderColor: validationError ? '#f43f5e' : isValidUniqueName ? '#10b981' : 'rgba(0, 247, 255, 0.4)',
                }}
                className="w-full px-3 py-2 rounded-xl bg-cyan-950/40 border text-cyan-200 font-display font-bold text-sm focus:outline-none focus:shadow-[0_0_12px_rgba(0,247,255,0.4)] transition-colors"
                placeholder="Unique Arena Name"
              />

              {/* Real-time Validation Message */}
              <div className="flex items-center justify-between text-[11px] font-tech min-h-[18px]">
                {validationError ? (
                  <span className="text-rose-400 flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{validationError}</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <Check className="w-3 h-3 flex-shrink-0" />
                    <span>Unique name verified</span>
                  </span>
                )}
                <span className="text-slate-400 self-end ml-auto">
                  {duplicateName.length}/28
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => setCopyTargetLevel(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/15 bg-white/5 font-display font-bold text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={!isValidUniqueName}
                onClick={handleConfirmDuplicate}
                style={{
                  backgroundColor: isValidUniqueName ? '#00f7ff' : '#0f172a',
                  color: isValidUniqueName ? '#000000' : '#475569',
                  boxShadow: isValidUniqueName ? '0 0 16px rgba(0, 247, 255, 0.5)' : 'none',
                  cursor: isValidUniqueName ? 'pointer' : 'not-allowed',
                }}
                className="flex-1 py-2.5 rounded-xl font-display font-black text-xs tracking-wider transition-all active:scale-98 flex items-center justify-center gap-1.5"
              >
                <CopyPlus className="w-4 h-4 stroke-[2.5]" />
                <span>DUPLICATE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudioLevelCard: React.FC<{
  level: LevelData;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onSettings: () => void;
}> = ({ level, onSelect, onEdit, onDuplicate, onSettings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = canvas.clientWidth || 150;
      const displayH = canvas.clientHeight || 105;
      canvas.width = Math.round(displayW * dpr);
      canvas.height = Math.round(displayH * dpr);
      drawLevelPreviewOnCanvas(canvas, level.blocks, canvas.width, canvas.height);
    }
  }, [level]);

  const stats = calculateLevelHp(level.blocks);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'rgba(8, 13, 36, 0.94)',
        border: isHovered
          ? '1.5px solid #00f7ff'
          : '1.5px solid rgba(0, 247, 255, 0.22)',
        boxShadow: isHovered
          ? '0 0 18px rgba(0, 247, 255, 0.35), inset 0 0 10px rgba(0, 247, 255, 0.08)'
          : '0 4px 12px rgba(0, 0, 0, 0.4)',
        borderRadius: '14px',
      }}
      className="relative flex flex-col overflow-hidden active:scale-[0.98] transition-all duration-200 cursor-pointer group"
    >
      {/* Visibility Badge */}
      <div className="absolute top-2 right-2 z-10">
        <span
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-tech font-bold uppercase tracking-wider ${
            level.isPublic
              ? 'bg-emerald-950/85 border border-emerald-500/60 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              : 'bg-amber-950/85 border border-amber-500/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
          }`}
        >
          {level.isPublic ? (
            <>
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span>PUB • LOCKED</span>
            </>
          ) : (
            <>
              <EyeOff className="w-2.5 h-2.5 text-amber-400" />
              <span>DRAFT</span>
            </>
          )}
        </span>
      </div>

      {/* HiDPI Canvas Preview */}
      <div className="w-full h-26 bg-[#040614] relative overflow-hidden border-b border-cyan-500/20">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '104px' }}
        />
        {/* Subtle Cyber Grid Lines inside preview */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 247, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 247, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      </div>

      {/* Details Bar */}
      <div className="p-2 flex flex-col gap-1 min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <span className="font-tech font-black text-xs text-cyan-300 truncate min-w-0 flex-1 mr-1">
            {level.name || `Core #${level.id}`}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {level.isPublic ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded-md bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 transition-colors cursor-pointer"
                title="Published & Locked. Duplicate to edit."
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                title="Edit Draft in Designer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Duplicate Arena"
            >
              <CopyPlus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSettings();
              }}
              className="p-1 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Settings & Delete"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-tech text-slate-400 border-t border-white/10 pt-1">
          <span className="flex items-center gap-1 text-slate-300">
            <Play className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span>{level.playCount || 0}</span>
          </span>
          <span className="text-cyan-400 font-tech font-bold text-[9px]">
            {stats.totalHp} HP ({stats.breakableCount})
          </span>
        </div>
      </div>
    </div>
  );
};

export const CreateMode = StudioView;
