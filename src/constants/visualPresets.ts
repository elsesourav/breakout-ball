/**
 * FINAL LOCKED VISUAL DESIGN PRESET CONFIGURATION
 *
 * Final Selected Assets Applied Across Whole Game:
 *   - PADDLE: Mech Titan Dreadnought with Integrated Rail Turrets (Tiers 1-3).
 *   - BALL: 3D Stardust Core with Internal Sparks & Zero Outside Particles (Tiers 1-3).
 *   - BLOCKS: Armored 3D Slab with Tone-Matched 3D Bevels & Static Titanium.
 *   - PORTAL BLOCK: Hex Cyber Aperture (Dimensional Iris Gate).
 *   - POWER-UPS: Planar Delta Vortex (Transparent Rotating Triangle + Orbiting Sparks).
 */

export type BlockPresetId = 1;
export type PaddlePresetId = 1;
export type TopWeaponVariant = 1 | 2 | 3 | 4;
export type PowerUpPresetId = 1;
export type BallPresetId = 1;
export type PortalCenterStyle = 3;

export type PaddleTier = 1 | 2 | 3;
export type BallTier = 1 | 2 | 3;

export interface DesignPresetConfig {
  blockPreset: BlockPresetId;
  paddlePreset: PaddlePresetId;
  paddleWeaponVariant?: TopWeaponVariant;
  powerUpPreset: PowerUpPresetId;
  ballPreset: BallPresetId;
  portalCenterStyle: PortalCenterStyle;
  powerUpScale: number;
  paddleTierOverride?: PaddleTier;
  ballTierOverride?: BallTier;
}

export const CODE_DEFAULT_DESIGN_CONFIG: DesignPresetConfig = {
  blockPreset: 1,           // Armored 3D Slab
  paddlePreset: 1,          // Mech Titan Dreadnought with Integrated Rail Turrets
  powerUpPreset: 1,         // Planar Delta Vortex (Transparent Rotating Triangle)
  ballPreset: 1,            // 3D Stardust Core (Internal Sparks, Zero Outside)
  portalCenterStyle: 3,     // Hex Cyber Aperture
  powerUpScale: 1.35,       // 1.35x
};

export const getActiveDesignConfig = (): DesignPresetConfig => {
  return { ...CODE_DEFAULT_DESIGN_CONFIG };
};

export const setActiveDesignConfig = (config: Partial<DesignPresetConfig>): DesignPresetConfig => {
  const current = getActiveDesignConfig();
  const updated: DesignPresetConfig = { ...current, ...config, paddlePreset: 1 };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('breakout_visual_presets_v4', JSON.stringify(updated));
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
      localStorage.removeItem('breakout_visual_presets_v4');
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

export const BLOCK_PRESET_METADATA: Record<BlockPresetId, { name: string; tag: string }> = {
  1: { name: 'ARMORED 3D SLAB', tag: 'TONE-MATCHED BEVELS · 100% STATIC TITANIUM' },
};

export const PORTAL_CENTER_METADATA: Record<PortalCenterStyle, { name: string; tag: string }> = {
  3: { name: 'HEX CYBER APERTURE', tag: 'DIMENSIONAL IRIS GATE' },
};

export const PADDLE_PRESET_METADATA: Record<PaddlePresetId, { name: string; tag: string }> = {
  1: { name: 'MECH TITAN DREADNOUGHT', tag: 'INTEGRATED RAIL TURRETS' },
};

export const WEAPON_MOUNT_METADATA: Record<TopWeaponVariant, { name: string; tag: string }> = {
  1: { name: 'INTEGRATED RAIL TURRETS', tag: 'ANGLED ACCELERATOR RAILS' },
  2: { name: 'TWIN HEX MISSILE PODS', tag: 'HONEYCOMB LAUNCH CELLS' },
  3: { name: 'AERODYNAMIC PLASMA BLASTERS', tag: 'FORWARD STRIKE COWLING' },
  4: { name: 'CONCEALED STEALTH EMITTERS', tag: 'CLEAN FLUSH TOP' },
};

export const BALL_PRESET_METADATA: Record<BallPresetId, { name: string; tag: string }> = {
  1: { name: '3D STARDUST CORE', tag: 'INTERNAL SPARKS · ZERO OUTSIDE' },
};

export const POWERUP_PRESET_METADATA: Record<PowerUpPresetId, { name: string; tag: string }> = {
  1: { name: 'PLANAR DELTA VORTEX', tag: 'TRANSPARENT 2D ROTATING TRIANGLE + ORBITING COMETS' },
};
