import { LevelData } from '../../types/game';
export * from './types';

export * from './levels-01-10';
import { levels01to10 } from './levels-01-10';
export * from './levels-11-20';
import { levels11to20 } from './levels-11-20';
export * from './levels-21-30';
import { levels21to30 } from './levels-21-30';
export * from './levels-31-40';
import { levels31to40 } from './levels-31-40';
export * from './levels-41-50';
import { levels41to50 } from './levels-41-50';
export * from './levels-51-60';
import { levels51to60 } from './levels-51-60';
export * from './levels-61-70';
import { levels61to70 } from './levels-61-70';
export * from './levels-71-80';
import { levels71to80 } from './levels-71-80';
export * from './levels-81-90';
import { levels81to90 } from './levels-81-90';
export * from './levels-91-100';
import { levels91to100 } from './levels-91-100';

/**
 * Complete 100-Level Progressive Cyber Breakout Suite across 10 Sectors:
 * Sector 01 (L01 - L10): Neon Alley (Classic Energy Matrix)
 * Sector 02 (L11 - L20): Data Foundry (Synthwave Multi-Strike)
 * Sector 03 (L21 - L30): Quantum Core (Portal Wormhole Nexus)
 * Sector 04 (L31 - L40): Cyber Citadel (Heavy Armor Fortress)
 * Sector 05 (L41 - L50): Orbital Apex (High-Orbit Platform)
 * Sector 06 (L51 - L60): Chrome Skyline (Neo-Tokyo Megastructure)
 * Sector 07 (L61 - L70): Void Reactor (Sub-Atomic Fission Lab)
 * Sector 08 (L71 - L80): Hyperion Grid (Quantum Supercomputer)
 * Sector 09 (L81 - L90): Singularity Depths (Event Horizon Gateway)
 * Sector 10 (L91 - L100): Omega Throne (Final Transcendence Apex)
 */
export const INITIAL_LOCAL_LEVELS: LevelData[] = [
  ...levels01to10,
  ...levels11to20,
  ...levels21to30,
  ...levels31to40,
  ...levels41to50,
  ...levels51to60,
  ...levels61to70,
  ...levels71to80,
  ...levels81to90,
  ...levels91to100,
];
