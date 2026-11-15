import React from 'react';
import { POWER_UPGRADES, UpgradeState, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';

interface PowerTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

export const PowerTab: React.FC<PowerTabProps> = ({ upgrades, cores, onUpgrade }) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between text-[11px] font-tech text-purple-400 uppercase tracking-wider px-1 pt-1">
        <span>🔥 POWER-UP AUGMENTATIONS</span>
        <span>DURATION & CHARGES</span>
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
            />
          );
        })}
      </div>
    </div>
  );
};
