import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UpgradeState } from '../../constants/upgrades';
import { BallTab } from './BallTab';
import { PaddleTab } from './PaddleTab';

export type UpgradeSubSection = 'ball' | 'paddle';

interface UpgradeTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
  subSection: UpgradeSubSection;
}

export const UpgradeTab: React.FC<UpgradeTabProps> = ({
  upgrades,
  cores,
  onUpgrade,
  subSection,
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
