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

// Cryptographic SHA-256 digest of master override authorization key
// Kept as a one-way hash so plain authorization keys are never exposed in client bundles or UI
const MASTER_KEY_DIGEST = '4290052b68aaed1bfc5808a104d3162047e1c5c20ae9f295cb81aab73837fd67';
const MULTI_REDEEM_STORAGE_KEY = '_bb_core_priv_mode';
const USER_REDEMPTIONS_KEY = 'breakout_user_redemptions';

/** Fast asynchronous SHA-256 digest computation using Web Crypto API */
async function computeSha256(value: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(value);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {}
  return '';
}

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

    // ── 1. Cryptographic Master Override Code Verification ──
    const codeDigest = await computeSha256(code);
    const isMasterCode = codeDigest === MASTER_KEY_DIGEST;

    if (isMasterCode) {
      // Unlock unlimited multi-use for all valid coupons
      this.setMultiUseActive(true, username);

      // Reward amount matches selected pack (or 10,000 if not specified)
      const grantCores = expectedCores || 10000;
      currencyService.addCores(grantCores, username);

      // Also register or touch in Firestore if connected
      try {
        const masterRef = doc(firestoreDb, 'redemption_codes', code);
        await setDoc(masterRef, {
          isMasterCode: true,
          multiUse: true,
          lastRedeemedBy: username || 'anonymous',
          lastRedeemedAt: new Date().toISOString(),
          redeemCount: increment(1),
        }, { merge: true });
      } catch {}

      return {
        success: true,
        coresGranted: grantCores,
        message: `Override Accepted! +${grantCores.toLocaleString()} Cores granted`,
      };
    }

    // ── 2. Local One-Time Enforcement ──
    if (!isMultiUse) {
      const redeemed = this.getRedeemedCodes();
      if (redeemed.has(code)) {
        return { success: false, coresGranted: 0, message: 'Coupon already redeemed on this device' };
      }
    }

    // ── 2.5. Dedicated Backend Microservice Validation & Redemption ──
    try {
      const apiRes = await backendApi.redeemCoupon(code, username || 'player', expectedCores || 0);
      if (apiRes.success && apiRes.coresGranted) {
        currencyService.addCores(apiRes.coresGranted, 'shop_coupon');
        if (!isMultiUse) {
          this.markCodeRedeemed(code);
        }
        return {
          success: true,
          coresGranted: apiRes.coresGranted,
          message: apiRes.message || `Coupon Claimed! +${apiRes.coresGranted.toLocaleString()} Cores`,
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
        let prospectiveCores = data.cores || data.rewardCores || data.amount || data.value || expectedCores || 500;
        if (data.couponId) {
          try {
            const parentCoupon = await getDoc(doc(firestoreDb, 'coupons', data.couponId));
            if (parentCoupon.exists()) {
              if (parentCoupon.data().isActive === false) {
                return { success: false, coresGranted: 0, message: 'Promotion has ended' };
              }
              if (parentCoupon.data().rewardCores) {
                prospectiveCores = parentCoupon.data().rewardCores;
              }
            }
          } catch {}
        }

        // Pack tier validation: Must match the pack currently being claimed
        if (expectedCores && prospectiveCores !== expectedCores) {
          return {
            success: false,
            coresGranted: 0,
            message: `This coupon is for ${prospectiveCores.toLocaleString()} Cores, not this pack.`,
          };
        }

        // ── Single-Use vs Multi-Use Logic ──
        if (isMultiUse || data.multiUse === true || data.allowMultiple === true) {
          // Multi-use mode active: Grant cores and allow repeated redemptions
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
            message: `Coupon Claimed! +${prospectiveCores.toLocaleString()} Cores`,
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
            message: `Success! Granted +${reward.toLocaleString()} Cores`,
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
