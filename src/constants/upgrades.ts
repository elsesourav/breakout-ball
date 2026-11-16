/**
 * Upgrade System Constants & Config
 *
 * Defines all upgrade IDs, max levels, base costs, growth rates,
 * stat effect formulas, and currency economy parameters.
 */

// ─── Currency Economy ────────────────────────────────────────────
export const CURRENCY = {
  name: 'Cores',
  symbol: '⬡',
  /** Base reward for completing a level (first time only) */
  baseReward: 40,
  /** Multiplier applied to level number for scaling rewards */
  scaleFactor: 6,
  /** Arena match completion reward range */
  arenaRewardMin: 15,
  arenaRewardMax: 30,
  /** One-time bonus for first-ever arena level clear */
  arenaFirstClearBonus: 25,
  /** Daily bonus per match (first N matches per day) */
  dailyBonusAmount: 10,
  dailyBonusMaxMatches: 3,
} as const;

/** Calculate level completion reward (first-time max pool). */
export const getLevelReward = (levelNum: number): number =>
  CURRENCY.baseReward + Math.floor(levelNum * CURRENCY.scaleFactor);

/**
 * Calculate the cumulative core reward for a level given the stars achieved (1, 2, or 3).
 * - 1 Star (1 heart remaining):  ~33.3% of total core reward
 * - 2 Stars (2 hearts remaining): ~66.7% of total core reward
 * - 3 Stars (3 hearts remaining): 100% of total core reward
 */
export const getLevelRewardForStars = (levelNum: number, stars: number): number => {
  const maxReward = getLevelReward(levelNum);
  if (stars <= 0) return 0;
  if (stars === 1) return Math.round(maxReward * (1 / 3));
  if (stars === 2) return Math.round(maxReward * (2 / 3));
  return maxReward;
};

/** Calculate arena match reward based on performance ratio (0–1). */
export const getArenaReward = (performanceRatio: number): number => {
  const range = CURRENCY.arenaRewardMax - CURRENCY.arenaRewardMin;
  return Math.round(CURRENCY.arenaRewardMin + range * Math.min(1, Math.max(0, performanceRatio)));
};

// ─── Cost Curve ──────────────────────────────────────────────────
const GROWTH_RATE = 1.18;

/** Get the cost to upgrade from current level to next. */
export const getUpgradeCost = (baseCost: number, currentLevel: number): number =>
  Math.round(baseCost * Math.pow(GROWTH_RATE, currentLevel - 1));

/** Get the total cumulative cost to reach a target level from 1. */
export const getCumulativeCost = (baseCost: number, targetLevel: number): number => {
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += getUpgradeCost(baseCost, i);
  }
  return total;
};

/** Get cumulative cost to upgrade across multiple levels from fromLevel to toLevel. */
export const getCostBetweenLevels = (
  baseCost: number,
  fromLevel: number,
  toLevel: number
): number => {
  let total = 0;
  for (let lvl = fromLevel; lvl < toLevel; lvl++) {
    total += getUpgradeCost(baseCost, lvl);
  }
  return total;
};

// ─── Upgrade Definitions ─────────────────────────────────────────
export type UpgradeCategory = 'paddle' | 'ball' | 'power';

export interface UpgradeDef {
  id: string;
  name: string;
  category: UpgradeCategory;
  maxLevel: number;
  baseCost: number;
  accentColor: string;
  glowColor: string;
  /** Unicode symbol for compact display */
  symbol: string;
  /** Stat label function: takes current level, returns display string */
  statLabel: (level: number) => string;
  /** Next stat label */
  nextLabel: (level: number) => string;
}

// ─── Paddle Upgrades ─────────────────────────────────────────────
export const PADDLE_UPGRADES: UpgradeDef[] = [
  {
    id: 'paddle_width',
    name: 'Paddle Width',
    category: 'paddle',
    maxLevel: 8,
    baseCost: 70,
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    symbol: '',
    statLabel: (lvl) => `+${(lvl - 1) * 8}% Width`,
    nextLabel: (lvl) => `+${lvl * 8}% Width`,
  },
  {
    id: 'paddle_speed',
    name: 'Paddle Speed',
    category: 'paddle',
    maxLevel: 8,
    baseCost: 70,
    accentColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    symbol: '⚡',
    statLabel: (lvl) => `${Math.round(800 + (lvl - 1) * (800 / 7))} px/s (${Math.round((lvl - 1) * 14.3)}% Boost)`,
    nextLabel: (lvl) => `${Math.round(800 + lvl * (800 / 7))} px/s (+14.3%)`,
  },
];

