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

export interface Obstacle {
  id: string;
  type: 'titanium' | 'forcefield' | 'plasma';
  x: number;
  y: number;
  label?: string;
  locked?: boolean;
}

export const TOTAL_LEVELS = 30;
export const SPACING = 115;
export const SVG_WIDTH = 360;
export const BOTTOM_OFFSET = 190;
export const TOP_OFFSET = 150;
export const TOTAL_HEIGHT = (TOTAL_LEVELS - 1) * SPACING + BOTTOM_OFFSET + TOP_OFFSET;

export const SECTOR_CONFIG: Record<number, SectorInfo> = {
  1: {
    number: '01',
    name: 'NEON ALLEY',
    subtitle: 'CLASSIC ENERGY MATRIX',
    color: '#00f7ff',
    accentGlow: 'rgba(0, 247, 255, 0.45)',
  },
  7: {
    number: '02',
    name: 'PULSE GRID',
    subtitle: 'SYNTHWAVE MULTI-STRIKE',
    color: '#818cf8',
    accentGlow: 'rgba(129, 140, 248, 0.45)',
  },
  13: {
    number: '03',
    name: 'QUANTUM VOID',
    subtitle: 'PORTAL WORMHOLE NEXUS',
    color: '#b773ff',
    accentGlow: 'rgba(183, 115, 255, 0.45)',
  },
  19: {
    number: '04',
    name: 'CYBER BASTION',
    subtitle: 'HEAVY ARMOR FORTRESS',
    color: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
  },
  25: {
    number: '05',
    name: 'HYPER CORE OVERDRIVE',
    subtitle: 'MASTER APEX GAUNTLET',
    color: '#ffd700',
    accentGlow: 'rgba(255, 215, 0, 0.5)',
  },
};
