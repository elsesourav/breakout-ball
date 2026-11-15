import React, { useState } from 'react';
import { Ticket, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SHOP_PACKS, ShopPack } from '../../constants/upgrades';
import { couponService } from '../../services/coupons';
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

export const ShopTab: React.FC<ShopTabProps> = ({ username, onClaimSuccess }) => {
  const [selectedPack, setSelectedPack] = useState<ShopPack | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  const handleOpenClaim = (pack: ShopPack) => {
    soundManager.play('click');
    setSelectedPack(pack);
    setCouponCode('');
    setStatus('idle');
    setStatusMsg('');
  };

  const handleCloseModal = () => {
    setSelectedPack(null);
    setCouponCode('');
    setStatus('idle');
    setStatusMsg('');
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !selectedPack) return;

    setStatus('loading');
    soundManager.play('click');

    // Enforce tier match: 500 coupon only works on 500 pack
    const res = await couponService.redeemCoupon(couponCode, username, selectedPack.cores);

    if (res.success) {
      soundManager.play('win');
      setStatus('success');
      setStatusMsg(res.message);
      onClaimSuccess(res.coresGranted);
      setTimeout(() => {
        handleCloseModal();
      }, 2700);
    } else {
      soundManager.play('damage');
      setStatus('error');
      setStatusMsg(res.message);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-tech text-amber-400 uppercase tracking-wider px-1 pt-1">
        <span className="flex items-center gap-1.5 font-bold">
          <Ticket className="w-3.5 h-3.5" />
          SHOP COUPON VAULT
        </span>
        <span className="text-[10px] text-slate-400">REDEEM CODES</span>
      </div>

      {/* 2-Column Grid */}
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
      <div className="p-3 rounded-xl bg-[#080d26]/80 border border-cyan-500/20 flex items-center gap-2.5 mt-1">
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
