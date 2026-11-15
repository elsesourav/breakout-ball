import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Award, Sparkles } from 'lucide-react';
import { UpgradeDef, getCostBetweenLevels } from '../../constants/upgrades';
import { CoreIcon } from '../CoreIcon';
import { soundManager } from '../../utils/audio';
import { UpgradePreviewCanvas } from './previews/UpgradePreviewCanvas';
import { AssetThumbnail } from './AssetThumbnail';

interface UpgradePreviewModalProps {
  isOpen: boolean;
  upgrade: UpgradeDef | null;
  currentLevel: number;
  cores: number;
  onClose: () => void;
  onUpgrade: (id: string, targetLevel?: number) => void;
  currentSkin?: string;
}

export const UpgradePreviewModal: React.FC<UpgradePreviewModalProps> = ({
  isOpen,
  upgrade,
  currentLevel,
  cores,
  onClose,
  onUpgrade,
}) => {
  const [previewLevel, setPreviewLevel] = useState<number>(currentLevel);

  // Automatically reset to the user's actual current level when opening or when upgrade changes
  useEffect(() => {
    setPreviewLevel(currentLevel);
  }, [isOpen, upgrade?.id, currentLevel]);

  if (!isOpen || !upgrade) return null;

  const isMax = currentLevel >= upgrade.maxLevel;
  const isPreviewMax = previewLevel >= upgrade.maxLevel;
  const nextPreviewLevel = previewLevel + 1;

  // Determine target level based on preview navigation (supports 1-step or multi-level bulk upgrade)
  const targetLevel = previewLevel > currentLevel
    ? previewLevel
    : Math.min(upgrade.maxLevel, currentLevel + 1);

  const levelsToGain = targetLevel - currentLevel;
  const upgradeCost = isMax
    ? 0
    : getCostBetweenLevels(upgrade.baseCost, currentLevel, targetLevel);

  const canAfford = !isMax && cores >= upgradeCost;

  const handleUpgradeNow = () => {
    if (!canAfford) {
      soundManager.playInsufficientFunds();
      return;
    }
    soundManager.playUpgradeSuccess();
    onUpgrade(upgrade.id, targetLevel);
    setPreviewLevel(targetLevel);
  };

  const handleClose = () => {
    soundManager.playClick('close');
    setPreviewLevel(currentLevel);
    onClose();
  };

  let actionLabel = 'UPGRADE NOW';
  if (targetLevel === upgrade.maxLevel && levelsToGain > 1) {
    actionLabel = `MAX ALL (+${levelsToGain} LVLS)`;
  } else if (levelsToGain > 1) {
    actionLabel = `UPGRADE TO LVL ${targetLevel} (+${levelsToGain} LVLS)`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            backgroundColor: 'rgba(7, 12, 34, 0.96)',
            border: `1.5px solid ${upgrade.accentColor}60`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 25px ${upgrade.glowColor}`,
          }}
          className="w-full max-w-[356px] sm:max-w-[420px] rounded-2xl flex flex-col overflow-hidden relative mx-auto"
        >
          {/* Header with Real In-Game Asset Thumbnail (No Text Icons) */}
          <div className="p-4 pb-3 flex items-center justify-between border-b border-cyan-500/20 bg-black/40">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  backgroundColor: `${upgrade.accentColor}18`,
                  border: `1px solid ${upgrade.accentColor}70`,
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 overflow-hidden"
              >
                <AssetThumbnail upgradeId={upgrade.id} level={previewLevel} size={28} />
              </div>
              <div className="flex flex-col">
                <span className="font-tech text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                  KINETIC SPECIFICATION
                </span>
                <h3 className="font-display font-black text-sm text-white tracking-wide">
                  {upgrade.name}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Level Progress Indicator & Stepper (No Reset Button) */}
          <div className="px-4 pt-3 flex items-center justify-between font-tech text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[11px]">STATUS:</span>
              <span className="font-bold text-cyan-200">
                LEVEL {currentLevel}/{upgrade.maxLevel}
              </span>
            </div>

            {/* Stepper to preview previous and next levels */}
            <div className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              <button
                type="button"
                disabled={previewLevel <= 1}
                onClick={() => {
                  soundManager.playClick('cyber');
                  setPreviewLevel((prev) => Math.max(1, prev - 1));
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-cyan-300 hover:text-white hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Preview Previous Level"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-tech font-bold text-[10px] text-cyan-200 min-w-[64px] text-center">
                PREVIEW {previewLevel}
              </span>
              <button
                type="button"
                disabled={previewLevel >= upgrade.maxLevel}
                onClick={() => {
                  soundManager.playClick('cyber');
                  setPreviewLevel((prev) => Math.min(upgrade.maxLevel, prev + 1));
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-cyan-300 hover:text-white hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Preview Next Level"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Side-by-Side Headings */}
          <div className="px-4 pt-2.5 grid grid-cols-2 gap-2 text-center font-tech text-[11px] font-bold">
            <div className="py-1 px-2 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300">
              CURRENT (LVL {previewLevel})
            </div>
            <div className="py-1 px-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>UPGRADED ({isPreviewMax ? 'PEAK' : `LVL ${nextPreviewLevel}`})</span>
            </div>
          </div>

          {/* Canvas Live Comparison View (Continuous Looping Preview) */}
          <div className="p-4 pt-2">
            <UpgradePreviewCanvas
              upgrade={upgrade}
              currentLevel={previewLevel}
              isMax={isPreviewMax}
            />
          </div>

          {/* Stat Delta Difference Banner */}
          <div className="px-4 pb-2">
            <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-500/25 flex items-center justify-between text-xs font-tech">
              <span className="text-slate-300 font-bold text-[11px]">
                {upgrade.statLabel(previewLevel)}
              </span>
              {!isPreviewMax ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shrink-0 ml-2">
                  NEXT: {upgrade.nextLabel(previewLevel)}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shrink-0 ml-2">
                  MAX LEVEL
                </span>
              )}
            </div>
          </div>

          {/* Modal Footer: Action Button dynamically calculating total cost to target level */}
          <div className="p-4 pt-3 border-t border-cyan-500/20 bg-black/40 flex items-center justify-center">
            {!isMax ? (
              <button
                type="button"
                disabled={!canAfford}
                onClick={handleUpgradeNow}
                style={{
                  background: canAfford
                    ? `linear-gradient(135deg, ${upgrade.accentColor} 0%, #00f7ff 100%)`
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                  border: canAfford
                    ? `1.5px solid ${upgrade.accentColor}`
                    : '1.5px solid rgba(148, 163, 184, 0.45)',
                  boxShadow: canAfford
                    ? `0 0 16px ${upgrade.glowColor}`
                    : '0 2px 10px rgba(0, 0, 0, 0.6)',
                }}
                className="w-full py-2.5 px-4 rounded-xl font-tech font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed"
              >
                <span className={canAfford ? 'text-black font-black' : 'text-slate-100 font-bold tracking-wide'}>
                  {actionLabel}
                </span>
                <span
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] ${
                    canAfford
                      ? 'bg-black/30 text-black border border-black/30 font-black'
                      : 'bg-black/80 text-cyan-200 border border-cyan-400/50 font-bold'
                  }`}
                >
                  <span>{upgradeCost.toLocaleString()}</span>
                  <CoreIcon size={12} glow variant="cyan" />
                </span>
              </button>
            ) : (
              <span className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-tech font-bold text-xs flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                MAX LEVEL REACHED
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
