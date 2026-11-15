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

/** Calculate level completion reward (first-time only). */
export const getLevelReward = (levelNum: number): number =>
  CURRENCY.baseReward + Math.floor(levelNum * CURRENCY.scaleFactor);

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
    symbol: '↔',
    statLabel: (lvl) => `+${lvl * 8}% Width`,
    nextLabel: (lvl) => `+${(lvl + 1) * 8}% Width`,
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
    statLabel: (lvl) => `+${lvl * 10}% Speed`,
    nextLabel: (lvl) => `+${(lvl + 1) * 10}% Speed`,
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
    symbol: '◉',
    statLabel: (lvl) => `+${lvl * 5}% Radius`,
    nextLabel: (lvl) => `+${(lvl + 1) * 5}% Radius`,
  },
  {
    id: 'ball_speed',
    name: 'Ball Speed',
    category: 'ball',
    maxLevel: 10,
    baseCost: 80,
    accentColor: '#00f7ff',
    glowColor: 'rgba(0, 247, 255, 0.4)',
    symbol: '🚀',
    statLabel: (lvl) => `+${lvl * 8}% Velocity`,
    nextLabel: (lvl) => `+${(lvl + 1) * 8}% Velocity`,
  },
  {
    id: 'ball_impact',
    name: 'Impact Power',
    category: 'ball',
    maxLevel: 8,
    baseCost: 90,
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    symbol: '💥',
    statLabel: (lvl) => `+${lvl * 12}% Damage`,
    nextLabel: (lvl) => `+${(lvl + 1) * 12}% Damage`,
  },
];

// ─── Power-Up Upgrades ───────────────────────────────────────────
export const POWER_UPGRADES: UpgradeDef[] = [
  {
    id: 'laser_power',
    name: 'Plasma Cannon',
    category: 'power',
    maxLevel: 8,
    baseCost: 80,
    accentColor: '#ff0055',
    glowColor: 'rgba(255, 0, 85, 0.4)',
    symbol: '▲',
    statLabel: (lvl) => `${(6 + lvl * 1.14).toFixed(1)}s Dur`,
    nextLabel: (lvl) => `${(6 + (lvl + 1) * 1.14).toFixed(1)}s Dur`,
  },
  {
    id: 'mega_power',
    name: 'Mega Core',
    category: 'power',
    maxLevel: 8,
    baseCost: 80,
    accentColor: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    symbol: '✹',
    statLabel: (lvl) => `${(5 + lvl * 1.0).toFixed(1)}s Dur`,
    nextLabel: (lvl) => `${(5 + (lvl + 1) * 1.0).toFixed(1)}s Dur`,
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
    statLabel: (lvl) => `${(4 + lvl * 0.86).toFixed(1)}s Dur`,
    nextLabel: (lvl) => `${(4 + (lvl + 1) * 0.86).toFixed(1)}s Dur`,
  },
  {
    id: 'expand_power',
    name: 'Titan Paddle',
    category: 'power',
    maxLevel: 8,
    baseCost: 70,
    accentColor: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    symbol: '◀▶',
    statLabel: (lvl) => `${(6 + lvl * 1.14).toFixed(1)}s Dur`,
    nextLabel: (lvl) => `${(6 + (lvl + 1) * 1.14).toFixed(1)}s Dur`,
  },
  {
    id: 'multi_power',
    name: 'Multi-Ball',
    category: 'power',
    maxLevel: 5,
    baseCost: 120,
    accentColor: '#00f7ff',
    glowColor: 'rgba(0, 247, 255, 0.4)',
    symbol: '●●',
    statLabel: (lvl) => `+${lvl + 1} Balls`,
    nextLabel: (lvl) => `+${lvl + 2} Balls`,
  },
  {
    id: 'shield_power',
    name: 'Forcefield',
    category: 'power',
    maxLevel: 3,
    baseCost: 200,
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    symbol: '🛡',
    statLabel: (lvl) => `${lvl} Charge${lvl > 1 ? 's' : ''}`,
    nextLabel: (lvl) => `${lvl + 1} Charges`,
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
  { id: 'power', name: 'Power Bundle', cores: 1000, accentColor: '#b773ff', borderColor: 'rgba(183, 115, 255, 0.4)' },
  { id: 'mega', name: 'Mega Vault', cores: 2500, accentColor: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.4)' },
  { id: 'ultra', name: 'Ultra Core', cores: 5000, accentColor: '#ff0055', borderColor: 'rgba(255, 0, 85, 0.4)' },
];
