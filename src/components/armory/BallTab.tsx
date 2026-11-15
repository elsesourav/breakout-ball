import React from 'react';
import { PADDLE_UPGRADES, BALL_UPGRADES, UpgradeState, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';

interface BallTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

export const BallTab: React.FC<BallTabProps> = ({ upgrades, cores, onUpgrade }) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Paddle Section */}
      <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1 pt-1">
        <span>🏓 PADDLE CALIBRATION</span>
        <span>WIDTH & VELOCITY</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {PADDLE_UPGRADES.map((upgrade) => {
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

      {/* 2. Ball Section */}
      <div className="flex items-center justify-between text-[11px] font-tech text-indigo-400 uppercase tracking-wider px-1 pt-2">
        <span>⚡ BALL KINETICS</span>
        <span>SIZE, SPEED & IMPACT</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {BALL_UPGRADES.map((upgrade) => {
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
