import React, { useState, useEffect } from 'react';
import { Ticket, X, CheckCircle, AlertCircle, Loader2, Sparkles, Lock, Database } from 'lucide-react';
import { SHOP_PACKS, ShopPack } from '../../constants/upgrades';
import { couponService } from '../../services/coupons';
import { currencyService, DailyCollectStatus } from '../../services/currency';
import { soundManager } from '../../utils/audio';
import { CoreIcon } from '../CoreIcon';
import { BackendAdminModal } from '../admin/BackendAdminModal';
import { authService, isUserAdmin } from '../../services/auth';

const getPackVariant = (id: string): 'gold' | 'emerald' | 'blue' | 'rose' | 'cyan' => {
  switch (id) {
    case 'starter':
      return 'gold';
    case 'power':
      return 'emerald';
    case 'mega':
      return 'blue';
    case 'ultra':
      return 'rose';
    case 'titan':
    default:
      return 'cyan';
  }
};

interface PackMeta {
  btnGradient: string;
  btnTextColor: string;
  btnShadow: string;
  cardGlow: string;
  cardBorder: string;
  cardBg?: string;
  iconBg: string;
  iconBorder: string;
  iconGlow: string;
  isGlory?: boolean;
}

const PACK_META: Record<string, PackMeta> = {
  starter: {
    // 500: Yellow
    btnGradient: 'linear-gradient(135deg, #fef08a 0%, #facc15 50%, #eab308 100%)',
    btnTextColor: 'text-slate-950 font-black',
    btnShadow: '0 0 14px rgba(234, 179, 8, 0.45)',
    cardGlow: '0 4px 18px rgba(0, 0, 0, 0.6), 0 0 10px rgba(234, 179, 8, 0.12)',
    cardBorder: '1.2px solid rgba(234, 179, 8, 0.4)',
    iconBg: 'rgba(234, 179, 8, 0.15)',
    iconBorder: '1.2px solid rgba(234, 179, 8, 0.5)',
    iconGlow: '0 0 10px rgba(234, 179, 8, 0.25)',
  },
  power: {
    // 1000: Green
    btnGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    btnTextColor: 'text-slate-950 font-black',
    btnShadow: '0 0 16px rgba(16, 185, 129, 0.5)',
    cardGlow: '0 4px 18px rgba(0, 0, 0, 0.6), 0 0 12px rgba(16, 185, 129, 0.14)',
    cardBorder: '1.2px solid rgba(16, 185, 129, 0.38)',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconBorder: '1.2px solid rgba(16, 185, 129, 0.5)',
    iconGlow: '0 0 12px rgba(16, 185, 129, 0.3)',
  },
  mega: {
    // 2500: Blue
    btnGradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)',
    btnTextColor: 'text-white font-black drop-shadow-sm',
    btnShadow: '0 0 16px rgba(59, 130, 246, 0.55)',
    cardGlow: '0 4px 20px rgba(0, 0, 0, 0.65), 0 0 16px rgba(59, 130, 246, 0.2)',
    cardBorder: '1.3px solid rgba(59, 130, 246, 0.45)',
    iconBg: 'rgba(59, 130, 246, 0.16)',
    iconBorder: '1.2px solid rgba(59, 130, 246, 0.55)',
    iconGlow: '0 0 14px rgba(59, 130, 246, 0.35)',
  },
  ultra: {
    // 5000: Reddish
    btnGradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 50%, #dc2626 100%)',
    btnTextColor: 'text-white font-black drop-shadow-sm',
    btnShadow: '0 0 18px rgba(239, 68, 68, 0.55)',
    cardGlow: '0 4px 22px rgba(0, 0, 0, 0.7), 0 0 20px rgba(239, 68, 68, 0.22)',
    cardBorder: '1.3px solid rgba(239, 68, 68, 0.45)',
    iconBg: 'rgba(239, 68, 68, 0.16)',
    iconBorder: '1.2px solid rgba(239, 68, 68, 0.55)',
    iconGlow: '0 0 14px rgba(239, 68, 68, 0.35)',
  },
  titan: {
    // 10000: Cyan Glory
    btnGradient: 'linear-gradient(135deg, #a5f3fc 0%, #22d3ee 35%, #06b6d4 70%, #00f7ff 100%)',
    btnTextColor: 'text-slate-950 font-black',
    btnShadow: '0 0 24px rgba(0, 247, 255, 0.8), 0 0 10px rgba(255, 215, 0, 0.4)',
    cardGlow: '0 4px 26px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 247, 255, 0.42), 0 0 14px rgba(255, 215, 0, 0.3)',
    cardBorder: '1.6px solid rgba(0, 247, 255, 0.85)',
    cardBg: 'radial-gradient(circle at 50% 25%, rgba(0, 247, 255, 0.15) 0%, rgba(255, 215, 0, 0.06) 60%, rgba(8, 14, 42, 0.96) 100%)',
    iconBg: 'rgba(0, 247, 255, 0.22)',
    iconBorder: '1.4px solid rgba(0, 247, 255, 0.85)',
    iconGlow: '0 0 20px rgba(0, 247, 255, 0.65), 0 0 10px rgba(255, 215, 0, 0.45)',
    isGlory: true,
  },
};

