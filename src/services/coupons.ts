/**
 * Coupon Service
 *
 * Handles validation and redemption of promo/coupon codes for Cores currency.
 * Enforces tier matching (e.g. 500 coupon only works on 500 pack).
 * Validates against Cloud Firestore backend ('redemption_codes' & 'coupons').
 * All backend coupons are strictly one-time use per user.
 * Supports Master Key validation with multi-use unlock and cloud verification.
 */

import { doc, getDoc, setDoc, runTransaction, increment } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { currencyService } from './currency';
import { backendApi } from './backendApi';

export interface CouponRedeemResult {
  success: boolean;
  coresGranted: number;
  message: string;
}

const MULTI_REDEEM_STORAGE_KEY = '_bb_core_priv_mode';
const USER_REDEMPTIONS_KEY = 'breakout_user_redemptions';

class CouponService {
  private multiUseActive = false;

  constructor() {
    this.initMultiUseState();
  }

  private initMultiUseState(): void {
    try {
      const flag = localStorage.getItem(MULTI_REDEEM_STORAGE_KEY);
      if (flag === '1' || flag === 'true') {
        this.multiUseActive = true;
      }
    } catch {}
  }

  /** Check if multi-use mode has been unlocked */
  public isMultiUseActive(): boolean {
    if (this.multiUseActive) return true;
    try {
      return localStorage.getItem(MULTI_REDEEM_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  /** Set multi-use mode and persist locally and to Firestore */
  public setMultiUseActive(active: boolean, username?: string): void {
    this.multiUseActive = active;
    try {
      if (active) {
        localStorage.setItem(MULTI_REDEEM_STORAGE_KEY, '1');
      } else {
        localStorage.removeItem(MULTI_REDEEM_STORAGE_KEY);
      }
    } catch {}

    // Synchronize privilege to Firestore user record if connected
    if (active && username && username !== 'anonymous') {
      const userDocRef = doc(firestoreDb, 'users', username.toLowerCase());
      setDoc(userDocRef, {
        multiUseCoupons: true,
        masterPrivilegeAt: new Date().toISOString(),
      }, { merge: true }).catch(() => {});
    }
  }

  /** Sync cloud privileges for user */
  public async syncUserPrivileges(username?: string): Promise<void> {
    if (!username || username === 'anonymous') return;
    try {
      const userSnap = await getDoc(doc(firestoreDb, 'users', username.toLowerCase()));
      if (userSnap.exists() && userSnap.data()?.multiUseCoupons === true) {
        this.setMultiUseActive(true);
      }
    } catch {}
  }

  private getRedeemedCodes(): Set<string> {
    try {
      const raw = localStorage.getItem(USER_REDEMPTIONS_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private markCodeRedeemed(code: string): void {
    // If multi-use is active, never lock out the code locally
    if (this.isMultiUseActive()) return;

    try {
      const set = this.getRedeemedCodes();
      set.add(code.toUpperCase());
      localStorage.setItem(USER_REDEMPTIONS_KEY, JSON.stringify([...set]));
    } catch {}
  }

  /**
   * Redeem a coupon code for the given user, requiring match with expected pack cores.
   * All backend coupons are 1-time use by default unless master override is active.
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

    // Sync cloud privileges if username is known
    if (username) {
      await this.syncUserPrivileges(username).catch(() => {});
    }

    const isMultiUse = this.isMultiUseActive();

    // ── 1. Local One-Time Enforcement ──
    if (!isMultiUse) {
      const redeemed = this.getRedeemedCodes();
      if (redeemed.has(code)) {
        return { success: false, coresGranted: 0, message: 'Coupon already redeemed on this device' };
      }
    }

    // ── 2. Dedicated Backend Microservice Validation & Redemption ──
    try {
      const apiRes = await backendApi.redeemCoupon(code, username || 'player', expectedCores || 0);
      if (apiRes.success && apiRes.coresGranted !== undefined) {
        currencyService.addCores(apiRes.coresGranted, username);
        if (!isMultiUse) {
          this.markCodeRedeemed(code);
        }
        const displayMsg = apiRes.message || (apiRes.coresGranted >= 0
          ? `Coupon Claimed! +${apiRes.coresGranted.toLocaleString()} Cores`
          : `Balance Adjusted: ${apiRes.coresGranted.toLocaleString()} Cores`);
        return {
          success: true,
          coresGranted: apiRes.coresGranted,
          message: displayMsg,
        };
      } else if (!apiRes.success && apiRes.message && !apiRes.message.includes('Server unavailable') && !apiRes.message.includes('Network error')) {
        return {
          success: false,
          coresGranted: 0,
          message: apiRes.message,
        };
      }
    } catch {}

    // ── 3. Cloud Firestore Validation (queries 'redemption_codes' & 'coupons') ──
    try {
      let codeRef = doc(firestoreDb, 'redemption_codes', code);
      let snap = await getDoc(codeRef);

      if (!snap.exists()) {
        // Fallback check to 'coupons' collection
        codeRef = doc(firestoreDb, 'coupons', code);
        snap = await getDoc(codeRef);
      }

      if (snap.exists()) {
        const data = snap.data();

        // Check if coupon is marked inactive
        if (data.isActive === false) {
          return { success: false, coresGranted: 0, message: 'Coupon has expired or is inactive' };
        }

        // Determine reward cores from doc
        let prospectiveCores = Number(data.cores ?? data.rewardCores ?? data.amount ?? data.value ?? expectedCores ?? 500);
        if (data.couponId) {
          try {
            const parentCoupon = await getDoc(doc(firestoreDb, 'coupons', data.couponId));
            if (parentCoupon.exists()) {
              if (parentCoupon.data().isActive === false) {
                return { success: false, coresGranted: 0, message: 'Promotion has ended' };
              }
              if (parentCoupon.data().rewardCores !== undefined) {
                prospectiveCores = Number(parentCoupon.data().rewardCores);
              }
            }
          } catch {}
        }

        // Pack tier validation: If calibrated for a specific pack (>0), must match
        const couponPack = Number(data.packCores ?? data.pack_cores ?? 0);
        if (couponPack > 0 && expectedCores && couponPack !== expectedCores) {
          return {
            success: false,
            coresGranted: 0,
            message: `This coupon is calibrated for ${couponPack.toLocaleString()} Cores packs.`,
          };
        }

        const successMsg = prospectiveCores >= 0
          ? `Coupon Claimed! +${prospectiveCores.toLocaleString()} Cores`
          : `Balance Adjusted: ${prospectiveCores.toLocaleString()} Cores`;

        // ── Single-Use vs Multi-Use Logic ──
        if (isMultiUse || data.multiUse === true || data.allowMultiple === true) {
          // Multi-use mode active: Grant or adjust cores
          currencyService.addCores(prospectiveCores, username);

          // Update telemetry in Firestore
          setDoc(codeRef, {
            lastRedeemedBy: username || 'anonymous',
            lastRedeemedAt: new Date().toISOString(),
            redeemCount: increment(1),
          }, { merge: true }).catch(() => {});

          return {
            success: true,
            coresGranted: prospectiveCores,
            message: successMsg,
          };
        } else {
          // Normal 1-time enforcement: Check if already redeemed in Firestore
          if (data.isRedeemed) {
            return { success: false, coresGranted: 0, message: 'Code has already been claimed' };
          }

          // Atomic Firestore transaction to claim code exactly once
          const reward = await runTransaction(firestoreDb, async (tx) => {
            const freshSnap = await tx.get(codeRef);
            if (!freshSnap.exists() || freshSnap.data().isRedeemed) {
              throw new Error('Code already used');
            }

            tx.update(codeRef, {
              isRedeemed: true,
              redeemedBy: username || 'anonymous',
              redeemedAt: new Date().toISOString(),
              redeemCount: increment(1),
            });

            return prospectiveCores;
          });

          currencyService.addCores(reward, username);
          this.markCodeRedeemed(code);

          return {
            success: true,
            coresGranted: reward,
            message: successMsg,
          };
        }
      }
    } catch (err: any) {
      if (err?.message?.includes('already used') || err?.message?.includes('ended')) {
        return { success: false, coresGranted: 0, message: err.message };
      }
    }

    // No built-in test codes: If not in Firestore and not master override, reject cleanly
    return {
      success: false,
      coresGranted: 0,
      message: 'Invalid coupon code for this pack.',
    };
  }
}

export const couponService = new CouponService();
