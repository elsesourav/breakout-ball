export interface SectorInfo {
  number: string;
  name: string;
  subtitle: string;
  color: string;
  accentGlow: string;
}

export interface RoadmapNode {
  id: number;
  x: number;
  y: number;
  zone: number;
  sector?: SectorInfo;
}

export interface FloatingBrick {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  glow: string;
  rotation: number;
  opacity: number;
}

export type RouteBlockerType = 'firewall' | 'plasma_shield' | 'quantum_gate' | 'titanium_vault' | 'apex_matrix';

export interface RouteBlocker {
  id: string;
  fromLevel: number;
  toLevel: number;
  x: number;
  y: number;
  sector: number;
  type: RouteBlockerType;
  title: string;
  isCleared: boolean;
  isActive: boolean;
}

export type ObstacleType = 'titanium' | 'forcefield' | 'plasma' | 'vault' | 'prism' | 'quantum_orb' | 'mine' | 'solar_core';

export interface Obstacle {
  id: string;
  type: ObstacleType | string;
  x: number;
  y: number;
  sector?: number;
  label?: string;
  locked?: boolean;
}

export const TOTAL_LEVELS = 50;
// Crisp vertical spacing (115px) rendering 6-7 levels full-screen without empty voids
export const SPACING = 115;
export const SVG_WIDTH = 380;
export const BOTTOM_OFFSET = 460;
export const TOP_OFFSET = 340;
export const TOTAL_HEIGHT = (TOTAL_LEVELS - 1) * SPACING + BOTTOM_OFFSET + TOP_OFFSET;

export const SECTOR_CONFIG: Record<number, SectorInfo> = {
  1: {
    number: '01',
    name: 'NEON ALLEY',
    subtitle: 'CLASSIC ENERGY MATRIX',
    color: '#00f7ff',
    accentGlow: 'rgba(0, 247, 255, 0.45)',
  },
  11: {
    number: '02',
    name: 'PULSE GRID',
    subtitle: 'SYNTHWAVE MULTI-STRIKE',
    color: '#818cf8',
    accentGlow: 'rgba(129, 140, 248, 0.45)',
  },
  21: {
    number: '03',
    name: 'QUANTUM VOID',
    subtitle: 'PORTAL WORMHOLE NEXUS',
    color: '#b773ff',
    accentGlow: 'rgba(183, 115, 255, 0.45)',
  },
  31: {
    number: '04',
    name: 'CYBER BASTION',
    subtitle: 'HEAVY ARMOR FORTRESS',
    color: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
  },
  41: {
    number: '05',
    name: 'HYPER CORE',
    subtitle: 'MASTER APEX GAUNTLET',
    color: '#ffd700',
    accentGlow: 'rgba(255, 215, 0, 0.5)',
  },
};

export const getSectorIndex = (levelId: number): number => {
  if (levelId > 40) return 5;
  if (levelId > 30) return 4;
  if (levelId > 20) return 3;
  if (levelId > 10) return 2;
  return 1;
};

