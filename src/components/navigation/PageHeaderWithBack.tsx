import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundManager } from '../../audio';
import { TopCoresBadge } from '../common/TopCoresBadge';
import { currencyService } from '../../services/currency';

interface PageHeaderWithBackProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  showCores?: boolean;
}

export const PageHeaderWithBack: React.FC<PageHeaderWithBackProps> = ({
  title,
  subtitle,
  onBack,
  rightSlot,
  showCores = false,
}) => {
  const { setActiveTab } = useGame();
  const [cores, setCores] = React.useState<number>(() => currencyService.getBalance());

  React.useEffect(() => {
    const sync = () => setCores(currencyService.getBalance());
    sync();
    window.addEventListener('currency-changed', sync);
    window.addEventListener('currency_balance_changed', sync);
    return () => {
      window.removeEventListener('currency-changed', sync);
      window.removeEventListener('currency_balance_changed', sync);
    };
  }, []);

  const handleBack = () => {
    soundManager.playClick();
    if (onBack) {
      onBack();
    } else {
      setActiveTab('local');
    }
  };

  const handleOpenShop = () => {
    soundManager.playClick();
    setActiveTab('shop');
  };

  return (
    <header
      className="w-full flex justify-center bg-[#06081c]/95 backdrop-blur-md shadow-lg z-30 flex-shrink-0 select-none"
      style={{
        borderBottom: '1px solid rgba(0, 247, 255, 0.22)',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(0, 247, 255, 0.08)',
      }}
    >
      <div className="w-full max-w-sm px-3.5 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Back Button */}
        <motion.button
          type="button"
          onClick={handleBack}
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(14, 25, 54, 0.85) 100%)',
            border: '1.2px solid rgba(0, 247, 255, 0.45)',
            boxShadow: '0 0 10px rgba(0, 247, 255, 0.25)',
          }}
          className="h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-tech font-bold text-cyan-300 hover:text-white cursor-pointer active:scale-95 transition-all flex-shrink-0"
          title="Return to previous screen"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span className="tracking-wider">BACK</span>
        </motion.button>

        {/* Center: Title / Subtitle */}
        <div className="flex-1 min-w-0 flex flex-col items-center text-center px-1">
          <span
            className="font-display font-black text-xs sm:text-[13px] tracking-wider uppercase truncate"
            style={{
              color: '#00f7ff',
              textShadow: '0 0 8px rgba(0, 247, 255, 0.45)',
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span className="font-tech text-[9px] text-slate-400 font-semibold tracking-wider uppercase truncate">
              {subtitle}
            </span>
          )}
        </div>

        {/* Right: Cores Badge only for designated important views, no settings */}
        <div className="flex-shrink-0 flex items-center justify-end min-w-[70px]">
          {rightSlot ? (
            rightSlot
          ) : showCores ? (
            <TopCoresBadge cores={cores} onOpenShop={handleOpenShop} />
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>
      </div>
    </header>
  );
};
