import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { currencyService } from '../services/currency';
import { UpgradeState } from '../constants/upgrades';
import { UpgradeTab } from './armory/UpgradeTab';
import { ShopTab } from './armory/ShopTab';
import { CyberSectionHeader } from './CyberSectionHeader';
import { FlyingCoresAnimation } from './armory/FlyingCoresAnimation';
import { CoreIcon } from './CoreIcon';
import { UpgradeTabIcon, ShopTabIcon } from './armory/InGameIcons';

type ArmorySection = 'upgrade' | 'shop';

export const ArmoryView: React.FC = () => {
  const { user, setScreen } = useGame();
  const [activeSection, setActiveSection] = useState<ArmorySection>('upgrade');
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [displayCores, setDisplayCores] = useState<number>(() => currencyService.getBalance());
  const [upgrades, setUpgrades] = useState<UpgradeState>(() => currencyService.getUpgrades());
  const [isFlyingCores, setIsFlyingCores] = useState<boolean>(false);
  const [claimAmount, setClaimAmount] = useState<number>(500);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const countUpRef = useRef<number | null>(null);

  // Synchronize state with currencyService on mount and username change
  useEffect(() => {
    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setCores(b);
      setDisplayCores(b);
      setUpgrades(currencyService.getUpgrades());
    });
  }, [user.username]);

  // Smooth, gradual count-up counter animation over 2.0s
  const startCountUp = useCallback((target: number) => {
    if (countUpRef.current) cancelAnimationFrame(countUpRef.current);

    const startVal = displayCores;
    const diff = target - startVal;
    if (diff <= 0) {
      setDisplayCores(target);
      return;
    }

    const duration = 2000; // ms - slow, smooth count-up
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 2.5);
      const current = Math.round(startVal + diff * eased);
      setDisplayCores(current);

      if (progress < 1) {
        countUpRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayCores(target);
      }
    };

    countUpRef.current = requestAnimationFrame(tick);
  }, [displayCores]);

  const handleUpgrade = useCallback(
    (id: string) => {
      const success = currencyService.purchaseUpgrade(id, user.username);
      if (success) {
        const next = currencyService.getBalance();
        setCores(next);
        setDisplayCores(next);
        setUpgrades(currencyService.getUpgrades());
      }
    },
    [user.username]
  );

  const handleClaimSuccess = useCallback(
    (coresGranted: number) => {
      setClaimAmount(coresGranted);
      setIsFlyingCores(true);
      const newBalance = currencyService.getBalance();
      setCores(newBalance);
      setUpgrades(currencyService.getUpgrades());

      // Delayed gradual count-up timed with particles arriving at the top badge
      setTimeout(() => {
        setIsPulsing(true);
        startCountUp(newBalance);
        setTimeout(() => setIsPulsing(false), 2400);
      }, 750);
    },
    [startCountUp]
  );

  const SECTIONS: {
    id: ArmorySection;
    label: string;
    renderIcon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'upgrade',
      label: 'UPGRADES',
      renderIcon: () => <UpgradeTabIcon size={16} />,
    },
    {
      id: 'shop',
      label: 'CORE SHOP',
      renderIcon: () => <ShopTabIcon size={16} />,
    },
  ];

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* Flying Cores Animation from Center Claim to Top Badge */}
      <FlyingCoresAnimation
        active={isFlyingCores}
        amount={claimAmount}
        onComplete={() => setIsFlyingCores(false)}
      />

      {/* 1. Top Cyber Section Header */}
      <div
        className="w-full flex justify-center bg-[#06081c] shadow-lg pt-1.5 sm:pt-2 flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(0, 247, 255, 0.22)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(0, 247, 255, 0.08)',
        }}
      >
        <CyberSectionHeader
          title={user.fullName || user.username.toUpperCase() || 'CYBER PILOT'}
          subtitle={`@${user.username || 'pilot'}`}
          rightSlot={
            <div
              id="header-cores-badge"
              style={{
                background: isPulsing
                  ? 'linear-gradient(135deg, rgba(0, 247, 255, 0.35) 0%, rgba(99, 102, 241, 0.4) 100%)'
                  : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
                border: isPulsing
                  ? '1.8px solid #00f7ff'
                  : '1.2px solid rgba(0, 247, 255, 0.45)',
                boxShadow: isPulsing
                  ? '0 0 25px rgba(0, 247, 255, 0.95), inset 0 0 10px rgba(0, 247, 255, 0.5)'
                  : '0 0 12px rgba(0, 247, 255, 0.25)',
                transform: isPulsing ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full cursor-default"
            >
              <CoreIcon
                size={15}
                glow
                variant="cyan"
                className={`transition-transform duration-300 ${isPulsing ? 'scale-125' : ''}`}
              />
              <span className={`font-tech font-bold text-xs transition-colors ${isPulsing ? 'text-white' : 'text-cyan-200'}`}>
                {displayCores.toLocaleString()}
              </span>
              <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
                CORES
              </span>
            </div>
          }
        />
      </div>

      {/* 2. Top-Level Main Switcher: UPGRADE vs SHOP */}
      <div className="w-full max-w-sm px-4 sm:px-5 mt-3.5 mb-3.5">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#080d26]/90 border border-cyan-500/20 shadow-lg relative">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`relative flex-1 py-2 flex items-center justify-center gap-2 rounded-xl font-tech font-bold text-xs transition-colors cursor-pointer z-10 ${
                  isActive ? 'text-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="armory-main-section-indicator"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                    style={{
                      background:
                        sec.id === 'shop'
                          ? 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)'
                          : 'linear-gradient(135deg, #00f7ff 0%, #0088cc 100%)',
                      boxShadow:
                        sec.id === 'shop'
                          ? '0 0 16px rgba(255, 215, 0, 0.45)'
                          : '0 0 16px rgba(0, 247, 255, 0.45)',
                    }}
                    className="absolute inset-0 rounded-xl -z-10"
                  />
                )}
                {sec.renderIcon(isActive)}
                <span className="tracking-wider">{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Design Lab Banner / Access Pill */}
      <div className="w-full max-w-sm px-4 sm:px-5 mb-3.5">
        <button
          type="button"
          onClick={() => setScreen('design-lab')}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-950/70 via-indigo-950/70 to-purple-950/70 border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between text-xs font-mono font-bold text-cyan-300 hover:text-white transition-all cursor-pointer shadow-md group active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <span className="text-base group-hover:rotate-12 transition-transform">⚡</span>
            <span>VISUAL DESIGN LAB</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              ASSET FORGE
            </span>
          </div>
          <span className="text-[11px] text-slate-400 group-hover:text-cyan-200">
            VIEW OPTIONS →
          </span>
        </button>
      </div>

      {/* 3. Section Content with Smooth Animated Transitions */}
      <div className="w-full max-w-sm px-4 sm:px-5 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            {activeSection === 'upgrade' && (
              <UpgradeTab
                upgrades={upgrades}
                cores={cores}
                onUpgrade={handleUpgrade}
              />
            )}
            {activeSection === 'shop' && (
              <ShopTab
                cores={cores}
                username={user.username}
                onClaimSuccess={handleClaimSuccess}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
