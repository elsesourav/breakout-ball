import React from 'react';
import { ChevronUp, Award } from 'lucide-react';
import { UpgradeDef } from '../../constants/upgrades';
import { soundManager } from '../../utils/audio';
import { CoreIcon } from '../CoreIcon';

interface UpgradeCardProps {
  upgrade: UpgradeDef;
  level: number;
  cores: number;
  cost: number;
  onUpgrade: (id: string) => void;
  icon?: React.ReactNode;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  level,
  cores,
  cost,
  onUpgrade,
  icon,
}) => {
  const isMax = level >= upgrade.maxLevel;
  const canAfford = !isMax && cores >= cost;

  const handleUpgradeClick = () => {
    if (!canAfford) return;
    soundManager.play('click');
    onUpgrade(upgrade.id);
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(8, 13, 38, 0.94)',
        border: `1.2px solid ${upgrade.accentColor}45`,
        boxShadow: `0 4px 18px rgba(0, 0, 0, 0.6), 0 0 12px ${upgrade.accentColor}12`,
        borderRadius: '16px',
      }}
      className="p-3 flex flex-col gap-2 relative overflow-hidden transition-all duration-200"
    >
      {/* Top Row: Symbol Icon + Name + Stat Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              backgroundColor: `${upgrade.accentColor}18`,
              border: `1.2px solid ${upgrade.accentColor}60`,
              boxShadow: `0 0 10px ${upgrade.glowColor}`,
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-tech font-black text-xs text-white shrink-0 overflow-hidden"
          >
            {icon ? icon : upgrade.symbol}
          </div>

          <div className="flex flex-col">
            <h4 className="font-display font-black text-xs text-white tracking-wide leading-tight">
              {upgrade.name}
            </h4>
            <span
              style={{ color: upgrade.accentColor }}
              className="font-tech text-[10px] font-bold"
            >
              {upgrade.statLabel(level)}
            </span>
          </div>
        </div>

        {/* Level Rank Badge */}
        <span
          style={{
            backgroundColor: isMax ? 'rgba(16, 185, 129, 0.2)' : `${upgrade.accentColor}18`,
            border: `1px solid ${isMax ? '#10b981' : upgrade.accentColor}60`,
            color: isMax ? '#10b981' : upgrade.accentColor,
          }}
          className="font-tech text-[10px] font-bold px-2 py-0.5 rounded-full"
        >
          {isMax ? 'MAX' : `${level}/${upgrade.maxLevel}`}
        </span>
      </div>

      {/* Segmented Dash Progress Bar with clean gaps */}
      <div
        style={{
          backgroundColor: 'rgba(5, 8, 24, 0.75)',
          border: `1px solid ${upgrade.accentColor}25`,
          borderRadius: '8px',
        }}
        className="flex items-center gap-1.5 w-full h-2 p-0.5 shadow-inner"
      >
        {Array.from({ length: upgrade.maxLevel }).map((_, i) => {
          const isFilled = i < level;
          const isMilestone = (i + 1) % 5 === 0;

          return (
            <div
              key={i}
              style={{
                backgroundColor: isFilled
                  ? isMilestone
                    ? '#fbbf24'
                    : upgrade.accentColor
                  : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isFilled
                  ? `0 0 6px ${isMilestone ? 'rgba(251,191,36,0.8)' : upgrade.glowColor}`
                  : 'none',
              }}
              className="flex-1 h-full rounded-xs transition-all duration-300"
            />
          );
        })}
      </div>

      {/* Action Footer: Next Stat & Upgrade Button (No horizontal divider line) */}
      <div className="flex items-center justify-between pt-1 mt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-tech text-[9px] text-slate-400 uppercase tracking-wider">
            {isMax ? 'PEAK' : 'NEXT:'}
          </span>
          <span className="font-tech text-[10px] text-emerald-400 font-bold">
            {isMax ? 'MAX OVERDRIVE' : upgrade.nextLabel(level)}
          </span>
        </div>

        {!isMax ? (
          <button
            type="button"
            disabled={!canAfford}
            onClick={handleUpgradeClick}
            style={{
              backgroundColor: canAfford ? upgrade.accentColor : 'rgba(10, 15, 36, 0.7)',
              border: `1.2px solid ${canAfford ? upgrade.accentColor : 'rgba(0, 247, 255, 0.15)'}`,
              color: canAfford ? '#000000' : '#64748b',
              boxShadow: canAfford ? `0 0 10px ${upgrade.glowColor}` : 'none',
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-tech font-bold text-xs transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
            <span>UPGRADE</span>
            <span className="text-[10px] opacity-90 font-mono inline-flex items-center gap-0.5">
              ({cost}
              <CoreIcon size={10} glow={false} variant="cyan" />)
            </span>
          </button>
        ) : (
          <span className="text-emerald-400 font-tech font-bold text-xs flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            MAXED
          </span>
        )}
      </div>
    </div>
  );
};
