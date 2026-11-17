import React from 'react';
import { ChevronUp, Award } from 'lucide-react';
import { UpgradeDef } from '../../constants/upgrades';
import { soundManager } from '../../audio';
import { CoreIcon } from '../common/CoreIcon';
import { AssetThumbnail } from './AssetThumbnail';

interface UpgradeCardProps {
  upgrade: UpgradeDef;
  level: number;
  cores: number;
  cost: number;
  onUpgrade: (id: string) => void;
  onSelect?: (upgrade: UpgradeDef) => void;
  icon?: React.ReactNode;
}

function getStatBreakdown(upgrade: UpgradeDef, level: number): {
  statName: string;
  current: string;
  delta: string | null;
} {
  switch (upgrade.id) {
    case 'ball_speed':
      return {
        statName: 'VELOCITY',
        current: `${((level - 1) * 3.5).toFixed(1)}%`,
        delta: '+3.5%',
      };
    case 'ball_size':
      return {
        statName: 'RADIUS',
        current: `${(level - 1) * 5}%`,
        delta: '+5%',
      };
    case 'ball_impact':
      return {
        statName: 'IMPACT',
        current: `${(level - 1) * 12}%`,
        delta: '+12%',
      };
    case 'ball_trajectory':
      return {
        statName: 'RANGE',
        current: `${Math.round(600 + (level - 1) * (1200 / 7))}px`,
        delta: '+171px',
      };
    case 'paddle_width':
      return {
        statName: 'WIDTH',
        current: `${(level - 1) * 8}%`,
        delta: '+8%',
      };
    case 'paddle_speed':
      return {
        statName: 'THRUST SPEED',
        current: level >= 8 ? 'MAX BOOSTER' : `${Math.round(800 + (level - 1) * (800 / 7))} px/s`,
        delta: level >= 8 ? null : level >= 7 ? 'MAX BOOSTER' : '+114 px/s',
      };
    case 'expand_power':
      return {
        statName: 'DURATION',
        current: `${(6.0 + (level - 1) * 0.8).toFixed(1)}s`,
        delta: '0.8s',
      };
    case 'slowmo_power':
      return {
        statName: 'DURATION',
        current: `${(4.0 + (level - 1) * 0.75).toFixed(1)}s`,
        delta: '0.8s',
      };
    case 'laser_power':
      return {
        statName: 'DURATION',
        current: `${(5.0 + (level - 1) * 1.0).toFixed(1)}s`,
        delta: '1.0s',
      };
    case 'mega_power':
      return {
        statName: 'DURATION',
        current: `${(5.0 + (level - 1) * 1.2).toFixed(1)}s`,
        delta: '1.2s',
      };
    case 'multi_power':
      return {
        statName: 'DURATION',
        current: `${(6.0 + (level - 1) * 1.5).toFixed(1)}s`,
        delta: '1.5s',
      };
    case 'shield_power':
      return {
        statName: 'DURATION',
        current: `${(16.0 + (level - 1) * (32.0 / 3)).toFixed(1)}s`,
        delta: '10.7s',
      };
    case 'ball_fancy':
      return {
        statName: 'AURA PARTICLES',
        current:
          level === 1
            ? 'DORMANT'
            : level === 2
            ? '4 CYAN'
            : level === 3
            ? '7 GOLD'
            : level === 4
            ? '10 MAGENTA'
            : '14 PRISMATIC',
        delta:
          level >= 5
            ? null
            : level === 1
            ? '4 CYAN'
            : level === 2
            ? '7 GOLD'
            : level === 3
            ? '10 MAGENTA'
            : '14 PRISMATIC',
      };
    case 'paddle_fancy':
      return {
        statName: 'CHASSIS AURA',
        current:
          level === 1
            ? 'OFF'
            : level === 2
            ? 'CYAN HALO'
            : level === 3
            ? 'INDIGO FIELD'
            : level === 4
            ? 'WARP PULSE'
            : 'SOLAR CORONA',
        delta:
          level >= 5
            ? null
            : level === 1
            ? 'CYAN HALO'
            : level === 2
            ? 'INDIGO FIELD'
            : level === 3
            ? 'WARP PULSE'
            : 'SOLAR CORONA',
      };
    default:
      return {
        statName: 'LEVEL',
        current: `${level}`,
        delta: null,
      };
  }
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({
  upgrade,
  level,
  cores,
  cost,
  onUpgrade,
  onSelect,
  icon,
}) => {
  const isMax = level >= upgrade.maxLevel;
  const canAfford = !isMax && cores >= cost;
  const statBreakdown = getStatBreakdown(upgrade, level);

  const handleCardClick = () => {
    soundManager.playClick('cyber');
    if (onSelect) {
      onSelect(upgrade);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: 'rgba(8, 13, 38, 0.94)',
        border: `1.2px solid ${upgrade.accentColor}45`,
        boxShadow: `0 4px 18px rgba(0, 0, 0, 0.6), 0 0 12px ${upgrade.accentColor}12`,
        borderRadius: '16px',
      }}
      className="p-3 flex flex-col gap-2 relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-cyan-400/50 hover:shadow-[0_4px_22px_rgba(0,247,255,0.2)] active:scale-[0.99] group"
    >
      {/* Top Row: Symbol Icon + Name + Stat Breakdown (+ green boost) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              backgroundColor: `${upgrade.accentColor}18`,
              border: `1px solid ${upgrade.accentColor}60`,
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-tech font-black text-xs text-white shrink-0 overflow-hidden"
          >
            {icon ? icon : <AssetThumbnail upgradeId={upgrade.id} level={level} size={28} />}
          </div>

          <div className="flex flex-col">
            <h4 className="font-display font-black text-xs text-white tracking-wide leading-tight">
              {upgrade.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-tech text-[10px] text-slate-400 font-semibold uppercase">
                {statBreakdown.statName}:
              </span>
              <span className="font-tech text-[11px] font-bold text-slate-100">
                {statBreakdown.current}
              </span>
              {!isMax && statBreakdown.delta ? (
                <span
                  className="font-tech text-[10px] font-bold text-emerald-300 px-1 py-0.5 rounded-md inline-flex items-center tracking-wide"
                >
                  + {statBreakdown.delta}
                </span>
              ) : isMax ? (
                <span
                  className="font-tech text-[10px] font-bold text-emerald-300 px-1.5 py-0.5 rounded-md inline-flex items-center tracking-wider"
                >
                  MAX
                </span>
              ) : null}
            </div>
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

      {/* Action Footer: Left = Cost, Right = Upgrade Action Button */}
      <div className="flex items-center justify-between pt-1 mt-0.5">
        {/* Left Side: Upgrade Cost Badge (No redundant COST: / CORES text) */}
        <div className="flex items-center">
          {!isMax ? (
            <div
              style={{
                backgroundColor: canAfford ? 'rgba(0, 247, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${canAfford ? 'rgba(0, 247, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                boxShadow: canAfford ? '0 0 8px rgba(0, 247, 255, 0.15)' : 'none',
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-inner"
            >
              <CoreIcon size={13} glow={canAfford} variant="cyan" />
              <span
                className={`font-tech font-extrabold text-xs ${
                  canAfford ? 'text-cyan-200' : 'text-slate-400'
                }`}
              >
                {cost.toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-emerald-400 font-tech font-bold text-xs flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              MAXED OUT
            </span>
          )}
        </div>

        {/* Right Side: Upgrade Action Button */}
        {!isMax ? (
          <button
            type="button"
            disabled={!canAfford}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            style={{
              background: canAfford
                ? `linear-gradient(135deg, ${upgrade.accentColor} 0%, #0284c7 100%)`
                : 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
              border: canAfford
                ? `1.5px solid ${upgrade.accentColor}`
                : '1.2px solid rgba(255, 255, 255, 0.1)',
              color: canAfford ? '#000000' : '#64748b',
              boxShadow: canAfford
                ? `0 0 14px ${upgrade.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.35)`
                : 'none',
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-tech font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
            <span>UPGRADE</span>
          </button>
        ) : (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 font-tech font-bold text-[10px] tracking-wider uppercase">
            PEAK
          </span>
        )}
      </div>
    </div>
  );
};
