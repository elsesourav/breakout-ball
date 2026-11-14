import { LevelData } from '../types/game';

/**
 * 30 Progressive Themed Levels across 5 Cyber Sectors:
 * Sector 01 (L01 - L06): Neon Alley (Fundamentals & Portals)
 * Sector 02 (L07 - L12): Pulse Grid (EMP Bombs & Kinetic Chaos)
 * Sector 03 (L13 - L18): Quantum Void (Wormholes & Spatial Puzzles)
 * Sector 04 (L19 - L24): Cyber Bastion (Fortresses & Heavy Armor)
 * Sector 05 (L25 - L30): Hyper Core Overdrive (Master Apex Reactor)
 */

export const INITIAL_LOCAL_LEVELS: LevelData[] = [
  // ==========================================
  // SECTOR 01: NEON ALLEY (Levels 01 - 06)
  // ==========================================
  {
    id: '1',
    name: 'Level 1: Genesis',
    creator: 'sourav',
    playCount: 1420,
    blocks: [
      { x: 1, y: 2, h: 1 }, { x: 2, y: 2, h: 1 }, { x: 3, y: 2, h: 1 }, { x: 4, y: 2, h: 1 }, { x: 5, y: 2, h: 1 }, { x: 6, y: 2, h: 1 }, { x: 7, y: 2, h: 1 },
      { x: 2, y: 3, h: 2 }, { x: 3, y: 3, h: 2 }, { x: 4, y: 3, h: 2 }, { x: 5, y: 3, h: 2 }, { x: 6, y: 3, h: 2 },
      { x: 3, y: 4, h: 3 }, { x: 4, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ],
  },
  {
    id: '2',
    name: 'Level 2: Twin Pillars',
    creator: 'sourav',
    playCount: 980,
    blocks: [
      { x: 1, y: 1, h: 2 }, { x: 1, y: 2, h: 2 }, { x: 1, y: 3, h: 2 }, { x: 1, y: 4, h: 2 },
      { x: 7, y: 1, h: 2 }, { x: 7, y: 2, h: 2 }, { x: 7, y: 3, h: 2 }, { x: 7, y: 4, h: 2 },
      { x: 3, y: 2, h: 1 }, { x: 4, y: 2, h: 3 }, { x: 5, y: 2, h: 1 },
      { x: 3, y: 3, h: 4 }, { x: 4, y: 3, h: 5 }, { x: 5, y: 3, h: 4 },
      { x: 4, y: 4, h: 6 },
    ],
  },
  {
    id: '3',
    name: 'Level 3: Diamond Core',
    creator: 'sourav',
    playCount: 820,
    blocks: [
      { x: 4, y: 1, h: 5 },
      { x: 3, y: 2, h: 4 }, { x: 5, y: 2, h: 4 },
      { x: 2, y: 3, h: 3 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 3 },
      { x: 3, y: 4, h: 2 }, { x: 5, y: 4, h: 2 },
      { x: 4, y: 5, h: 1 },
    ],
  },
  {
    id: '4',
    name: 'Level 4: Quantum Gateway',
    creator: 'sourav',
    playCount: 740,
    blocks: [
      { x: 1, y: 1, h: 7 }, // Portal Alpha
      { x: 7, y: 1, h: 7 }, // Portal Beta
      { x: 2, y: 2, h: 2 }, { x: 3, y: 2, h: 3 }, { x: 4, y: 2, h: 3 }, { x: 5, y: 2, h: 3 }, { x: 6, y: 2, h: 2 },
      { x: 2, y: 3, h: 6 }, { x: 3, y: 3, h: 4 }, { x: 4, y: 3, h: 5 }, { x: 5, y: 3, h: 4 }, { x: 6, y: 3, h: 6 },
      { x: 3, y: 4, h: 1 }, { x: 4, y: 4, h: 2 }, { x: 5, y: 4, h: 1 },
    ],
  },
  {
    id: '5',
    name: 'Level 5: Checkered Maze',
    creator: 'sourav',
    playCount: 610,
    blocks: [
      { x: 0, y: 1, h: 3 }, { x: 2, y: 1, h: 3 }, { x: 4, y: 1, h: 3 }, { x: 6, y: 1, h: 3 }, { x: 8, y: 1, h: 3 },
      { x: 1, y: 2, h: 2 }, { x: 3, y: 2, h: 2 }, { x: 5, y: 2, h: 2 }, { x: 7, y: 2, h: 2 },
      { x: 0, y: 3, h: 4 }, { x: 2, y: 3, h: 6 }, { x: 4, y: 3, h: 4 }, { x: 6, y: 3, h: 6 }, { x: 8, y: 3, h: 4 },
      { x: 1, y: 4, h: 1 }, { x: 3, y: 4, h: 5 }, { x: 5, y: 4, h: 5 }, { x: 7, y: 4, h: 1 },
    ],
  },
  {
    id: '6',
    name: 'Level 6: Shielded Core',
    creator: 'sourav',
    playCount: 520,
    blocks: [
      { x: 2, y: 1, h: 6 }, { x: 3, y: 1, h: 6 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 6, y: 1, h: 6 },
      { x: 2, y: 2, h: 6 }, { x: 3, y: 2, h: 5 }, { x: 4, y: 2, h: 5 }, { x: 5, y: 2, h: 5 }, { x: 6, y: 2, h: 6 },
      { x: 2, y: 3, h: 6 }, { x: 3, y: 3, h: 4 }, { x: 4, y: 3, h: 5 }, { x: 5, y: 3, h: 4 }, { x: 6, y: 3, h: 6 },
      { x: 1, y: 4, h: 1 }, { x: 2, y: 4, h: 2 }, { x: 6, y: 4, h: 2 }, { x: 7, y: 4, h: 1 },
    ],
  },

  // ==========================================
  // SECTOR 02: PULSE GRID (Levels 07 - 12)
  // ==========================================
  {
    id: '7',
    name: 'Level 7: EMP Pulse',
    creator: 'sourav',
    playCount: 480,
    blocks: [
      { x: 4, y: 2, h: 8 }, // EMP Counter block in center
      { x: 3, y: 2, h: 3 }, { x: 5, y: 2, h: 3 },
      { x: 2, y: 1, h: 2 }, { x: 3, y: 1, h: 2 }, { x: 4, y: 1, h: 4 }, { x: 5, y: 1, h: 2 }, { x: 6, y: 1, h: 2 },
      { x: 2, y: 3, h: 1 }, { x: 3, y: 3, h: 1 }, { x: 5, y: 3, h: 1 }, { x: 6, y: 3, h: 1 },
    ],
  },
  {
    id: '8',
    name: 'Level 8: Zigzag Conduit',
    creator: 'sourav',
    playCount: 440,
    blocks: [
      { x: 0, y: 1, h: 7 }, // Portal
      { x: 8, y: 4, h: 7 }, // Portal
      { x: 1, y: 1, h: 3 }, { x: 2, y: 1, h: 3 }, { x: 3, y: 2, h: 4 }, { x: 4, y: 2, h: 4 },
      { x: 5, y: 3, h: 5 }, { x: 6, y: 3, h: 5 }, { x: 7, y: 4, h: 2 },
      { x: 3, y: 4, h: 8 }, // EMP
      { x: 2, y: 3, h: 1 }, { x: 4, y: 1, h: 2 },
    ],
  },
  {
    id: '9',
    name: 'Level 9: Double Helix',
    creator: 'sourav',
    playCount: 410,
    blocks: [
      { x: 2, y: 1, h: 4 }, { x: 6, y: 1, h: 4 },
      { x: 3, y: 2, h: 5 }, { x: 5, y: 2, h: 5 },
      { x: 4, y: 3, h: 8 }, // EMP Node
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
      { x: 2, y: 5, h: 2 }, { x: 6, y: 5, h: 2 },
      { x: 1, y: 2, h: 1 }, { x: 7, y: 2, h: 1 },
    ],
  },
  {
    id: '10',
    name: 'Level 10: Cluster Detonator',
    creator: 'sourav',
    playCount: 390,
    blocks: [
      { x: 2, y: 2, h: 8 }, { x: 6, y: 2, h: 8 }, // Dual EMPs
      { x: 1, y: 2, h: 3 }, { x: 3, y: 2, h: 3 }, { x: 5, y: 2, h: 3 }, { x: 7, y: 2, h: 3 },
      { x: 2, y: 1, h: 4 }, { x: 6, y: 1, h: 4 }, { x: 4, y: 1, h: 5 },
      { x: 2, y: 3, h: 2 }, { x: 6, y: 3, h: 2 }, { x: 4, y: 3, h: 6 },
    ],
  },
  {
    id: '11',
    name: 'Level 11: The Citadel Gate',
    creator: 'sourav',
    playCount: 360,
    blocks: [
      { x: 0, y: 1, h: 6 }, { x: 1, y: 1, h: 6 }, { x: 7, y: 1, h: 6 }, { x: 8, y: 1, h: 6 },
      { x: 2, y: 1, h: 7 }, { x: 6, y: 1, h: 7 }, // Portals
      { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 2, y: 2, h: 4 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 6, y: 2, h: 4 },
      { x: 3, y: 3, h: 3 }, { x: 4, y: 3, h: 3 }, { x: 5, y: 3, h: 3 },
    ],
  },
  {
    id: '12',
    name: 'Level 12: Reactor Core Alpha',
    creator: 'sourav',
    playCount: 340,
    blocks: [
      { x: 4, y: 1, h: 8 }, // Center Core EMP
      { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, // Portals
      { x: 1, y: 2, h: 5 }, { x: 7, y: 2, h: 5 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
      { x: 4, y: 5, h: 2 },
    ],
  },

  // ==========================================
  // SECTOR 03: QUANTUM VOID (Levels 13 - 18)
  // ==========================================
  {
    id: '13',
    name: 'Level 13: Stargate Nexus',
    creator: 'sourav',
    playCount: 310,
    blocks: [
      { x: 0, y: 2, h: 7 }, { x: 8, y: 2, h: 7 }, // Portals
      { x: 1, y: 1, h: 6 }, { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 4 }, { x: 5, y: 1, h: 4 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 6 },
      { x: 2, y: 2, h: 3 }, { x: 4, y: 2, h: 8 }, { x: 6, y: 2, h: 3 },
      { x: 3, y: 3, h: 2 }, { x: 4, y: 3, h: 5 }, { x: 5, y: 3, h: 2 },
    ],
  },
  {
    id: '14',
    name: 'Level 14: Asteroid Shards',
    creator: 'sourav',
    playCount: 290,
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 2, h: 4 }, { x: 6, y: 2, h: 4 },
      { x: 3, y: 3, h: 8 }, { x: 5, y: 3, h: 8 },
      { x: 0, y: 4, h: 3 }, { x: 4, y: 4, h: 7 }, { x: 8, y: 4, h: 3 },
      { x: 4, y: 2, h: 7 }, // Paired portal
    ],
  },
  {
    id: '15',
    name: 'Level 15: Crossfire Grid',
    creator: 'sourav',
    playCount: 270,
    blocks: [
      { x: 4, y: 0, h: 6 }, { x: 4, y: 1, h: 5 }, { x: 4, y: 2, h: 8 }, { x: 4, y: 3, h: 5 }, { x: 4, y: 4, h: 6 },
      { x: 1, y: 2, h: 6 }, { x: 2, y: 2, h: 4 }, { x: 6, y: 2, h: 4 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 1, h: 7 }, { x: 6, y: 3, h: 7 }, // Diagonal portals
      { x: 2, y: 3, h: 3 }, { x: 6, y: 1, h: 3 },
    ],
  },
  {
    id: '16',
    name: 'Level 16: Chronos Vault',
    creator: 'sourav',
    playCount: 250,
    blocks: [
      { x: 1, y: 1, h: 6 }, { x: 2, y: 1, h: 6 }, { x: 3, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 6, y: 1, h: 6 }, { x: 7, y: 1, h: 6 },
      { x: 4, y: 1, h: 7 }, // Entrance Portal
      { x: 4, y: 3, h: 7 }, // Exit inside vault
      { x: 2, y: 2, h: 5 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 6, y: 2, h: 5 },
      { x: 3, y: 3, h: 4 }, { x: 5, y: 3, h: 4 },
      { x: 4, y: 4, h: 3 },
    ],
  },
  {
    id: '17',
    name: 'Level 17: Binary Orbit',
    creator: 'sourav',
    playCount: 235,
    blocks: [
      { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 4 }, { x: 2, y: 2, h: 8 }, { x: 3, y: 2, h: 3 },
      { x: 5, y: 1, h: 3 }, { x: 6, y: 1, h: 5 }, { x: 5, y: 2, h: 4 }, { x: 6, y: 2, h: 8 },
      { x: 1, y: 3, h: 7 }, { x: 7, y: 3, h: 7 }, // External portals
      { x: 4, y: 3, h: 6 }, // Divider wall
      { x: 2, y: 4, h: 2 }, { x: 6, y: 4, h: 2 },
    ],
  },
  {
    id: '18',
    name: 'Level 18: Singularity Matrix',
    creator: 'sourav',
    playCount: 220,
    blocks: [
      { x: 4, y: 2, h: 8 }, // Singularity EMP Core
      { x: 3, y: 1, h: 7 }, { x: 5, y: 3, h: 7 }, // Portals
      { x: 2, y: 1, h: 5 }, { x: 4, y: 1, h: 6 }, { x: 6, y: 1, h: 5 },
      { x: 1, y: 2, h: 4 }, { x: 7, y: 2, h: 4 },
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ],
  },

  // ==========================================
  // SECTOR 04: CYBER BASTION (Levels 19 - 24)
  // ==========================================
  {
    id: '19',
    name: 'Level 19: The Great Wall',
    creator: 'sourav',
    playCount: 205,
    blocks: [
      { x: 0, y: 2, h: 6 }, { x: 1, y: 2, h: 6 }, { x: 2, y: 2, h: 7 }, { x: 3, y: 2, h: 6 },
      { x: 4, y: 2, h: 8 }, // Center EMP break point
      { x: 5, y: 2, h: 6 }, { x: 6, y: 2, h: 7 }, { x: 7, y: 2, h: 6 }, { x: 8, y: 2, h: 6 },
      { x: 1, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 5, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 3, h: 3 }, { x: 4, y: 3, h: 4 }, { x: 6, y: 3, h: 3 },
    ],
  },
  {
    id: '20',
    name: 'Level 20: Bastion Ramparts',
    creator: 'sourav',
    playCount: 190,
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 0, y: 2, h: 6 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 8, y: 2, h: 6 },
      { x: 1, y: 3, h: 4 }, { x: 4, y: 3, h: 7 }, { x: 7, y: 3, h: 4 },
      { x: 4, y: 1, h: 7 }, // Flanking portal pair
      { x: 2, y: 4, h: 3 }, { x: 6, y: 4, h: 3 },
    ],
  },
  {
    id: '21',
    name: 'Level 21: EMP Labyrinth',
    creator: 'sourav',
    playCount: 180,
    blocks: [
      { x: 1, y: 1, h: 8 }, { x: 4, y: 1, h: 5 }, { x: 7, y: 1, h: 8 },
      { x: 2, y: 2, h: 4 }, { x: 4, y: 2, h: 8 }, { x: 6, y: 2, h: 4 },
      { x: 0, y: 3, h: 5 }, { x: 3, y: 3, h: 6 }, { x: 5, y: 3, h: 6 }, { x: 8, y: 3, h: 5 },
      { x: 1, y: 4, h: 7 }, { x: 7, y: 4, h: 7 }, // Lower escape portals
      { x: 4, y: 4, h: 3 },
    ],
  },
  {
    id: '22',
    name: 'Level 22: Iron Curtain',
    creator: 'sourav',
    playCount: 170,
    blocks: [
      { x: 1, y: 1, h: 6 }, { x: 3, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 7, y: 1, h: 6 },
      { x: 2, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 6, y: 1, h: 5 },
      { x: 0, y: 2, h: 7 }, { x: 8, y: 2, h: 7 }, // Lateral portals
      { x: 2, y: 3, h: 4 }, { x: 3, y: 3, h: 5 }, { x: 5, y: 3, h: 5 }, { x: 6, y: 3, h: 4 },
      { x: 4, y: 4, h: 3 },
    ],
  },
  {
    id: '23',
    name: 'Level 23: Laser Citadel',
    creator: 'sourav',
    playCount: 160,
    blocks: [
      { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 5 },
      { x: 1, y: 2, h: 6 }, { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 4, y: 4, h: 4 }, { x: 5, y: 4, h: 3 },
    ],
  },
  {
    id: '24',
    name: 'Level 24: Overdrive Nexus',
    creator: 'sourav',
    playCount: 150,
    blocks: [
      { x: 0, y: 1, h: 5 }, { x: 2, y: 1, h: 7 }, { x: 4, y: 1, h: 8 }, { x: 6, y: 1, h: 7 }, { x: 8, y: 1, h: 5 },
      { x: 1, y: 2, h: 6 }, { x: 3, y: 2, h: 5 }, { x: 5, y: 2, h: 5 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 8 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ],
  },

  // ==========================================
  // SECTOR 05: HYPER CORE OVERDRIVE (Levels 25 - 30)
  // ==========================================
  {
    id: '25',
    name: 'Level 25: Genesis Overdrive',
    creator: 'sourav',
    playCount: 140,
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 2, h: 4 }, { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, { x: 6, y: 2, h: 4 },
      { x: 3, y: 3, h: 5 }, { x: 4, y: 3, h: 6 }, { x: 5, y: 3, h: 5 },
      { x: 4, y: 4, h: 3 },
    ],
  },
  {
    id: '26',
    name: 'Level 26: Quantum Lattice',
    creator: 'sourav',
    playCount: 130,
    blocks: [
      { x: 0, y: 1, h: 7 }, { x: 8, y: 1, h: 7 }, // Portals
      { x: 2, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 6, y: 1, h: 5 },
      { x: 1, y: 2, h: 8 }, { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, { x: 7, y: 2, h: 8 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ],
  },
  {
    id: '27',
    name: 'Level 27: Chaos Lattice',
    creator: 'sourav',
    playCount: 120,
    blocks: [
      { x: 1, y: 1, h: 8 }, { x: 3, y: 1, h: 8 }, { x: 5, y: 1, h: 8 }, { x: 7, y: 1, h: 8 },
      { x: 2, y: 2, h: 5 }, { x: 4, y: 2, h: 7 }, { x: 6, y: 2, h: 5 },
      { x: 1, y: 3, h: 6 }, { x: 4, y: 3, h: 7 }, { x: 7, y: 3, h: 6 }, // Paired portal center
      { x: 2, y: 4, h: 4 }, { x: 6, y: 4, h: 4 },
      { x: 3, y: 5, h: 3 }, { x: 5, y: 5, h: 3 },
    ],
  },
  {
    id: '28',
    name: 'Level 28: Dreadnought Bastion',
    creator: 'sourav',
    playCount: 110,
    blocks: [
      { x: 0, y: 1, h: 6 }, { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 }, { x: 8, y: 1, h: 6 },
      { x: 3, y: 1, h: 8 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 8 },
      { x: 1, y: 2, h: 7 }, { x: 7, y: 2, h: 7 }, // Lateral flank portals
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 },
    ],
  },
  {
    id: '29',
    name: 'Level 29: Event Horizon',
    creator: 'sourav',
    playCount: 100,
    blocks: [
      { x: 3, y: 1, h: 6 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 6 },
      { x: 2, y: 2, h: 6 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 6, y: 2, h: 6 },
      { x: 1, y: 3, h: 7 }, { x: 4, y: 3, h: 5 }, { x: 7, y: 3, h: 7 },
      { x: 2, y: 4, h: 5 }, { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 }, { x: 6, y: 4, h: 5 },
      { x: 4, y: 5, h: 3 },
    ],
  },
  {
    id: '30',
    name: 'Level 30: Grand Apex Reactor',
    creator: 'sourav',
    playCount: 95,
    blocks: [
      // Master Apex Crown Formation
      { x: 4, y: 0, h: 8 }, // Apex Detonator Core
      { x: 3, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 1, y: 1, h: 7 }, { x: 7, y: 1, h: 7 }, // Dual Warp Portals
      { x: 2, y: 2, h: 6 }, { x: 3, y: 2, h: 5 }, { x: 4, y: 2, h: 8 }, { x: 5, y: 2, h: 5 }, { x: 6, y: 2, h: 6 },
      { x: 0, y: 3, h: 5 }, { x: 2, y: 3, h: 4 }, { x: 6, y: 3, h: 4 }, { x: 8, y: 3, h: 5 },
      { x: 3, y: 4, h: 5 }, { x: 4, y: 4, h: 5 }, { x: 5, y: 4, h: 5 },
      { x: 4, y: 5, h: 4 },
    ],
  },
];