// ─── Ball Upgrades ───────────────────────────────────────────────
export const BALL_UPGRADES: UpgradeDef[] = [
  {
    id: 'ball_size',
    name: 'Ball Size',
    category: 'ball',
    maxLevel: 6,
    baseCost: 60,
    accentColor: '#a78bfa',
    glowColor: 'rgba(167, 139, 250, 0.4)',
    symbol: '',
    statLabel: (lvl) => `+${(lvl - 1) * 5}% Radius`,
    nextLabel: (lvl) => `+${lvl * 5}% Radius`,
  },
  {
    id: 'ball_speed',
    name: 'Ball Speed',
    category: 'ball',
    maxLevel: 10,
    baseCost: 80,
    accentColor: '#00f7ff',
    glowColor: 'rgba(0, 247, 255, 0.4)',
    symbol: '',
    statLabel: (lvl) => `+${((lvl - 1) * 3.5).toFixed(1)}% Velocity`,
    nextLabel: (lvl) => `+${(lvl * 3.5).toFixed(1)}% Velocity`,
  },
  {
    id: 'ball_impact',
    name: 'Impact Power',
    category: 'ball',
    maxLevel: 8,
    baseCost: 90,
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    symbol: '',
    statLabel: (lvl) => `+${(lvl - 1) * 12}% Impact`,
    nextLabel: (lvl) => `+${lvl * 12}% Impact`,
  },
  {
    id: 'ball_trajectory',
    name: 'Trajectory Matrix',
    category: 'ball',
    maxLevel: 8,
    baseCost: 75,
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    symbol: '☵',
    statLabel: (lvl) => `${Math.round(600 + (lvl - 1) * (1200 / 7))}px Range`,
    nextLabel: (lvl) => `${Math.round(600 + lvl * (1200 / 7))}px Range`,
  },
];

// ─── Power-Up Upgrades (All Specialize in Active Duration) ──────
export const POWER_UPGRADES: UpgradeDef[] = [
  {
    id: 'expand_power',
    name: 'Titan Paddle',
    category: 'power',
    maxLevel: 10,
    baseCost: 50,
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    symbol: '◀▶',
    statLabel: (lvl) => `${(12.0 + (lvl - 1) * 1.5).toFixed(1)}s Duration`,
    nextLabel: (lvl) => `${(12.0 + lvl * 1.5).toFixed(1)}s Duration`,
  },
  {
    id: 'slowmo_power',
    name: 'Chronos Warp',
    category: 'power',
    maxLevel: 8,
    baseCost: 70,
    accentColor: '#b773ff',
    glowColor: 'rgba(183, 115, 255, 0.4)',
    symbol: '⏱',
    statLabel: (lvl) => `${(4.0 + (lvl - 1) * 0.75).toFixed(1)}s Duration`,
    nextLabel: (lvl) => `${(4.0 + lvl * 0.75).toFixed(1)}s Duration`,
  },
  {
    id: 'laser_power',
    name: 'Plasma Cannon',
    category: 'power',
    maxLevel: 8,
    baseCost: 95,
    accentColor: '#ff0055',
    glowColor: 'rgba(255, 0, 85, 0.4)',
    symbol: '▲',
    statLabel: (lvl) => `${(5.0 + (lvl - 1) * 1.0).toFixed(1)}s Duration`,
    nextLabel: (lvl) => `${(5.0 + lvl * 1.0).toFixed(1)}s Duration`,
  },
  {
    id: 'mega_power',
    name: 'Mega Core',
    category: 'power',
    maxLevel: 6,
    baseCost: 130,
    accentColor: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    symbol: '✹',
    statLabel: (lvl) => `${(5.0 + (lvl - 1) * 1.2).toFixed(1)}s Duration`,
    nextLabel: (lvl) => `${(5.0 + lvl * 1.2).toFixed(1)}s Duration`,
  },
  {
    id: 'multi_power',
    name: 'Multi-Ball',
    category: 'power',
    maxLevel: 5,
    baseCost: 160,
    accentColor: '#00f7ff',
    glowColor: 'rgba(0, 247, 255, 0.4)',
    symbol: '●●',
    statLabel: (lvl) => `${(6.0 + (lvl - 1) * 1.5).toFixed(1)}s Duration`,
    nextLabel: (lvl) => `${(6.0 + lvl * 1.5).toFixed(1)}s Duration`,
  },
  {
    id: 'shield_power',
    name: 'Forcefield',
    category: 'power',
    maxLevel: 4,
    baseCost: 220,
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    symbol: '🛡',
    statLabel: (lvl) => `${(16.0 + (lvl - 1) * (32.0 / 3)).toFixed(1)}s Duration`,
    nextLabel: (lvl) => `${(16.0 + lvl * (32.0 / 3)).toFixed(1)}s Duration`,
  },
];

// ─── All Upgrades Flat Array ─────────────────────────────────────
export const ALL_UPGRADES: UpgradeDef[] = [
  ...PADDLE_UPGRADES,
  ...BALL_UPGRADES,
  ...POWER_UPGRADES,
];

/** Lookup an upgrade definition by ID */
export const getUpgradeDef = (id: string): UpgradeDef | undefined =>
  ALL_UPGRADES.find((u) => u.id === id);

// ─── Default Upgrade State (all at level 1) ──────────────────────
export type UpgradeState = Record<string, number>;

export const DEFAULT_UPGRADE_STATE: UpgradeState = Object.fromEntries(
  ALL_UPGRADES.map((u) => [u.id, 1])
);

// ─── Shop / Coupon Pack Definitions ──────────────────────────────
export interface ShopPack {
  id: string;
  name: string;
  cores: number;
  accentColor: string;
  borderColor: string;
}

export const SHOP_PACKS: ShopPack[] = [
  { id: 'starter', name: 'Starter Pack', cores: 500, accentColor: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' },
  { id: 'power', name: 'Power Bundle', cores: 1000, accentColor: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.45)' },
  { id: 'mega', name: 'Mega Vault', cores: 2500, accentColor: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.4)' },
  { id: 'ultra', name: 'Ultra Core', cores: 5000, accentColor: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.4)' },
  { id: 'titan', name: 'Titan Vault', cores: 10000, accentColor: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' },
];
