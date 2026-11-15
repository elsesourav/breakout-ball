import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { Sparkles, Flame, ShoppingBag, Gauge, Palette } from 'lucide-react';
import { currencyService } from '../services/currency';
import { UpgradeState } from '../constants/upgrades';
import { BallTab } from './armory/BallTab';
import { PowerTab } from './armory/PowerTab';
import { ShopTab } from './armory/ShopTab';
import { BallSkinSelector } from './profile/BallSkinSelector';
import { CyberSectionHeader } from './CyberSectionHeader';
import { FlyingCoresAnimation } from './armory/FlyingCoresAnimation';

type ArmoryTab = 'hangar' | 'kinetics' | 'augments' | 'shop';

export const ArmoryView: React.FC = () => {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState<ArmoryTab>('hangar');
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

  // Smooth, gradual count-up counter animation over 1.8s
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

  const TABS: { id: ArmoryTab; label: string; icon: React.ElementType }[] = [
    { id: 'hangar', label: 'HANGAR', icon: Palette },
    { id: 'kinetics', label: 'KINETICS', icon: Gauge },
    { id: 'augments', label: 'AUGMENTS', icon: Flame },
    { id: 'shop', label: 'SHOP', icon: ShoppingBag },
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

      {/* 1. Sticky Top Cyber Section Header - ALWAYS VISIBLE AT THE TOP */}
      <div className="sticky top-0 z-[60] w-full flex justify-center bg-[#06081c]/95 backdrop-blur-md border-b border-cyan-500/15 shadow-lg">
        <CyberSectionHeader
          title="CYBER ARMORY"
          subtitle="KINETIC UPGRADES & WORKSHOP"
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
              <Sparkles className={`w-3.5 h-3.5 transition-colors ${isPulsing ? 'text-white animate-spin' : 'text-cyan-300'}`} />
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

      {/* 2. Fluid Animated Tab Switcher */}
      <div className="w-full max-w-sm px-3.5 mt-2.5 mb-3">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#080d26]/90 border border-cyan-500/20 shadow-lg relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-1.5 flex items-center justify-center gap-1 rounded-xl font-tech font-bold text-[11px] transition-colors cursor-pointer z-10 ${
                  isActive ? 'text-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="armory-active-tab-indicator"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                    style={{
                      background:
                        tab.id === 'shop'
                          ? 'linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)'
                          : tab.id === 'augments'
                          ? 'linear-gradient(135deg, #b773ff 0%, #7c3aed 100%)'
                          : 'linear-gradient(135deg, #00f7ff 0%, #0088cc 100%)',
                      boxShadow:
                        tab.id === 'shop'
                          ? '0 0 14px rgba(255, 215, 0, 0.4)'
                          : tab.id === 'augments'
                          ? '0 0 14px rgba(183, 115, 255, 0.4)'
                          : '0 0 14px rgba(0, 247, 255, 0.45)',
                    }}
                    className="absolute inset-0 rounded-xl -z-10"
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tab Contents with Smooth Animated Transitions */}
      <div className="w-full max-w-sm px-3.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            {activeTab === 'hangar' && <BallSkinSelector />}
            {activeTab === 'kinetics' && (
              <BallTab upgrades={upgrades} cores={cores} onUpgrade={handleUpgrade} />
            )}
            {activeTab === 'augments' && (
              <PowerTab upgrades={upgrades} cores={cores} onUpgrade={handleUpgrade} />
            )}
            {activeTab === 'shop' && (
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
