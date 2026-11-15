import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UpgradeState } from '../../constants/upgrades';
import { BallTab } from './BallTab';
import { PaddleTab } from './PaddleTab';
import { PowerTab } from './PowerTab';
import { GameBallIcon, GamePaddleIcon, GamePowerShardIcon } from './InGameIcons';

type UpgradeSubSection = 'ball' | 'paddle' | 'power';

interface UpgradeTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

export const UpgradeTab: React.FC<UpgradeTabProps> = ({ upgrades, cores, onUpgrade }) => {
  const [subSection, setSubSection] = useState<UpgradeSubSection>('ball');

  const SUB_SECTIONS: {
    id: UpgradeSubSection;
    label: string;
    renderIcon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'ball',
      label: 'BALL',
      renderIcon: () => <GameBallIcon size={18} />,
    },
    {
      id: 'paddle',
      label: 'PADDLE',
      renderIcon: () => <GamePaddleIcon size={20} />,
    },
    {
      id: 'power',
      label: 'POWER',
      renderIcon: () => (
        <GamePowerShardIcon
          type="power"
          symbol="⚡"
          color="#b773ff"
          size={18}
        />
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Sub-Section Switcher: BALL | PADDLE | POWER */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#080d26]/90 border border-cyan-500/20 shadow-md">
        {SUB_SECTIONS.map((sub) => {
          const isActive = subSection === sub.id;

          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSubSection(sub.id)}
              className={`relative flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-xl font-tech font-bold text-xs transition-colors cursor-pointer z-10 ${
                isActive ? 'text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="upgrade-subsection-pill"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  style={{
                    background:
                      sub.id === 'power'
                        ? 'linear-gradient(135deg, #b773ff 0%, #7c3aed 100%)'
                        : sub.id === 'paddle'
                        ? 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)'
                        : 'linear-gradient(135deg, #00f7ff 0%, #0088cc 100%)',
                    boxShadow:
                      sub.id === 'power'
                        ? '0 0 14px rgba(183, 115, 255, 0.45)'
                        : sub.id === 'paddle'
                        ? '0 0 14px rgba(6, 182, 212, 0.45)'
                        : '0 0 14px rgba(0, 247, 255, 0.45)',
                  }}
                  className="absolute inset-0 rounded-xl -z-10"
                />
              )}
              {sub.renderIcon(isActive)}
              <span className="tracking-wider">{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Section Content with Fluid Animated Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full"
        >
          {subSection === 'ball' && (
            <BallTab upgrades={upgrades} cores={cores} onUpgrade={onUpgrade} />
          )}
          {subSection === 'paddle' && (
            <PaddleTab upgrades={upgrades} cores={cores} onUpgrade={onUpgrade} />
          )}
          {subSection === 'power' && (
            <PowerTab upgrades={upgrades} cores={cores} onUpgrade={onUpgrade} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
