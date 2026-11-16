import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../../context/GameContext';
import { currencyService } from '../../services/currency';
import { UpgradeState, POWER_UPGRADES, PADDLE_UPGRADES } from '../../constants/upgrades';
import { UpgradeTab, UpgradeSubSection } from '../armory/UpgradeTab';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';
import { TopCoresBadge } from '../common/TopCoresBadge';
import { soundManager } from '../../audio';
import { AssetThumbnail } from '../armory/AssetThumbnail';

const SUB_SECTIONS: {
  id: UpgradeSubSection;
  label: string;
  renderIcon: (active: boolean) => React.ReactNode;
}[] = [
  {
    id: 'ball',
    label: 'BALL',
    renderIcon: () => <AssetThumbnail type="ball" size={19} />,
  },
  {
    id: 'paddle',
    label: 'PADDLE',
    renderIcon: () => <AssetThumbnail type="paddle" size={24} />,
  },
  {
    id: 'power',
    label: 'POWER',
    renderIcon: () => <AssetThumbnail type="power" size={19} />,
  },
];

export const ArmoryView: React.FC = () => {
  const { user, setActiveTab } = useGame();
  const [subSection, setSubSection] = useState<UpgradeSubSection>(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const prevId = sp.get('preview');
      if (prevId) {
        if (POWER_UPGRADES.some((u) => u.id === prevId)) return 'power';
        if (PADDLE_UPGRADES.some((u) => u.id === prevId)) return 'paddle';
      }
      const sub = sp.get('sub');
      if (sub === 'paddle' || sub === 'power' || sub === 'ball') return sub;
    }
    return 'ball';
  });

  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [displayCores, setDisplayCores] = useState<number>(() => currencyService.getBalance());
  const [upgrades, setUpgrades] = useState<UpgradeState>(() => currencyService.getUpgrades());
  const [isPulsing, setIsPulsing] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize state with currencyService on mount and username change
  useEffect(() => {
    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setCores(b);
      setDisplayCores(b);
      setUpgrades(currencyService.getUpgrades());
    });
  }, [user.username]);

  // Handle successful purchase/upgrade (single-level or multi-level bulk upgrade)
  const handleUpgrade = (id: string, targetLevel?: number) => {
    let success = false;
    if (targetLevel && targetLevel > (upgrades[id] || 1)) {
      success = currencyService.purchaseUpgradeToLevel(id, targetLevel, user.username);
    } else {
      success = currencyService.purchaseUpgrade(id, user.username);
    }

    if (success) {
      soundManager.playUpgradeSuccess();
      const newBal = currencyService.getBalance();
      setCores(newBal);
      setDisplayCores(newBal);
      setUpgrades(currencyService.getUpgrades());
    } else {
      soundManager.play('damage');
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center pb-16 select-none cyber-grid-bg no-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* ── 1. PAGE HEADER WITH BACK BUTTON ──────── */}
      <PageHeaderWithBack
        title="ARMORY & ARSENAL"
        subtitle="TACTICAL UPGRADES"
        onBack={() => setActiveTab('local')}
        rightSlot={
          <TopCoresBadge
            cores={displayCores}
            isPulsing={isPulsing}
            onOpenShop={() => setActiveTab('shop')}
          />
        }
      />

      {/* ── 2. STICKY SUB-SECTION SWITCHER BAR (BALL | PADDLE | POWER) ── */}
      <div
        className="sticky top-0 z-30 w-full flex flex-col items-center bg-[#06081c]/95 backdrop-blur-md shadow-md flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(0, 247, 255, 0.22)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(0, 247, 255, 0.08)',
        }}
      >
        <div className="w-full max-w-sm px-4 sm:px-5 py-2.5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#080d26]/90 border border-cyan-500/20 shadow-md">
            {SUB_SECTIONS.map((sub) => {
              const isActive = subSection === sub.id;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick('tab');
                    setSubSection(sub.id);
                  }}
                  className={`relative flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-xl font-tech font-bold text-xs transition-colors cursor-pointer z-10 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="armory-subsection-indicator"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      style={{
                        background:
                          sub.id === 'power'
                            ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
                            : sub.id === 'paddle'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        boxShadow:
                          sub.id === 'power'
                            ? '0 0 16px rgba(236, 72, 153, 0.5)'
                            : sub.id === 'paddle'
                            ? '0 0 16px rgba(16, 185, 129, 0.5)'
                            : '0 0 16px rgba(139, 92, 246, 0.5)',
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
        </div>
      </div>

      {/* ── 3. CONTENT AREA ──────────────────── */}
      <div className="w-full max-w-sm px-4 sm:px-5 pb-3 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={subSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
          >
            <UpgradeTab
              upgrades={upgrades}
              cores={cores}
              onUpgrade={handleUpgrade}
              subSection={subSection}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
