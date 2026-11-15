import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Award, Sparkles } from 'lucide-react';
import { UpgradeDef, getUpgradeCost } from '../../constants/upgrades';
import { CoreIcon } from '../CoreIcon';
import { soundManager } from '../../utils/audio';
import { UpgradePreviewCanvas } from './previews/UpgradePreviewCanvas';

interface UpgradePreviewModalProps {
  isOpen: boolean;
  upgrade: UpgradeDef | null;
  currentLevel: number;
  cores: number;
  onClose: () => void;
  onUpgrade: (id: string) => void;
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
  if (!isOpen || !upgrade) return null;

  const isMax = currentLevel >= upgrade.maxLevel;
  const nextLevel = currentLevel + 1;
  const cost = getUpgradeCost(upgrade.baseCost, currentLevel);
  const canAfford = !isMax && cores >= cost;

  const handleUpgradeNow = () => {
    if (!canAfford) {
      soundManager.playInsufficientFunds();
      return;
    }
    soundManager.playUpgradeSuccess();
    onUpgrade(upgrade.id);
  };

  const handleClose = () => {
    soundManager.playClick('close');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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
          className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 pb-3 flex items-center justify-between border-b border-cyan-500/20 bg-black/40">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  backgroundColor: `${upgrade.accentColor}20`,
                  border: `1px solid ${upgrade.accentColor}`,
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-tech font-black text-xs"
              >
                {upgrade.symbol}
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

          {/* Level Progress Indicator */}
          <div className="px-4 pt-3 flex items-center justify-between font-tech text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[11px]">STATUS:</span>
              <span className="font-bold text-cyan-200">
                LEVEL {currentLevel}/{upgrade.maxLevel}
              </span>
            </div>
            {!isMax && (
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <span>NEXT: LVL {nextLevel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Side-by-Side Headings */}
          <div className="px-4 pt-2.5 grid grid-cols-2 gap-2 text-center font-tech text-[11px] font-bold">
            <div className="py-1 px-2 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300">
              CURRENT (LVL {currentLevel})
            </div>
            <div className="py-1 px-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>UPGRADED ({isMax ? 'PEAK' : `LVL ${nextLevel}`})</span>
            </div>
          </div>

          {/* Canvas Live Comparison View (Continuous Looping Preview from /previews) */}
          <div className="p-4 pt-2">
            <UpgradePreviewCanvas
              upgrade={upgrade}
              currentLevel={currentLevel}
              isMax={isMax}
            />
          </div>

          {/* Stat Delta Difference Banner */}
          <div className="px-4 pb-2">
            <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-500/25 flex items-center justify-between text-xs font-tech">
              <span className="text-slate-300 font-bold text-[11px]">
                {upgrade.statLabel(currentLevel)}
              </span>
              {!isMax ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shrink-0 ml-2">
                  NEXT: {upgrade.nextLabel(currentLevel)}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shrink-0 ml-2">
                  MAX LEVEL
                </span>
              )}
            </div>
          </div>

          {/* Modal Footer: Balance + Instant Upgrade Confirmation */}
          <div className="p-4 pt-3 border-t border-cyan-500/20 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-tech text-xs">
              <CoreIcon size={14} glow variant="cyan" />
              <span className="text-slate-400 text-[11px]">CORES:</span>
              <span className="font-bold text-cyan-200">{cores.toLocaleString()}</span>
            </div>

            {!isMax ? (
              <button
                type="button"
                disabled={!canAfford}
                onClick={handleUpgradeNow}
                style={{
                  background: canAfford
                    ? `linear-gradient(135deg, ${upgrade.accentColor} 0%, #00f7ff 100%)`
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: canAfford
                    ? `1.5px solid ${upgrade.accentColor}`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  color: canAfford ? '#000000' : '#64748b',
                  boxShadow: canAfford ? `0 0 16px ${upgrade.glowColor}` : 'none',
                }}
                className="px-4 py-2 rounded-xl font-tech font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>UPGRADE NOW</span>
                <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-[10px] text-white">
                  {cost} 💎
                </span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-tech font-bold text-xs flex items-center gap-1.5">
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
