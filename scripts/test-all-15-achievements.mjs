import { INITIAL_ACHIEVEMENTS, achievementManager } from '../src/services/achievements.ts';
import { currencyService } from '../src/services/currency.ts';
import { ACHIEVEMENT_CUSTOM_ICONS } from '../src/components/profile/AchievementIcons.tsx';

// Setup mock window and localStorage for headless node execution if needed
if (typeof window === 'undefined') {
  const storage = new Map();
  global.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
  };
  global.window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { search: '', pathname: '/' },
  };
  global.CustomEvent = class CustomEvent {
    constructor(type, detail) {
      this.type = type;
      this.detail = detail;
    }
  };
  global.Event = class Event {
    constructor(type) {
      this.type = type;
    }
  };
}

async function testAllAchievements() {
  console.log('--- TESTING ALL 15 ACHIEVEMENTS & REWARDS ---');

  // Test 1: Count
  console.log(`Total achievements defined: ${INITIAL_ACHIEVEMENTS.length}`);
  if (INITIAL_ACHIEVEMENTS.length !== 15) {
    throw new Error(`Expected 15 achievements, got ${INITIAL_ACHIEVEMENTS.length}`);
  }

  // Test 2: Custom Icons Matching
  for (const ach of INITIAL_ACHIEVEMENTS) {
    if (!ach.coreReward || ach.coreReward <= 0) {
      throw new Error(`Achievement ${ach.id} has invalid coreReward: ${ach.coreReward}`);
    }
    if (!ACHIEVEMENT_CUSTOM_ICONS[ach.id]) {
      throw new Error(`Achievement ${ach.id} does not have a custom SVG icon in ACHIEVEMENT_CUSTOM_ICONS!`);
    }
    console.log(`✓ [${ach.id}] "${ach.title}" -> Reward: +${ach.coreReward} Cores | Custom SVG: OK`);
  }

  // Test 3: Reset
  achievementManager.reset();
  const initialBalance = currencyService.getBalance();
  console.log(`Initial Currency Balance: ${initialBalance}`);

  // Test 4: Restricted context prevents unlock
  achievementManager.setRestrictedContext(true);
  const restrictedUnlock = achievementManager.unlock(INITIAL_ACHIEVEMENTS[0].id);
  if (restrictedUnlock !== null) {
    throw new Error('Restricted context failed to block achievement unlock!');
  }
  achievementManager.setRestrictedContext(false);
  console.log('✓ Restricted context properly protects achievements from unauthorized unlocks');

  // Test 5: Unlock all 15 achievements
  let totalBounty = 0;
  for (const ach of INITIAL_ACHIEVEMENTS) {
    totalBounty += ach.coreReward;
    const unlocked = achievementManager.unlock(ach.id);
    if (!unlocked) {
      throw new Error(`Failed to unlock achievement ${ach.id}`);
    }
  }

  const unlockedCount = achievementManager.getUnlockedCount();
  console.log(`Unlocked achievements count: ${unlockedCount}/15`);
  if (unlockedCount !== 15) {
    throw new Error(`Expected 15 unlocked achievements, got ${unlockedCount}`);
  }

  // Test 6: Claim rewards
  let claimedTotal = 0;
  for (const ach of INITIAL_ACHIEVEMENTS) {
    const claimResult = achievementManager.claimReward(ach.id, 'sourav');
    if (!claimResult.success || claimResult.reward !== ach.coreReward) {
      throw new Error(`Claim failed for ${ach.id}: ${JSON.stringify(claimResult)}`);
    }
    claimedTotal += claimResult.reward;

    // Verify duplicate claim rejected
    const dupResult = achievementManager.claimReward(ach.id, 'sourav');
    if (dupResult.success) {
      throw new Error(`Duplicate claim allowed for ${ach.id}!`);
    }
  }

  const finalBalance = currencyService.getBalance();
  console.log(`Total Cores Claimed: +${claimedTotal} (Expected: ${totalBounty})`);
  console.log(`Final Currency Balance: ${finalBalance}`);
  if (finalBalance !== initialBalance + totalBounty) {
    throw new Error(`Balance mismatch: expected ${initialBalance + totalBounty}, got ${finalBalance}`);
  }

  console.log('--- ALL 15 ACHIEVEMENTS & REWARDS TESTS PASSED PERFECTLY ---');
}

testAllAchievements().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
