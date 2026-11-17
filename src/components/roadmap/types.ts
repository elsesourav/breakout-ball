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

export const TOTAL_LEVELS = 100;
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
    name: 'DATA FOUNDRY',
    subtitle: 'SYNTHWAVE MULTI-STRIKE',
    color: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
  },
  21: {
    number: '03',
    name: 'QUANTUM CORE',
    subtitle: 'PORTAL WORMHOLE NEXUS',
    color: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
  },
  31: {
    number: '04',
    name: 'CYBER CITADEL',
    subtitle: 'HEAVY ARMOR FORTRESS',
    color: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
  },
  41: {
    number: '05',
    name: 'ORBITAL APEX',
    subtitle: 'HIGH-ORBIT PLATFORM',
    color: '#fbbf24',
    accentGlow: 'rgba(251, 191, 36, 0.5)',
  },
  51: {
    number: '06',
    name: 'CHROME SKYLINE',
    subtitle: 'NEO-TOKYO MEGASTRUCTURE',
    color: '#2dd4bf',
    accentGlow: 'rgba(45, 212, 191, 0.45)',
  },
  61: {
    number: '07',
    name: 'VOID REACTOR',
    subtitle: 'SUB-ATOMIC FISSION LAB',
    color: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.45)',
  },
  71: {
    number: '08',
    name: 'HYPERION GRID',
    subtitle: 'QUANTUM SUPERCOMPUTER',
    color: '#6366f1',
    accentGlow: 'rgba(99, 102, 241, 0.45)',
  },
  81: {
    number: '09',
    name: 'SINGULARITY DEPTHS',
    subtitle: 'EVENT HORIZON GATEWAY',
    color: '#8b5cf6',
    accentGlow: 'rgba(139, 92, 246, 0.45)',
  },
  91: {
    number: '10',
    name: 'OMEGA THRONE',
    subtitle: 'FINAL TRANSCENDENCE APEX',
    color: '#ff0055',
    accentGlow: 'rgba(255, 0, 85, 0.55)',
  },
};

export const getSectorIndex = (levelId: number): number => {
  return Math.max(1, Math.min(10, Math.floor((levelId - 1) / 10) + 1));
};

export const SECTOR_PALETTES: Record<number, Array<{ color: string; glow: string }>> = {
  1: [
    { color: '#00f7ff', glow: 'rgba(0, 247, 255, 0.65)' },
    { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.55)' },
  ],
  2: [
    { color: '#818cf8', glow: 'rgba(129, 140, 248, 0.65)' },
    { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.55)' },
  ],
  3: [
    { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.65)' },
    { color: '#e879f9', glow: 'rgba(232, 121, 249, 0.55)' },
  ],
  4: [
    { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.65)' },
    { color: '#fb7185', glow: 'rgba(251, 113, 133, 0.55)' },
  ],
  5: [
    { color: '#ffd700', glow: 'rgba(255, 215, 0, 0.70)' },
    { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.60)' },
  ],
  6: [
    { color: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.65)' },
    { color: '#14b8a6', glow: 'rgba(20, 184, 166, 0.55)' },
  ],
  7: [
    { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.65)' },
    { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.55)' },
  ],
  8: [
    { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.65)' },
    { color: '#4f46e5', glow: 'rgba(79, 70, 229, 0.55)' },
  ],
  9: [
    { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.65)' },
    { color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.55)' },
  ],
  10: [
    { color: '#ff0055', glow: 'rgba(255, 0, 85, 0.75)' },
    { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.65)' },
  ],
};

export const getRoadmapObstacles = (totalHeight: number, bottomOffset: number, spacing: number): Obstacle[] => [
  { id: 'hazard-1-1', type: 'ion_cell', sector: 1, x: 115, y: totalHeight - bottomOffset - 3.5 * spacing },
  { id: 'hazard-1-2', type: 'cyan_vortex', sector: 1, x: 345, y: totalHeight - bottomOffset - 7.5 * spacing },
  { id: 'hazard-2-1', type: 'sonic_prism', sector: 2, x: 345, y: totalHeight - bottomOffset - 13.5 * spacing },
  { id: 'hazard-2-2', type: 'pulse_core', sector: 2, x: 115, y: totalHeight - bottomOffset - 17.5 * spacing },
  { id: 'hazard-3-1', type: 'quantum_monolith', sector: 3, x: 115, y: totalHeight - bottomOffset - 23.5 * spacing },
  { id: 'hazard-3-2', type: 'void_singularity', sector: 3, x: 345, y: totalHeight - bottomOffset - 27.5 * spacing },
  { id: 'hazard-4-1', type: 'bastion_turret', sector: 4, x: 345, y: totalHeight - bottomOffset - 33.5 * spacing },
  { id: 'hazard-4-2', type: 'molten_core', sector: 4, x: 115, y: totalHeight - bottomOffset - 37.5 * spacing },
  { id: 'hazard-5-1', type: 'solar_relic', sector: 5, x: 115, y: totalHeight - bottomOffset - 43.5 * spacing },
  { id: 'hazard-5-2', type: 'hyper_singularity', sector: 5, x: 345, y: totalHeight - bottomOffset - 47.5 * spacing },
  { id: 'hazard-6-1', type: 'ion_cell', sector: 6, x: 115, y: totalHeight - bottomOffset - 53.5 * spacing },
  { id: 'hazard-6-2', type: 'cyan_vortex', sector: 6, x: 345, y: totalHeight - bottomOffset - 57.5 * spacing },
  { id: 'hazard-7-1', type: 'pulse_core', sector: 7, x: 345, y: totalHeight - bottomOffset - 63.5 * spacing },
  { id: 'hazard-7-2', type: 'void_singularity', sector: 7, x: 115, y: totalHeight - bottomOffset - 67.5 * spacing },
  { id: 'hazard-8-1', type: 'quantum_monolith', sector: 8, x: 115, y: totalHeight - bottomOffset - 73.5 * spacing },
  { id: 'hazard-8-2', type: 'sonic_prism', sector: 8, x: 345, y: totalHeight - bottomOffset - 77.5 * spacing },
  { id: 'hazard-9-1', type: 'hyper_singularity', sector: 9, x: 345, y: totalHeight - bottomOffset - 83.5 * spacing },
  { id: 'hazard-9-2', type: 'void_singularity', sector: 9, x: 115, y: totalHeight - bottomOffset - 87.5 * spacing },
  { id: 'hazard-10-1', type: 'solar_relic', sector: 10, x: 115, y: totalHeight - bottomOffset - 93.5 * spacing },
  { id: 'hazard-10-2', type: 'bastion_turret', sector: 10, x: 345, y: totalHeight - bottomOffset - 97.5 * spacing },
];

