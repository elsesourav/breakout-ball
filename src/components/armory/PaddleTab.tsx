import React, { useState } from 'react';
import { PADDLE_UPGRADES, UpgradeState, UpgradeDef, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';
import { UpgradePreviewModal } from './UpgradePreviewModal';
import { GamePaddleIcon } from './InGameIcons';

interface PaddleTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

export const PaddleTab: React.FC<PaddleTabProps> = ({ upgrades, cores, onUpgrade }) => {
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeDef | null>(null);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1 pt-0.5">
        <span>🏓 PADDLE MODULES</span>
        <span className="text-slate-400">TAP CARD TO PREVIEW</span>
      </div>

      {/* Upgrades List */}
      <div className="flex flex-col gap-2.5">
        {PADDLE_UPGRADES.map((upgrade) => {
          const level = upgrades[upgrade.id] || 1;
          const cost = getUpgradeCost(upgrade.baseCost, level);
          const isWidth = upgrade.id === 'paddle_width';

          return (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              level={level}
              cores={cores}
              cost={cost}
              onUpgrade={onUpgrade}
              onSelect={(u) => setSelectedUpgrade(u)}
              icon={
                <GamePaddleIcon
                  widthRatio={isWidth ? 0.7 + level * 0.12 : 1}
                  size={26}
                  accentColor={upgrade.accentColor}
                />
              }
            />
          );
        })}
      </div>

      {/* Interactive Upgrade Live Preview & Confirmation Modal */}
      <UpgradePreviewModal
        isOpen={!!selectedUpgrade}
        upgrade={selectedUpgrade}
        currentLevel={selectedUpgrade ? upgrades[selectedUpgrade.id] || 1 : 1}
        cores={cores}
        onClose={() => setSelectedUpgrade(null)}
        onUpgrade={(id) => {
          onUpgrade(id);
        }}
      />
    </div>
  );
};
