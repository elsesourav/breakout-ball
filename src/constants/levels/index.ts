import { LevelData } from '../../types/game';
export * from './types';

export * from './levels-01-05';
import { levels01to05 } from './levels-01-05';
export * from './levels-06-10';
import { levels06to10 } from './levels-06-10';
export * from './levels-11-15';
import { levels11to15 } from './levels-11-15';
export * from './levels-16-20';
import { levels16to20 } from './levels-16-20';
export * from './levels-21-25';
import { levels21to25 } from './levels-21-25';
export * from './levels-26-30';
import { levels26to30 } from './levels-26-30';
export * from './levels-31-35';
import { levels31to35 } from './levels-31-35';
export * from './levels-36-40';
import { levels36to40 } from './levels-36-40';
export * from './levels-41-45';
import { levels41to45 } from './levels-41-45';
export * from './levels-46-50';
import { levels46to50 } from './levels-46-50';

/**
 * Complete 50-Level Progressive Cyber Breakout Suite across 5 Sectors:
 * Sector 01 (L01 - L10): Neon Alley (Introductory & Classic Energy Matrix)
 * Sector 02 (L11 - L20): Pulse Grid (Kinetic Multi-Strike & EMP Chains)
 * Sector 03 (L21 - L30): Quantum Void (Portal Wormhole Nexus & Dynamic Traps)
 * Sector 04 (L31 - L40): Cyber Bastion (Heavy Titanium Armor & Fortresses)
 * Sector 05 (L41 - L50): Hyper Core Overdrive (Master Apex Reactors & Climax Bosses)
 */
export const INITIAL_LOCAL_LEVELS: LevelData[] = [
  ...levels01to05,
  ...levels06to10,
  ...levels11to15,
  ...levels16to20,
  ...levels21to25,
  ...levels26to30,
  ...levels31to35,
  ...levels36to40,
  ...levels41to45,
  ...levels46to50,
];
