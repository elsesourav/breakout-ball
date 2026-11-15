/**
 * Coupon Service
 *
 * Handles validation and redemption of promo/coupon codes for Cores currency.
 * Integrates directly with Cloud Firestore 'redemption_codes' and 'coupons'
 * with atomic transactions and offline fallback for built-in test codes.
 */

import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { currencyService } from './currency';

export interface CouponRedeemResult {
  success: boolean;
  coresGranted: number;
  message: string;
}

// Built-in offline fallback demo codes so game is immediately playable offline
const BUILTIN_PROMO_CODES: Record<string, { cores: number; maxUses: number }> = {
  START500: { cores: 500, maxUses: 1 },
  NEON1000: { cores: 1000, maxUses: 1 },
  CYBER2500: { cores: 2500, maxUses: 1 },
  SUPER5000: { cores: 5000, maxUses: 1 },
};

const USER_REDEMPTIONS_KEY = 'breakout_user_redemptions';

class CouponService {
  private getRedeemedCodes(): Set<string> {
    try {
      const raw = localStorage.getItem(USER_REDEMPTIONS_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private markCodeRedeemed(code: string): void {
    try {
      const set = this.getRedeemedCodes();
      set.add(code.toUpperCase());
      localStorage.setItem(USER_REDEMPTIONS_KEY, JSON.stringify([...set]));
    } catch {}
  }

  /**
   * Redeem a coupon code for the given user.
   */
  public async redeemCoupon(rawCode: string, username?: string): Promise<CouponRedeemResult> {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, coresGranted: 0, message: 'Please enter a coupon code' };
    }

    const redeemed = this.getRedeemedCodes();
    if (redeemed.has(code)) {
      return { success: false, coresGranted: 0, message: 'Coupon already redeemed on this device' };
    }

    // 1. First check Cloud Firestore for live coupon code
    try {
      const codeRef = doc(firestoreDb, 'redemption_codes', code);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        const codeData = codeSnap.data();

        if (codeData.isRedeemed) {
          return { success: false, coresGranted: 0, message: 'Code has already been claimed' };
        }

        // Run transaction to claim code
        const reward = await runTransaction(firestoreDb, async (tx) => {
          const freshSnap = await tx.get(codeRef);
          if (!freshSnap.exists() || freshSnap.data().isRedeemed) {
            throw new Error('Code already used');
          }

          const couponId = freshSnap.data().couponId;
          let cores = freshSnap.data().cores || 500;

          if (couponId) {
            const couponRef = doc(firestoreDb, 'coupons', couponId);
            const couponSnap = await tx.get(couponRef);
            if (couponSnap.exists()) {
              const cData = couponSnap.data();
              if (cData.isActive === false) throw new Error('Promotion has ended');
              if (cData.rewardCores) cores = cData.rewardCores;
            }
          }

          tx.update(codeRef, {
            isRedeemed: true,
            redeemedBy: username || 'anonymous',
            redeemedAt: new Date().toISOString(),
          });

          return cores;
        });

        currencyService.addCores(reward, username);
        this.markCodeRedeemed(code);
        return {
          success: true,
          coresGranted: reward,
          message: `Success! Granted +${reward.toLocaleString()} Cores`,
        };
      }
    } catch (err: any) {
      if (err?.message?.includes('already used') || err?.message?.includes('ended')) {
        return { success: false, coresGranted: 0, message: err.message };
      }
      // Firestore offline or collection empty -> fall through to built-in promo codes
    }

    // 2. Offline / Built-in promo code fallback
    const builtIn = BUILTIN_PROMO_CODES[code];
    if (builtIn) {
      currencyService.addCores(builtIn.cores, username);
      this.markCodeRedeemed(code);
      return {
        success: true,
        coresGranted: builtIn.cores,
        message: `Promo Activated! +${builtIn.cores.toLocaleString()} Cores granted`,
      };
    }

    return {
      success: false,
      coresGranted: 0,
      message: 'Invalid coupon code. Please check and try again.',
    };
  }
}

export const couponService = new CouponService();
