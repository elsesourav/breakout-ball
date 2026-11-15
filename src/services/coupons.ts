/**
 * Coupon Service
 *
 * Handles validation and redemption of promo/coupon codes for Cores currency.
 * Enforces tier matching (e.g. 500 coupon only works on 500 pack).
 */

import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { currencyService } from './currency';

export interface CouponRedeemResult {
  success: boolean;
  coresGranted: number;
  message: string;
}

// Built-in offline fallback demo codes mapped to specific pack tiers
const BUILTIN_PROMO_CODES: Record<string, { cores: number; maxUses: number; packName: string }> = {
  START500: { cores: 500, maxUses: 1, packName: '500 Starter Pack' },
  NEON1000: { cores: 1000, maxUses: 1, packName: '1,000 Power Bundle' },
  CYBER2500: { cores: 2500, maxUses: 1, packName: '2,500 Mega Vault' },
  SUPER5000: { cores: 5000, maxUses: 1, packName: '5,000 Ultra Core' },
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
   * Redeem a coupon code for the given user, requiring match with expected pack cores.
   */
  public async redeemCoupon(
    rawCode: string,
    username?: string,
    expectedCores?: number
  ): Promise<CouponRedeemResult> {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, coresGranted: 0, message: 'Please enter a coupon code' };
    }

    const redeemed = this.getRedeemedCodes();
    if (redeemed.has(code)) {
      return { success: false, coresGranted: 0, message: 'Coupon already redeemed on this device' };
    }

    // 1. Check Cloud Firestore for live coupon code
    try {
      const codeRef = doc(firestoreDb, 'redemption_codes', code);
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        const codeData = codeSnap.data();

        if (codeData.isRedeemed) {
          return { success: false, coresGranted: 0, message: 'Code has already been claimed' };
        }

        let prospectiveCores = codeData.cores || 500;
        if (codeData.couponId) {
          const couponRef = doc(firestoreDb, 'coupons', codeData.couponId);
          const couponSnap = await getDoc(couponRef);
          if (couponSnap.exists() && couponSnap.data().rewardCores) {
            prospectiveCores = couponSnap.data().rewardCores;
          }
        }

        // Tier check: Must match the pack the user is currently claiming
        if (expectedCores && prospectiveCores !== expectedCores) {
          return {
            success: false,
            coresGranted: 0,
            message: `This code is valid for ${prospectiveCores.toLocaleString()} Cores, not this pack.`,
          };
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
            const cSnap = await tx.get(doc(firestoreDb, 'coupons', couponId));
            if (cSnap.exists()) {
              if (cSnap.data().isActive === false) throw new Error('Promotion has ended');
              if (cSnap.data().rewardCores) cores = cSnap.data().rewardCores;
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
    }

    // 2. Offline / Built-in promo code fallback
    const builtIn = BUILTIN_PROMO_CODES[code];
    if (builtIn) {
      // Tier match check
      if (expectedCores && builtIn.cores !== expectedCores) {
        return {
          success: false,
          coresGranted: 0,
          message: `Code '${code}' is only valid for the ${builtIn.packName}.`,
        };
      }

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
      message: 'Invalid coupon code for this pack.',
    };
  }
}

export const couponService = new CouponService();
