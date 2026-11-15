import React from 'react';
import { POWER_UPGRADES, UpgradeState, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';
import { GamePowerShardIcon } from './InGameIcons';

interface PowerTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

export const PowerTab: React.FC<PowerTabProps> = ({ upgrades, cores, onUpgrade }) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. In-Game Power Shards Showcase */}
      <div
        style={{
          backgroundColor: 'rgba(8, 13, 38, 0.94)',
          border: '1.2px solid rgba(183, 115, 255, 0.35)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(183, 115, 255, 0.15)',
          borderRadius: '18px',
        }}
        className="p-4 flex flex-col gap-3 relative overflow-hidden"
      >
        <div className="w-full flex items-center justify-between text-[10px] font-tech text-purple-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block" />
            IN-GAME POWER SHARDS
          </span>
          <span className="text-slate-400">EMERGENT DROPS</span>
        </div>

        {/* 6 In-Game Diamond Shards Row */}
        <div
          style={{ border: '1px solid rgba(183, 115, 255, 0.25)' }}
          className="grid grid-cols-6 gap-1 bg-black/40 p-2.5 rounded-xl"
        >
          {[
            { name: 'Plasma', symbol: '▲', color: '#ff0055' },
            { name: 'Mega', symbol: '✹', color: '#ffd700' },
            { name: 'Chronos', symbol: '⏱', color: '#b773ff' },
            { name: 'Titan', symbol: '◀▶', color: '#06b6d4' },
            { name: 'Multi', symbol: '●●', color: '#00f7ff' },
            { name: 'Shield', symbol: '🛡', color: '#10b981' },
          ].map((shard) => (
            <div key={shard.name} className="flex flex-col items-center gap-1">
              <GamePowerShardIcon
                type={shard.name}
                symbol={shard.symbol}
                color={shard.color}
                size={28}
              />
              <span className="font-tech text-[8px] text-slate-400 uppercase tracking-wider truncate">
                {shard.name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] font-ui text-slate-400 leading-tight">
          Dropped when destroying bricks. Upgrades extend duration, fire rate, and blast radius in real-time gameplay.
        </p>
      </div>

      {/* 2. Power-Up Augmentation Modules */}
      <div className="flex items-center justify-between text-[11px] font-tech text-purple-400 uppercase tracking-wider px-1 pt-1">
        <span>🔥 POWER AUGMENTATIONS</span>
        <span>LEVEL 1–8</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {POWER_UPGRADES.map((upgrade) => {
          const level = upgrades[upgrade.id] || 1;
          const cost = getUpgradeCost(upgrade.baseCost, level);

          return (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              level={level}
              cores={cores}
              cost={cost}
              onUpgrade={onUpgrade}
              icon={
                <GamePowerShardIcon
                  type={upgrade.id}
                  symbol={upgrade.symbol}
                  color={upgrade.accentColor}
                  glow={upgrade.glowColor}
                  size={26}
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
};
