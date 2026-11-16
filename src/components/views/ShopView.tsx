import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { currencyService, DailyCollectStatus } from '../../services/currency';
import { ShopTab } from '../armory/ShopTab';
import { PageHeaderWithBack } from '../navigation/PageHeaderWithBack';
import { TopCoresBadge } from '../common/TopCoresBadge';
import { FlyingCoresAnimation } from '../armory/FlyingCoresAnimation';
import { soundManager } from '../../audio';

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
  const [claimAmount, setClaimAmount] = useState<number>(100);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const countUpRef = useRef<number | null>(null);

  useEffect(() => {
    currencyService.load(user.username).then(() => {
      const b = currencyService.getBalance();
      setCores(b);
      setDisplayCores(b);
      setDailyStatus(currencyService.getDailyCollectStatus());
    });
  }, [user.username]);

  useEffect(() => {
    const timer = setInterval(() => {
      setDailyStatus(currencyService.getDailyCollectStatus());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      soundManager.stopCollectSequence();
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current);
    };
  }, []);

  const startCountUp = useCallback(
    (target: number, fromVal?: number) => {
      if (countUpRef.current) cancelAnimationFrame(countUpRef.current);
      const startVal = fromVal !== undefined ? fromVal : displayCores;
      const diff = target - startVal;
      if (diff <= 0) {
        setDisplayCores(target);
        soundManager.stopCollectSequence();
        return;
      }
      const duration = 950;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 2);
        const current = Math.round(startVal + diff * ease);

        setDisplayCores(current);

        if (progress < 1) {
          countUpRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayCores(target);
          countUpRef.current = null;
          soundManager.stopCollectSequence();
        }
      };

      countUpRef.current = requestAnimationFrame(tick);
    },
    [displayCores]
  );

  const handleShopClaim = useCallback(
    (amount: number, origin?: { x: number; y: number }) => {
      const newBalance = currencyService.getBalance();
      const prevBalance = Math.max(0, newBalance - amount);
      setDisplayCores(prevBalance);
      setCores(newBalance);
      setClaimAmount(amount);
      if (origin) {
        setFlyOrigin(origin);
      } else {
        setFlyOrigin({ x: window.innerWidth / 2, y: window.innerHeight * 0.5 });
      }
      setIsFlyingCores(true);
      setDailyStatus(currencyService.getDailyCollectStatus());

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Landing time: trigger bump-up, slowly increase counter, and play collect sound
      setTimeout(() => {
        setIsPulsing(true);
        soundManager.startCollectSequence(950);
        startCountUp(newBalance, prevBalance);
      }, 650);

      setTimeout(() => {
        setIsPulsing(false);
        soundManager.stopCollectSequence();
      }, 1650);
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
