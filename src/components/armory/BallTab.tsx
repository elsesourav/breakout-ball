import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BALL_UPGRADES, UpgradeState, UpgradeDef, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';
import { UpgradePreviewModal } from './UpgradePreviewModal';
import { AssetThumbnail } from './AssetThumbnail';

interface BallTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string, targetLevel?: number) => void;
}

export const BallTab: React.FC<BallTabProps> = ({ upgrades, cores, onUpgrade }) => {
  const { settings } = useGame();
  const currentSkin = settings.ballSkin || 'cyan';
  const [selectedUpgrade, setSelectedUpgrade] = useState<UpgradeDef | null>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const prevId = sp.get('preview');
      if (prevId) {
        return BALL_UPGRADES.find((u) => u.id === prevId) || null;
      }
    }
    return null;
  });

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1 pt-0.5">
        <span>BALL KINETIC MODULES</span>
        <span className="text-slate-400">TAP CARD TO PREVIEW</span>
      </div>

      {/* Upgrades List */}
      <div className="flex flex-col gap-2.5">
        {BALL_UPGRADES.map((upgrade) => {
          const level = upgrades[upgrade.id] || 1;
          const cost = getUpgradeCost(upgrade.baseCost, level);
          const isSize = upgrade.id === 'ball_size';

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
                <AssetThumbnail
                  upgradeId={upgrade.id}
                  level={level}
                  size={30}
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
        onUpgrade={(id, targetLevel) => {
          onUpgrade(id, targetLevel);
        }}
        currentSkin={currentSkin}
      />
    </div>
  );
};
