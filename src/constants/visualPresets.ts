/**
 * VISUAL DESIGN PRESET CONFIGURATION
 *
 * Streamlined Version Selection:
 *   - BLOCKS (3D & Less Glow):
 *       Option 1: Tactile 3D Ingot (Chiseled Arcade Bevels)
 *       Option 2: Armored 3D Slab (Dual-Tier Chamfered Armor)
 *       Option 3: Tactile 3D Wedge (Sculpted Arcade Keycap)
 *   - PADDLE (Selected Design):
 *       Mech Titan Dreadnought with Dynamic Upgrades (Tier 1 Base, Tier 2 Reinforced, Tier 3 Apex)
 *   - BALL (3D Internal Effects):
 *       Option 1: 3D Energy Core, Option 2: Cyber Gyro Core, Option 3: Apex Singularity
 *   - POWER-UPS (Orbital Core):
 *       Option 1: Orbital Core, Option 2: Gyro Singularity, Option 3: Apex Reactor
 */

export type BlockPresetId = 1 | 2 | 3;
export type PaddlePresetId = 1;
export type PowerUpPresetId = 1 | 2 | 3;
export type BallPresetId = 1 | 2 | 3;

export type PaddleTier = 1 | 2 | 3;
export type BallTier = 1 | 2 | 3;

export interface DesignPresetConfig {
  blockPreset: BlockPresetId;
  paddlePreset: PaddlePresetId;
  powerUpPreset: PowerUpPresetId;
  ballPreset: BallPresetId;
  powerUpScale: number;
  paddleTierOverride?: PaddleTier;
  ballTierOverride?: BallTier;
}

// ── CODE DEFAULT CONFIG ──────────────────────────────────────────────────────
export const CODE_DEFAULT_DESIGN_CONFIG: DesignPresetConfig = {
  blockPreset: 1,     // Option 1: Tactile 3D Ingot (True 3D, Less Glow)
  paddlePreset: 1,    // Selected Mech Titan Dreadnought
  powerUpPreset: 1,   // Orbital Energy Core
  ballPreset: 1,      // 3D Energy Core
  powerUpScale: 1.35, // 1.35x
};

// ── LOCAL STORAGE KEY FOR RUNTIME OVERRIDES ───────────────────────────────────
const STORAGE_KEY = 'breakout_visual_presets_v3';

export const getActiveDesignConfig = (): DesignPresetConfig => {
  if (typeof window === 'undefined') return { ...CODE_DEFAULT_DESIGN_CONFIG };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        blockPreset: ([1, 2, 3].includes(parsed.blockPreset) ? parsed.blockPreset : CODE_DEFAULT_DESIGN_CONFIG.blockPreset) as BlockPresetId,
        paddlePreset: 1, // Only the selected Dreadnought is active
        powerUpPreset: ([1, 2, 3].includes(parsed.powerUpPreset) ? parsed.powerUpPreset : CODE_DEFAULT_DESIGN_CONFIG.powerUpPreset) as PowerUpPresetId,
        ballPreset: ([1, 2, 3].includes(parsed.ballPreset) ? parsed.ballPreset : CODE_DEFAULT_DESIGN_CONFIG.ballPreset) as BallPresetId,
        powerUpScale: typeof parsed.powerUpScale === 'number' ? parsed.powerUpScale : CODE_DEFAULT_DESIGN_CONFIG.powerUpScale,
        paddleTierOverride: parsed.paddleTierOverride,
        ballTierOverride: parsed.ballTierOverride,
      };
    }
  } catch {
    // fallback
  }
  return { ...CODE_DEFAULT_DESIGN_CONFIG };
};

export const setActiveDesignConfig = (config: Partial<DesignPresetConfig>): DesignPresetConfig => {
  const current = getActiveDesignConfig();
  const updated: DesignPresetConfig = { ...current, ...config, paddlePreset: 1 };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('visual-presets-changed', { detail: updated }));
    } catch {
      // ignore
    }
  }
  return updated;
};

export const resetDesignConfigToCodeDefault = (): DesignPresetConfig => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('visual-presets-changed', { detail: CODE_DEFAULT_DESIGN_CONFIG }));
    } catch {
      // ignore
    }
  }
  return { ...CODE_DEFAULT_DESIGN_CONFIG };
};

export const getPaddleTierFromUpgrades = (widthLvl = 1, speedLvl = 1): PaddleTier => {
  const avg = (widthLvl + speedLvl) / 2;
  if (avg >= 5) return 3;
  if (avg >= 3) return 2;
  return 1;
};

export const getBallTierFromUpgrades = (sizeLvl = 1, speedLvl = 1, impactLvl = 1): BallTier => {
  const sum = sizeLvl + speedLvl + impactLvl;
  if (sum >= 10) return 3;
  if (sum >= 5) return 2;
  return 1;
};

// ── MINIMAL CLEAN METADATA ───────────────────────────────────────────────────
export const BLOCK_PRESET_METADATA: Record<BlockPresetId, { name: string; tag: string }> = {
  1: { name: 'OPTION 1: TACTILE 3D INGOT', tag: 'CHISELED BEVELS (NO GLOW)' },
  2: { name: 'OPTION 2: ARMORED 3D SLAB', tag: 'DUAL-TIER SLAB (NO GLOW)' },
  3: { name: 'OPTION 3: TACTILE 3D WEDGE', tag: 'SCULPTED KEYCAP (NO GLOW)' },
};

export const PADDLE_PRESET_METADATA: Record<PaddlePresetId, { name: string; tag: string }> = {
  1: { name: 'MECH TITAN DREADNOUGHT', tag: 'SELECTED BASE (ACTIVE)' },
};

export const BALL_PRESET_METADATA: Record<BallPresetId, { name: string; tag: string }> = {
  1: { name: 'OPTION 1: 3D ENERGY CORE', tag: 'SPHERICAL GLOSS' },
  2: { name: 'OPTION 2: CYBER GYRO CORE', tag: 'INTERNAL RING' },
  3: { name: 'OPTION 3: APEX SINGULARITY', tag: 'VORTEX LENS' },
};

export const POWERUP_PRESET_METADATA: Record<PowerUpPresetId, { name: string; tag: string }> = {
  1: { name: 'OPTION 1: ORBITAL CORE', tag: 'SELECTED BASE' },
  2: { name: 'OPTION 2: GYRO SINGULARITY', tag: 'DUAL GIMBAL' },
  3: { name: 'OPTION 3: APEX REACTOR', tag: 'FLUX SPHERE' },
};