interface ShopTabProps {
  cores: number;
  username?: string;
  onClaimSuccess: (coresGranted: number, origin?: { x: number; y: number }) => void;
}

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
  const [isAdminOpen, setIsAdminOpen] = useState(false);
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

  const handleClaimDaily = (e?: React.MouseEvent) => {
    if (!dailyStatus.canCollect || isClaimingDaily) return;
    setIsClaimingDaily(true);
    soundManager.playClick('cyber');

    let originPos: { x: number; y: number } | undefined;
    if (e?.currentTarget) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      originPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    const res = currencyService.claimDailyCores(username);
    if (res.success) {
      setDailyStatus(currencyService.getDailyCollectStatus());
      // Trigger smooth flowing flight animation
      onClaimSuccess(res.amount, originPos);
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

  const selectedMeta = selectedPack ? PACK_META[selectedPack.id] : null;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* ── 1. COUPON VAULT HEADER ────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1 pt-0.5">
        <span className="flex items-center gap-1.5 font-bold">
          <Ticket className="w-3.5 h-3.5" />
          SHOP COUPON VAULT
        </span>
        {isUserAdmin(authService.getCurrentUser()) && (
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer shadow-[0_0_8px_rgba(0,247,255,0.2)] transition-all"
            title="Open Backend Operations Terminal"
          >
            <Database className="w-2.5 h-2.5 text-cyan-400" />
            <span>OPS TERMINAL</span>
          </button>
        )}
      </div>

      {/* ── 2. Clean 2-Column Grid (Daily Free + Shop Packs) ─────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: Daily Free Apex Reward Card (Clean & Simple, White Claim Button with Shine) */}
        <div
          style={{
            backgroundColor: 'rgba(8, 13, 38, 0.94)',
            border: dailyStatus.canCollect
              ? '1.3px solid rgba(0, 247, 255, 0.38)'
              : '1.2px solid rgba(148, 163, 184, 0.25)',
            boxShadow: dailyStatus.canCollect
              ? '0 4px 18px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 247, 255, 0.14)'
              : '0 4px 18px rgba(0, 0, 0, 0.6)',
            borderRadius: '18px',
          }}
          className="p-3.5 flex flex-col items-center justify-between text-center gap-2.5 relative overflow-hidden transition-all duration-200"
        >
          {/* Top Right "FREE" pill badge */}
          <div className="absolute top-2.5 right-2.5">
            <span
              className={`text-[8.5px] font-tech font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 ${
                dailyStatus.canCollect
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40 shadow-[0_0_8px_rgba(0,247,255,0.25)]'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
              }`}
            >
              <Sparkles className="w-2.5 h-2.5 text-cyan-300" />
              <span>FREE</span>
            </span>
          </div>

          <div
            style={{
              backgroundColor: dailyStatus.canCollect
                ? 'rgba(0, 247, 255, 0.12)'
                : 'rgba(100, 116, 139, 0.15)',
              border: dailyStatus.canCollect
                ? '1.2px solid rgba(0, 247, 255, 0.45)'
                : '1.2px solid rgba(100, 116, 139, 0.35)',
              boxShadow: dailyStatus.canCollect
                ? '0 0 12px rgba(0, 247, 255, 0.25)'
                : 'none',
            }}
            className="w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
          >
            <CoreIcon
              size={24}
              glow={dailyStatus.canCollect}
              variant="cyan"
            />
          </div>

          <div className="flex flex-col items-center">
            <span className="font-display font-black text-base text-white tracking-wide">
              +50
            </span>
            <span className="font-tech text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              DAILY APEX
            </span>
          </div>

          {/* Action Button: Clean White Button with "CLAIM" text and smooth continuous shine */}
          {dailyStatus.canCollect ? (
            <button
              type="button"
              onClick={(e) => handleClaimDaily(e)}
              disabled={isClaimingDaily}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 60%, #e2e8f0 100%)',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.25), 0 0 10px rgba(0, 247, 255, 0.2)',
              }}
              className="w-full py-2 px-2 rounded-xl font-tech font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 hover:brightness-105 flex items-center justify-center gap-1.5 shadow-md relative overflow-hidden btn-shine-sweep select-none"
            >
              <Ticket className="w-3.5 h-3.5 stroke-[2.8] text-[#090d1f] relative z-10" />
              <span className="tracking-widest font-black text-[#090d1f] relative z-10">CLAIM</span>
            </button>
          ) : (
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(51, 65, 85, 0.75)',
              }}
              className="w-full py-2 px-2 rounded-xl text-slate-400 font-tech font-bold text-[10.5px] flex items-center justify-center gap-1.5 shadow-inner select-none"
              title={`Daily reward claimed! Next reward in ${formatRemainingTime(dailyStatus.remainingMs)}`}
            >
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="font-mono text-[10.5px] text-cyan-300 font-bold whitespace-nowrap">
                {formatRemainingTime(dailyStatus.remainingMs)}
              </span>
            </div>
          )}
        </div>

        {/* Cards 2-6: Shop Coupon Packs (Clean & Simple with Glory Titan) */}
        {SHOP_PACKS.map((pack) => {
          const meta = PACK_META[pack.id] || PACK_META.starter;

          return (
            <div
              key={pack.id}
              style={{
                backgroundColor: 'rgba(8, 13, 38, 0.94)',
                backgroundImage: meta.cardBg,
                border: meta.cardBorder,
                boxShadow: meta.cardGlow,
                borderRadius: '18px',
              }}
              className="p-3.5 flex flex-col items-center justify-between text-center gap-2.5 relative overflow-hidden transition-all duration-200"
            >
              {/* Core Icon Box */}
              <div
                style={{
                  backgroundColor: meta.iconBg,
                  border: meta.iconBorder,
                  boxShadow: meta.iconGlow,
                }}
                className="w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
              >
                <CoreIcon size={24} glow variant={getPackVariant(pack.id)} />
              </div>

              {/* Amount & Name */}
              <div className="flex flex-col items-center">
                <span
                  className={`font-display font-black text-base tracking-wide ${
                    meta.isGlory ? 'text-white drop-shadow-[0_0_8px_rgba(0,247,255,0.6)]' : 'text-white'
                  }`}
                >
                  +{pack.cores.toLocaleString()}
                </span>
                <span className="font-tech text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {pack.name}
                </span>
              </div>

              {/* Ultra-High Contrast Visible Action Button */}
              <button
                type="button"
                onClick={() => handleOpenClaim(pack)}
                style={{
                  backgroundImage: meta.btnGradient,
                  boxShadow: meta.btnShadow,
                }}
                className={`w-full py-2 px-2 rounded-xl ${meta.btnTextColor} font-tech font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 hover:brightness-110 flex items-center justify-center gap-1.5 shadow-md`}
              >
                <Ticket className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="tracking-widest">CLAIM</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── 3. CLEAN & SIMPLE COUPON GUIDE ───────────────────────────────── */}
      <div
        style={{
          backgroundColor: 'rgba(8, 13, 38, 0.85)',
          border: '1.2px solid rgba(0, 247, 255, 0.22)',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.45)',
          borderRadius: '16px',
        }}
        className="p-3.5 flex items-center gap-3 mt-0.5"
      >
        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,247,255,0.25)]">
          <Ticket className="w-4 h-4 text-cyan-300 stroke-[2.2]" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-tech text-xs font-black text-cyan-300 uppercase tracking-wider">
            HOW TO REDEEM
          </span>
          <p className="text-[11px] text-slate-300 font-ui leading-tight mt-0.5">
            Tap <span className="text-white font-bold">Claim</span> on any pack above and enter your promo code to collect Cores.
          </p>
        </div>
      </div>

      {/* ── 4. COUPON REDEEM MODAL ───────────────────────────────────────── */}
      {selectedPack && selectedMeta && (
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
                <label className="font-tech text-[10px] text-slate-400 uppercase tracking-wider">
                  COUPON CODE:
                </label>
                <input
                  type="text"
                  autoFocus
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
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
                  backgroundImage: selectedMeta.btnGradient,
                  boxShadow: selectedMeta.btnShadow,
                }}
                className={`w-full py-2.5 rounded-xl ${selectedMeta.btnTextColor} font-tech font-black text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 mt-1`}
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="tracking-widest">CLAIM IN SHOP</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Backend Control & Operations Modal */}
      <BackendAdminModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};
