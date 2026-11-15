import React, { useState, useEffect } from 'react';
import { Ticket, X, CheckCircle, AlertCircle, Loader2, Sparkles, Clock, Lock } from 'lucide-react';
import { SHOP_PACKS, ShopPack } from '../../constants/upgrades';
import { couponService } from '../../services/coupons';
import { currencyService, DailyCollectStatus } from '../../services/currency';
import { soundManager } from '../../utils/audio';
import { CoreIcon } from '../CoreIcon';

const getPackVariant = (id: string): 'emerald' | 'purple' | 'gold' | 'rose' => {
  switch (id) {
    case 'starter':
      return 'emerald';
    case 'power':
      return 'purple';
    case 'mega':
      return 'gold';
    case 'ultra':
    default:
      return 'rose';
  }
};

interface ShopTabProps {
  cores: number;
  username?: string;
  onClaimSuccess: (coresGranted: number) => void;
}

const DEMO_CODES: Record<string, string> = {
  starter: 'START500',
  power: 'NEON1000',
  mega: 'CYBER2500',
  ultra: 'SUPER5000',
};

const formatRemainingTime = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
};

export const ShopTab: React.FC<ShopTabProps> = ({ username, onClaimSuccess }) => {
  const [selectedPack, setSelectedPack] = useState<ShopPack | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [dailyStatus, setDailyStatus] = useState<DailyCollectStatus>(() =>
    currencyService.getDailyCollectStatus()
  );
  const [isClaimingDaily, setIsClaimingDaily] = useState(false);

  // Live timer tick for 24h countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyStatus(currencyService.getDailyCollectStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClaimDaily = () => {
    if (!dailyStatus.canCollect || isClaimingDaily) return;
    setIsClaimingDaily(true);
    soundManager.playUpgradeSuccess();

    const res = currencyService.claimDailyCores(username);
    if (res.success) {
      setDailyStatus(currencyService.getDailyCollectStatus());
      // Trigger smooth flowing flight animation
      onClaimSuccess(res.amount);
    }
    setIsClaimingDaily(false);
  };

  const handleOpenClaim = (pack: ShopPack) => {
    soundManager.playClick('cyber');
    setSelectedPack(pack);
    setCouponCode('');
    setStatus('idle');
    setStatusMsg('');
  };

  const handleCloseModal = () => {
    soundManager.playClick('close');
    setSelectedPack(null);
    setCouponCode('');
    setStatus('idle');
    setStatusMsg('');
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !selectedPack) return;

    setStatus('loading');
    soundManager.playClick('cyber');

    const res = await couponService.redeemCoupon(couponCode, username, selectedPack.cores);

    if (res.success) {
      soundManager.playUpgradeSuccess();
      setStatus('success');
      setStatusMsg(res.message);

      // Close modal quickly so it does not obstruct the flying cores flight!
      setTimeout(() => {
        handleCloseModal();
        onClaimSuccess(res.coresGranted);
      }, 350);
    } else {
      soundManager.playInsufficientFunds();
      setStatus('error');
      setStatusMsg(res.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── 1. DAILY 50 CORES REWARD CARD ──────────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'rgba(8, 13, 38, 0.95)',
          border: dailyStatus.canCollect
            ? '1.5px solid rgba(245, 158, 11, 0.65)'
            : '1.2px solid rgba(148, 163, 184, 0.25)',
          boxShadow: dailyStatus.canCollect
            ? '0 0 20px rgba(245, 158, 11, 0.25), 0 4px 18px rgba(0,0,0,0.6)'
            : '0 4px 18px rgba(0,0,0,0.5)',
          borderRadius: '16px',
        }}
        className="p-3.5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                dailyStatus.canCollect
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <CoreIcon size={20} glow={dailyStatus.canCollect} variant={dailyStatus.canCollect ? 'gold' : 'cyan'} />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs sm:text-sm text-white tracking-wide flex items-center gap-1.5">
                <span>DAILY APEX REWARD</span>
                {dailyStatus.canCollect && (
                  <span className="text-[9px] font-tech font-bold px-1.5 py-0.2 rounded bg-amber-500/25 text-amber-300 border border-amber-400/50">
                    READY
                  </span>
                )}
              </span>
              <span className="font-tech text-[10.5px] text-slate-400">
                Collect 50 free cores every 24 hours
              </span>
            </div>
          </div>

          <span className="font-tech font-bold text-sm text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+50</span>
          </span>
        </div>

        {/* Claim or Locked Countdown Button */}
        {dailyStatus.canCollect ? (
          <button
            type="button"
            onClick={handleClaimDaily}
            disabled={isClaimingDaily}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-tech font-black text-xs uppercase tracking-wider shadow-[0_0_14px_rgba(245,158,11,0.5)] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLAIM 50 FREE CORES</span>
          </button>
        ) : (
          <div className="w-full py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-tech text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>LOCKED</span>
            </span>
            <span className="font-mono text-[11px] text-amber-300/80 flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{formatRemainingTime(dailyStatus.remainingMs)}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── 2. COUPON VAULT HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1 pt-1">
        <span className="flex items-center gap-1.5 font-bold">
          <Ticket className="w-3.5 h-3.5" />
          SHOP COUPON VAULT
        </span>
        <span className="text-[10px] text-slate-400">REDEEM CODES</span>
      </div>

      {/* ── 3. 2-Column Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        {SHOP_PACKS.map((pack) => (
          <div
            key={pack.id}
            style={{
              backgroundColor: 'rgba(8, 13, 38, 0.94)',
              border: `1.2px solid ${pack.borderColor}`,
              boxShadow: `0 4px 18px rgba(0, 0, 0, 0.6), 0 0 12px ${pack.accentColor}15`,
              borderRadius: '16px',
            }}
            className="p-3.5 flex flex-col items-center justify-between text-center gap-2 relative overflow-hidden transition-all duration-200"
          >
            <div
              style={{
                backgroundColor: `${pack.accentColor}18`,
                border: `1.2px solid ${pack.accentColor}50`,
                boxShadow: `0 0 12px ${pack.accentColor}30`,
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center mt-1"
            >
              <CoreIcon size={22} glow variant={getPackVariant(pack.id)} />
            </div>

            <div className="flex flex-col items-center">
              <span className="font-display font-black text-sm text-white tracking-wide">
                +{pack.cores.toLocaleString()}
              </span>
              <span className="font-tech text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {pack.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleOpenClaim(pack)}
              style={{
                backgroundColor: pack.accentColor,
                boxShadow: `0 0 10px ${pack.accentColor}50`,
              }}
              className="w-full py-1.5 rounded-lg text-black font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 hover:opacity-90 flex items-center justify-center gap-1"
            >
              <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>CLAIM</span>
            </button>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="p-3 rounded-xl bg-[#080d26]/80 border border-cyan-500/20 flex items-center gap-2.5 mt-0.5">
        <Ticket className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="text-[11px] text-slate-400 font-ui leading-tight">
          Enter official promo coupons or challenge codes to claim Cores. Each coupon is tier-locked to its corresponding pack amount.
        </p>
      </div>

      {/* Coupon Modal */}
      {selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            style={{
              backgroundColor: '#080d26',
              border: `1.5px solid ${selectedPack.accentColor}`,
              boxShadow: `0 0 35px ${selectedPack.accentColor}40`,
              borderRadius: '20px',
            }}
            className="w-full max-w-xs p-4 flex flex-col gap-3 relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Pack Header */}
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  backgroundColor: `${selectedPack.accentColor}20`,
                  border: `1.2px solid ${selectedPack.accentColor}`,
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
              >
                <CoreIcon size={22} glow variant={getPackVariant(selectedPack.id)} />
              </div>
              <div>
                <h3 className="font-display font-black text-sm text-white">
                  +{selectedPack.cores.toLocaleString()} Cores
                </h3>
                <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
                  SHOP PACK • {selectedPack.name}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleRedeem} className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
                    COUPON CODE:
                  </label>
                  <span className="font-mono text-[9px] text-amber-300">
                    Try: {DEMO_CODES[selectedPack.id]}
                  </span>
                </div>
                <input
                  type="text"
                  autoFocus
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={`e.g. ${DEMO_CODES[selectedPack.id]}`}
                  className="w-full px-3 py-2 rounded-lg bg-black/70 border border-cyan-500/30 text-white font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {statusMsg && (
                <div
                  className={`flex items-center gap-1.5 text-xs font-tech p-2 rounded-md ${
                    status === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}
                >
                  {status === 'success' ? (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{statusMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !couponCode.trim()}
                style={{
                  backgroundColor: selectedPack.accentColor,
                }}
                className="w-full py-2.5 rounded-lg text-black font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-1"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>CLAIM IN SHOP</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
