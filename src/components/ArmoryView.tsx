import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGame } from '../context/GameContext';
import { currencyService, DailyCollectStatus } from '../services/currency';
import { UpgradeState } from '../constants/upgrades';
import { UpgradeTab, UpgradeSubSection } from './armory/UpgradeTab';
import { ShopTab } from './armory/ShopTab';
import { CyberSectionHeader } from './CyberSectionHeader';
import { FlyingCoresAnimation } from './armory/FlyingCoresAnimation';
import { CoreIcon } from './CoreIcon';
import {
  UpgradeTabIcon,
  ShopTabIcon,
  GameBallIcon,
  GamePaddleIcon,
  GamePowerShardIcon,
} from './armory/InGameIcons';

type ArmorySection = 'upgrade' | 'shop';

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

export const ArmoryView: React.FC = () => {
  const { user, setScreen } = useGame();
  const [activeSection, setActiveSection] = useState<ArmorySection>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const s = window.location.search;
      const h = window.location.hash;
      if (p === '/shop' || s.includes('shop') || h === '#shop') return 'shop';
    }
    return 'upgrade';
  });
  const [subSection, setSubSection] = useState<UpgradeSubSection>('ball');
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [displayCores, setDisplayCores] = useState<number>(() => currencyService.getBalance());
  const [upgrades, setUpgrades] = useState<UpgradeState>(() => currencyService.getUpgrades());
  const [isFlyingCores, setIsFlyingCores] = useState<boolean>(false);
  const [claimAmount, setClaimAmount] = useState<number>(50);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [dailyStatus, setDailyStatus] = useState<DailyCollectStatus>(() =>
    currencyService.getDailyCollectStatus()
  );
  const countUpRef = useRef<number | null>(null);

  // Sync with browser URL / custom events for /shop direct routing
  useEffect(() => {
    const handleUrlOrEvent = () => {
      if (typeof window !== 'undefined') {
        const p = window.location.pathname;
        const s = window.location.search;
        const h = window.location.hash;
        if (p === '/shop' || s.includes('shop') || h === '#shop') {
          setActiveSection('shop');
        }
      }
    };
    window.addEventListener('popstate', handleUrlOrEvent);
    window.addEventListener('open-core-shop', () => setActiveSection('shop'));
    return () => {
      window.removeEventListener('popstate', handleUrlOrEvent);
      window.removeEventListener('open-core-shop', () => setActiveSection('shop'));
    };
  }, []);

  // Synchronize state with currencyService on mount and username change
  useEffect(() => {
    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setCores(b);
      setDisplayCores(b);
      setUpgrades(currencyService.getUpgrades());
      setDailyStatus(currencyService.getDailyCollectStatus());
    });
  }, [user.username]);

  // Periodic poll for 24h daily collect status
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyStatus(currencyService.getDailyCollectStatus());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

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
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + diff * ease);

      setDisplayCores(current);

      if (progress < 1) {
        countUpRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayCores(target);
        countUpRef.current = null;
      }
    };

    countUpRef.current = requestAnimationFrame(tick);
  }, [displayCores]);

  // Handle successful purchase/upgrade
  const handleUpgrade = (id: string) => {
    const success = currencyService.purchaseUpgrade(id);
    if (success) {
      const newBalance = currencyService.getBalance();
      setCores(newBalance);
      setDisplayCores(newBalance);
      setUpgrades(currencyService.getUpgrades());
    }
  };

  // Handle successful core coupon / task claim
  const handleClaimSuccess = (amount: number) => {
    const newBalance = currencyService.getBalance();
    setCores(newBalance);
    setClaimAmount(amount);
    setIsFlyingCores(true);
    setDailyStatus(currencyService.getDailyCollectStatus());

    // Pulse the top header badge with radiant cyan glow
    setIsPulsing(true);
    setTimeout(() => {
      setIsPulsing(false);
    }, 2600);

    // Start slow gradual count-up
    startCountUp(newBalance);
  };

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

      {/* ── 1. ACCOUNT / PROFILE HEADER (NON-STICKY: Scrolls with page) ──────── */}
      <div
        className="w-full flex justify-center bg-[#06081c] shadow-sm flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(0, 247, 255, 0.15)',
        }}
      >
        <CyberSectionHeader
          title={user.fullName || user.username.toUpperCase() || 'CYBER PILOT'}
          subtitle={`@${user.username || 'pilot'}`}
          rightSlot={
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Daily 50 Free Cores Pop-up Pill (Visible when 24h reward is available) */}
              {dailyStatus.canCollect && (
                <button
                  type="button"
                  onClick={() => setActiveSection('shop')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-500/35 to-amber-500/25 border border-amber-400 text-amber-300 font-tech font-bold text-xs shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                  title="Claim 50 Free Cores in Core Shop"
                >
                  <span className="text-xs">🎁</span>
                  <span className="tracking-wider">FREE 50</span>
                </button>
              )}

              {/* Visually Enhanced Cores Button (Click directs to Shop) */}
              <button
                type="button"
                id="header-cores-badge"
                onClick={() => {
                  setActiveSection('shop');
                  if (typeof window !== 'undefined') {
                    window.history.pushState(null, '', '/shop');
                  }
                }}
                title="Click to Open Core Shop"
                style={{
                  background: isPulsing
                    ? 'linear-gradient(135deg, rgba(0, 247, 255, 0.35) 0%, rgba(99, 102, 241, 0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(99, 102, 241, 0.28) 100%)',
                  border: isPulsing
                    ? '1.8px solid #00f7ff'
                    : '1.2px solid rgba(0, 247, 255, 0.5)',
                  boxShadow: isPulsing
                    ? '0 0 25px rgba(0, 247, 255, 0.95), inset 0 0 10px rgba(0, 247, 255, 0.5)'
                    : '0 0 12px rgba(0, 247, 255, 0.25)',
                  transform: isPulsing ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer hover:border-cyan-300 hover:shadow-[0_0_16px_rgba(0,247,255,0.45)] active:scale-95 group transition-all"
              >
                <CoreIcon
                  size={15}
                  glow
                  variant="cyan"
                  className={`transition-transform duration-300 ${isPulsing ? 'scale-125' : 'group-hover:rotate-12'}`}
                />
                <span className={`font-tech font-bold text-xs transition-colors ${isPulsing ? 'text-white' : 'text-cyan-200'}`}>
                  {displayCores.toLocaleString()}
                </span>
                <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
                  CORES
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/20 border border-cyan-400/60 text-cyan-300 flex items-center justify-center text-[10px] font-bold group-hover:bg-cyan-400 group-hover:text-black transition-colors ml-0.5">
                  +
                </span>
              </button>
            </div>
          }
        />
      </div>

      {/* ── 2. STICKY SWITCHERS BAR (ONLY Upgrades & Shop Switchers are Sticky) ── */}
      <div
        className="sticky top-0 z-30 w-full flex flex-col items-center bg-[#06081c]/95 backdrop-blur-md shadow-md flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(0, 247, 255, 0.22)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(0, 247, 255, 0.08)',
        }}
      >
        {/* Top-Level Main Switcher: UPGRADE vs SHOP */}
        <div className="w-full max-w-sm px-4 sm:px-5 pt-2 pb-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#080d26]/90 border border-cyan-500/20 shadow-lg relative">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(sec.id);
                    if (typeof window !== 'undefined') {
                      window.history.pushState(null, '', sec.id === 'shop' ? '/shop' : '/armory');
                    }
                  }}
                  className={`relative flex-1 py-1.5 flex items-center justify-center gap-2 rounded-xl font-tech font-bold text-xs transition-colors cursor-pointer z-10 ${
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

        {/* Sub-Section Switcher: BALL | PADDLE | POWER (Sticky when on Upgrades tab) */}
        {activeSection === 'upgrade' && (
          <div className="w-full max-w-sm px-4 sm:px-5 pb-2.5">
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
                        layoutId="armory-subsection-indicator"
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
          </div>
        )}
      </div>

      {/* ── 3. CONTENT AREA (Scrolls under sticky switchers) ──────────────────── */}

      {/* Visual Design Lab Banner / Access Pill (Placed immediately after navigation so it can easily be removed later) */}
      <div className="w-full max-w-sm px-4 sm:px-5 mt-3 mb-1">
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

      {/* Section Content with Smooth Animated Transitions */}
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
                subSection={subSection}
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
