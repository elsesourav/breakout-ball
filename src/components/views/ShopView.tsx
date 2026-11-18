import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { currencyService, DailyCollectStatus } from '../../services/currency';
import { ShopTab } from '../armory/ShopTab';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';
import { TopCoresBadge } from '../common/TopCoresBadge';
import { FlyingCoresAnimation } from '../armory/FlyingCoresAnimation';
import { soundManager } from '../../audio';

// Calculate adaptive count-up duration based on the increment value
const getCountUpDuration = (diff: number): number => {
  if (diff <= 50) return 800;
  if (diff <= 250) return 950;
  if (diff <= 1000) return 1200;
  if (diff <= 5000) return 1500;
  return 1850; // for 10,000+ cores
};

export const ShopView: React.FC = () => {
  const { user, setActiveTab } = useGame();
  const [cores, setCores] = useState<number>(() => currencyService.getBalance());
  const [displayCores, setDisplayCores] = useState<number>(cores);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [dailyStatus, setDailyStatus] = useState<DailyCollectStatus>(() =>
    currencyService.getDailyCollectStatus()
  );

  // Flying cores particle state
  const [isFlyingCores, setIsFlyingCores] = useState<boolean>(false);
  const [flyOrigin, setFlyOrigin] = useState<{ x: number; y: number } | undefined>(undefined);
  const [flyTriggerKey, setFlyTriggerKey] = useState<number>(0);
  const [claimAmount, setClaimAmount] = useState<number>(100);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const countUpRef = useRef<number | null>(null);
  const landingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pulseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayCoresRef = useRef(displayCores);
  displayCoresRef.current = displayCores;
  const isCollectingRef = useRef(false);
  isCollectingRef.current = isPulsing || isFlyingCores;

  useEffect(() => {
    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setCores(b);
      setDisplayCores(b);
      setDailyStatus(currencyService.getDailyCollectStatus());
    });
  }, [user.username]);

  // Synchronize currency balance when not actively collecting / counting up
  useEffect(() => {
    const sync = () => {
      if (!isCollectingRef.current) {
        const b = currencyService.getBalance();
        setCores(b);
        setDisplayCores(b);
      }
    };
    window.addEventListener('currency-changed', sync);
    window.addEventListener('currency_balance_changed', sync);
    return () => {
      window.removeEventListener('currency-changed', sync);
      window.removeEventListener('currency_balance_changed', sync);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDailyStatus(currencyService.getDailyCollectStatus());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Cancel count-up, timers, and stop audio on component unmount
  useEffect(() => {
    return () => {
      soundManager.stopCollectSequence();
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current);
      if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  const startCountUp = useCallback(
    (target: number, fromVal?: number, customDuration?: number) => {
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current);
      const startVal = fromVal !== undefined ? fromVal : displayCoresRef.current;
      const diff = target - startVal;
      if (diff <= 0) {
        setDisplayCores(target);
        soundManager.stopCollectSequence();
        return;
      }
      const duration = customDuration ?? getCountUpDuration(diff);
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // For large increments (> 500, like 10,000 cores), easeInOutCubic gives a smooth ramp-up, fast rolling middle, and gentle settle
        const ease =
          diff > 500
            ? progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2
            : 1 - Math.pow(1 - progress, 2);

        const current = Math.round(startVal + diff * ease);
        setDisplayCores(current);

        if (progress < 1) {
          countUpRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayCores(target);
          countUpRef.current = null;
          soundManager.stopCollectSequence();
          if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
          pulseTimerRef.current = setTimeout(() => {
            setIsPulsing(false);
          }, 200);
        }
      };

      countUpRef.current = requestAnimationFrame(tick);
    },
    []
  );

  const handleShopClaim = useCallback(
    (amount: number, origin?: { x: number; y: number }) => {
      // Immediately stop any currently running count-up animation, audio, or timers
      if (countUpRef.current) {
        cancelAnimationFrame(countUpRef.current);
        countUpRef.current = null;
      }
      soundManager.stopCollectSequence();
      setIsPulsing(false);
      if (landingTimerRef.current) clearTimeout(landingTimerRef.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);

      const newBalance = currencyService.getBalance();

      // Negative adjustment (admin test deduction / coupon)
      if (amount < 0) {
        setDisplayCores(newBalance);
        setCores(newBalance);
        setDailyStatus(currencyService.getDailyCollectStatus());
        return;
      }

      const prevBalance = Math.max(0, newBalance - amount);
      const fromVal = Math.min(displayCoresRef.current, prevBalance);

      setDisplayCores(fromVal);
      setCores(newBalance);
      setClaimAmount(amount);
      if (origin) {
        setFlyOrigin(origin);
      } else {
        setFlyOrigin({ x: window.innerWidth / 2, y: window.innerHeight * 0.45 });
      }
      setIsFlyingCores(true);
      setFlyTriggerKey(Date.now());
      setDailyStatus(currencyService.getDailyCollectStatus());

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      const diff = newBalance - fromVal;
      const duration = getCountUpDuration(diff);

      // Landing time: trigger bump-up, slowly increase counter, and play collect sound
      landingTimerRef.current = setTimeout(() => {
        setIsPulsing(true);
        soundManager.startCollectSequence(duration);
        startCountUp(newBalance, fromVal, duration);
      }, 650);
    },
    [startCountUp]
  );

  const handleAnimationComplete = useCallback(() => {
    setIsFlyingCores(false);
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center pb-16 select-none cyber-grid-bg no-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* Flying Cores Animation from Origin Claim to Top Badge */}
      <FlyingCoresAnimation
        active={isFlyingCores}
        amount={claimAmount}
        origin={flyOrigin}
        triggerKey={flyTriggerKey}
        onComplete={handleAnimationComplete}
      />

      {/* Page Header with Back Button */}
      <PageHeaderWithBack
        title="CORE VAULT"
        subtitle="CYBER STORE & PERKS"
        onBack={() => setActiveTab('local')}
        rightSlot={
          <TopCoresBadge
            cores={displayCores}
            isPulsing={isPulsing}
            onOpenShop={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        }
      />

      {/* Main Core Shop Content */}
      <div className="w-full max-w-sm px-4 pt-3 flex flex-col items-center">
        <ShopTab
          cores={cores}
          username={user.username}
          onClaimSuccess={handleShopClaim}
        />
      </div>
    </div>
  );
};
