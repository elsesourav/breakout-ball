import React from 'react';
import { ChevronUp, Award } from 'lucide-react';
import { UpgradeDef } from '../../constants/upgrades';
import { soundManager } from '../../utils/audio';

interface UpgradeCardProps {
  upgrade: UpgradeDef;
  level: number;
  cores: number;
  cost: number;
  onUpgrade: (id: string) => void;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  level,
  cores,
  cost,
  onUpgrade,
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
        backgroundColor: 'rgba(7, 12, 34, 0.92)',
        border: `1.5px solid ${upgrade.accentColor}35`,
        boxShadow: `0 4px 18px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08)`,
        borderRadius: '14px',
      }}
      className="p-3 flex flex-col gap-2 relative overflow-hidden transition-all duration-200"
    >
      {/* Top Row: Symbol Icon + Name + Stat Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            style={{
              backgroundColor: `${upgrade.accentColor}18`,
              border: `1.2px solid ${upgrade.accentColor}60`,
              boxShadow: `0 0 10px ${upgrade.glowColor}`,
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-tech font-black text-xs text-white"
          >
            {upgrade.symbol}
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
            backgroundColor: isMax ? 'rgba(16, 185, 129, 0.2)' : `${upgrade.accentColor}15`,
            border: `1px solid ${isMax ? '#10b981' : upgrade.accentColor}`,
            color: isMax ? '#10b981' : upgrade.accentColor,
          }}
          className="font-tech text-[10px] font-bold px-2 py-0.5 rounded-full"
        >
          {isMax ? 'MAX' : `${level}/${upgrade.maxLevel}`}
        </span>
      </div>

      {/* Segmented Dash Progress Bar with clean gaps */}
      <div className="flex items-center gap-1 w-full h-2 rounded bg-black/50 p-0.5 border border-white/5">
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
                  : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isFilled
                  ? `0 0 6px ${isMilestone ? 'rgba(251,191,36,0.8)' : upgrade.glowColor}`
                  : 'none',
              }}
              className="flex-1 h-full rounded-xs transition-all duration-300"
            />
          );
        })}
      </div>

      {/* Action Footer: Next Stat & Upgrade Button */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-0.5">
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
              backgroundColor: canAfford ? upgrade.accentColor : 'rgba(255, 255, 255, 0.06)',
              border: `1.5px solid ${canAfford ? upgrade.accentColor : 'rgba(255, 255, 255, 0.15)'}`,
              color: canAfford ? '#000000' : '#64748b',
              boxShadow: canAfford ? `0 0 10px ${upgrade.glowColor}` : 'none',
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-tech font-bold text-xs transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
            <span>UPGRADE</span>
            <span className="text-[10px] opacity-80 font-mono">({cost}⬡)</span>
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
