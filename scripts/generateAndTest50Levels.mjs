/**
 * 50 Progressive Levels Generator, Multi-Run Simulation Tester, and Difficulty Balancer
 * 
 * Generates 50+ unique, visually captivating levels with distinct themes.
 * Runs multi-iteration headless simulation testing across Lowest, Balanced, and Max Power.
 * Sorts them strictly into a smooth 1 to 50 difficulty curve partitioned into 5 sectors of 10 levels.
 */

import { PhysicsWorld } from './dist/physics.mjs';
import { analyzeLevelLayout, simulateLevelRun, POWER_PROFILES } from './levelTester.mjs';
import * as fs from 'fs';

// Helper to create symmetric block designs
function makeSymmetricRow(y, h, cols) {
  const blocks = [];
  for (const c of cols) {
    blocks.push({ x: c, y, h });
    const mirror = 8 - c;
    if (mirror !== c) {
      blocks.push({ x: mirror, y, h });
    }
  }
  return blocks;
}

/**
 * 55 Crafted Level Blueprints with Diverse Mechanics and Geometric Aesthetics
 */
export const CANDIDATE_LEVELS = [
  // ── Beginner Fundamentals & Shapes (Soft Workloads) ──────────────────────
  {
    candidateName: 'Genesis Arc',
    theme: 'Introductory horizontal curve',
    blocks: [
      { x: 1, y: 2, h: 1 }, { x: 2, y: 2, h: 1 }, { x: 3, y: 2, h: 1 }, { x: 4, y: 2, h: 1 }, { x: 5, y: 2, h: 1 }, { x: 6, y: 2, h: 1 }, { x: 7, y: 2, h: 1 },
      { x: 2, y: 3, h: 2 }, { x: 3, y: 3, h: 2 }, { x: 4, y: 3, h: 2 }, { x: 5, y: 3, h: 2 }, { x: 6, y: 3, h: 2 },
      { x: 3, y: 4, h: 1 }, { x: 4, y: 4, h: 1 }, { x: 5, y: 4, h: 1 },
    ]
  },
  {
    candidateName: 'Neon Butterfly',
    theme: 'Winged symmetric crystal formation',
    blocks: [
      { x: 1, y: 1, h: 2 }, { x: 2, y: 1, h: 1 }, { x: 6, y: 1, h: 1 }, { x: 7, y: 1, h: 2 },
      { x: 0, y: 2, h: 2 }, { x: 1, y: 2, h: 3 }, { x: 3, y: 2, h: 1 }, { x: 5, y: 2, h: 1 }, { x: 7, y: 2, h: 3 }, { x: 8, y: 2, h: 2 },
      { x: 1, y: 3, h: 2 }, { x: 4, y: 3, h: 1 }, { x: 7, y: 3, h: 2 },
      { x: 2, y: 4, h: 1 }, { x: 6, y: 4, h: 1 },
    ]
  },
  {
    candidateName: 'Prism Crown',
    theme: 'Ascending tiered pyramid',
    blocks: [
      { x: 4, y: 1, h: 3 },
      { x: 3, y: 2, h: 2 }, { x: 4, y: 2, h: 3 }, { x: 5, y: 2, h: 2 },
      { x: 2, y: 3, h: 1 }, { x: 3, y: 3, h: 2 }, { x: 4, y: 3, h: 3 }, { x: 5, y: 3, h: 2 }, { x: 6, y: 3, h: 1 },
      { x: 1, y: 4, h: 1 }, { x: 2, y: 4, h: 1 }, { x: 6, y: 4, h: 1 }, { x: 7, y: 4, h: 1 },
    ]
  },
  {
    candidateName: 'Twin Pillars',
    theme: 'Dual vertical columns with center bridge',
    blocks: [
      { x: 1, y: 1, h: 2 }, { x: 1, y: 2, h: 2 }, { x: 1, y: 3, h: 2 }, { x: 1, y: 4, h: 2 },
      { x: 7, y: 1, h: 2 }, { x: 7, y: 2, h: 2 }, { x: 7, y: 3, h: 2 }, { x: 7, y: 4, h: 2 },
      { x: 3, y: 2, h: 1 }, { x: 4, y: 2, h: 3 }, { x: 5, y: 2, h: 1 },
      { x: 3, y: 3, h: 2 }, { x: 4, y: 3, h: 2 }, { x: 5, y: 3, h: 2 },
    ]
  },
  {
    candidateName: 'EMP Sparks',
    theme: 'Single central detonator with delicate outer shield',
    blocks: [
      { x: 4, y: 2, h: 8 }, // EMP in center
      { x: 3, y: 2, h: 2 }, { x: 5, y: 2, h: 2 },
      { x: 2, y: 1, h: 1 }, { x: 3, y: 1, h: 2 }, { x: 4, y: 1, h: 3 }, { x: 5, y: 1, h: 2 }, { x: 6, y: 1, h: 1 },
      { x: 2, y: 3, h: 1 }, { x: 3, y: 3, h: 1 }, { x: 5, y: 3, h: 1 }, { x: 6, y: 3, h: 1 },
    ]
  },
  {
    candidateName: 'Cyber Chevron',
    theme: 'Forward-pointing laser arrow',
    blocks: [
      { x: 4, y: 1, h: 3 },
      { x: 3, y: 2, h: 2 }, { x: 5, y: 2, h: 2 },
      { x: 2, y: 3, h: 2 }, { x: 6, y: 3, h: 2 },
      { x: 1, y: 4, h: 1 }, { x: 7, y: 4, h: 1 },
      { x: 3, y: 3, h: 1 }, { x: 4, y: 3, h: 2 }, { x: 5, y: 3, h: 1 },
    ]
  },
  {
    candidateName: 'Orbital Ring',
    theme: 'Circular satellite array',
    blocks: [
      { x: 3, y: 1, h: 2 }, { x: 4, y: 1, h: 3 }, { x: 5, y: 1, h: 2 },
      { x: 2, y: 2, h: 2 }, { x: 6, y: 2, h: 2 },
      { x: 2, y: 3, h: 2 }, { x: 6, y: 3, h: 2 },
      { x: 3, y: 4, h: 2 }, { x: 4, y: 4, h: 3 }, { x: 5, y: 4, h: 2 },
      { x: 4, y: 2, h: 1 }, { x: 4, y: 3, h: 1 },
    ]
  },
  {
    candidateName: 'Hourglass Matrix',
    theme: 'Choke-point hourglass formation',
    blocks: [
      { x: 1, y: 1, h: 3 }, { x: 2, y: 1, h: 3 }, { x: 3, y: 1, h: 2 }, { x: 5, y: 1, h: 2 }, { x: 6, y: 1, h: 3 }, { x: 7, y: 1, h: 3 },
      { x: 2, y: 2, h: 2 }, { x: 3, y: 2, h: 2 }, { x: 5, y: 2, h: 2 }, { x: 6, y: 2, h: 2 },
      { x: 4, y: 3, h: 4 }, // Narrow neck
      { x: 2, y: 4, h: 1 }, { x: 3, y: 4, h: 2 }, { x: 5, y: 4, h: 2 }, { x: 6, y: 4, h: 1 },
      { x: 1, y: 5, h: 1 }, { x: 2, y: 5, h: 1 }, { x: 6, y: 5, h: 1 }, { x: 7, y: 5, h: 1 },
    ]
  },
  {
    candidateName: 'Diamond Core',
    theme: 'Reflective diamond obstacle',
    blocks: [
      { x: 4, y: 1, h: 4 },
      { x: 3, y: 2, h: 3 }, { x: 5, y: 2, h: 3 },
      { x: 2, y: 3, h: 2 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 2 }, // Center wall
      { x: 3, y: 4, h: 2 }, { x: 5, y: 4, h: 2 },
      { x: 4, y: 5, h: 1 },
    ]
  },
  {
    candidateName: 'Quantum Gateway Alpha',
    theme: 'First portal gateway tutorial',
    blocks: [
      { x: 1, y: 1, h: 7 }, { x: 7, y: 1, h: 7 }, // Portal pair
      { x: 2, y: 2, h: 2 }, { x: 3, y: 2, h: 3 }, { x: 4, y: 2, h: 3 }, { x: 5, y: 2, h: 3 }, { x: 6, y: 2, h: 2 },
      { x: 3, y: 3, h: 2 }, { x: 4, y: 3, h: 2 }, { x: 5, y: 3, h: 2 },
      { x: 4, y: 4, h: 1 },
    ]
  },

  // ── Kinetic Sector (EMP Explosions & Fast Trajectories) ───────────────────
  {
    candidateName: 'Cluster Detonator',
    theme: 'Dual EMP shockwave chain',
    blocks: [
      { x: 2, y: 2, h: 8 }, { x: 6, y: 2, h: 8 }, // Dual EMPs
      { x: 1, y: 2, h: 3 }, { x: 3, y: 2, h: 3 }, { x: 5, y: 2, h: 3 }, { x: 7, y: 2, h: 3 },
      { x: 2, y: 1, h: 3 }, { x: 6, y: 1, h: 3 }, { x: 4, y: 1, h: 4 },
      { x: 2, y: 3, h: 2 }, { x: 6, y: 3, h: 2 },
    ]
  },
  {
    candidateName: 'Zigzag Conduit',
    theme: 'Alternating kinetic ricochet tracks',
    blocks: [
      { x: 0, y: 1, h: 7 }, { x: 8, y: 4, h: 7 }, // Diagonal portals
      { x: 1, y: 1, h: 3 }, { x: 2, y: 1, h: 3 }, { x: 3, y: 2, h: 3 }, { x: 4, y: 2, h: 3 },
      { x: 5, y: 3, h: 4 }, { x: 6, y: 3, h: 4 }, { x: 7, y: 4, h: 2 },
      { x: 4, y: 4, h: 8 }, // EMP trigger
      { x: 2, y: 3, h: 1 }, { x: 4, y: 1, h: 2 },
    ]
  },
  {
    candidateName: 'Double Helix',
    theme: 'DNA spiral array',
    blocks: [
      { x: 2, y: 1, h: 4 }, { x: 6, y: 1, h: 4 },
      { x: 3, y: 2, h: 4 }, { x: 5, y: 2, h: 4 },
      { x: 4, y: 3, h: 8 }, // EMP node
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
      { x: 2, y: 5, h: 2 }, { x: 6, y: 5, h: 2 },
      { x: 1, y: 2, h: 1 }, { x: 7, y: 2, h: 1 },
    ]
  },
  {
    candidateName: 'Checkered Maze',
    theme: 'Staggered grid requiring angle navigation',
    blocks: [
      { x: 0, y: 1, h: 3 }, { x: 2, y: 1, h: 3 }, { x: 4, y: 1, h: 3 }, { x: 6, y: 1, h: 3 }, { x: 8, y: 1, h: 3 },
      { x: 1, y: 2, h: 2 }, { x: 3, y: 2, h: 2 }, { x: 5, y: 2, h: 2 }, { x: 7, y: 2, h: 2 },
      { x: 0, y: 3, h: 3 }, { x: 2, y: 3, h: 6 }, { x: 4, y: 3, h: 4 }, { x: 6, y: 3, h: 6 }, { x: 8, y: 3, h: 3 },
      { x: 1, y: 4, h: 1 }, { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 }, { x: 7, y: 4, h: 1 },
    ]
  },
  {
    candidateName: 'Reactor Core Alpha',
    theme: 'Fortified EMP core with lateral defenses',
    blocks: [
      { x: 4, y: 1, h: 8 }, // EMP
      { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, // Portals
      { x: 1, y: 2, h: 4 }, { x: 7, y: 2, h: 4 },
      { x: 2, y: 3, h: 3 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 3 },
      { x: 3, y: 4, h: 2 }, { x: 5, y: 4, h: 2 },
      { x: 4, y: 5, h: 1 },
    ]
  },
  {
    candidateName: 'Space Invader',
    theme: 'Pixel art retro alien silhouette',
    blocks: [
      { x: 2, y: 1, h: 3 }, { x: 6, y: 1, h: 3 },
      { x: 3, y: 2, h: 3 }, { x: 5, y: 2, h: 3 },
      { x: 1, y: 3, h: 4 }, { x: 2, y: 3, h: 4 }, { x: 3, y: 3, h: 4 }, { x: 4, y: 3, h: 8 }, { x: 5, y: 3, h: 4 }, { x: 6, y: 3, h: 4 }, { x: 7, y: 3, h: 4 },
      { x: 1, y: 4, h: 2 }, { x: 3, y: 4, h: 6 }, { x: 5, y: 4, h: 6 }, { x: 7, y: 4, h: 2 }, // Wall eyes
      { x: 0, y: 5, h: 1 }, { x: 2, y: 5, h: 2 }, { x: 6, y: 5, h: 2 }, { x: 8, y: 5, h: 1 },
    ]
  },
  {
    candidateName: 'Trident Strike',
    theme: 'Three pronged assault spear',
    blocks: [
      { x: 1, y: 1, h: 4 }, { x: 4, y: 0, h: 5 }, { x: 7, y: 1, h: 4 },
      { x: 1, y: 2, h: 3 }, { x: 4, y: 1, h: 8 }, { x: 7, y: 2, h: 3 },
      { x: 1, y: 3, h: 2 }, { x: 4, y: 2, h: 4 }, { x: 7, y: 3, h: 2 },
      { x: 2, y: 4, h: 2 }, { x: 3, y: 4, h: 3 }, { x: 4, y: 4, h: 3 }, { x: 5, y: 4, h: 3 }, { x: 6, y: 4, h: 2 },
      { x: 4, y: 5, h: 1 },
    ]
  },
  {
    candidateName: 'Binary Orbit',
    theme: 'Paired revolving solar cores',
    blocks: [
      { x: 2, y: 1, h: 4 }, { x: 3, y: 1, h: 3 }, { x: 2, y: 2, h: 8 }, { x: 3, y: 2, h: 3 },
      { x: 5, y: 1, h: 3 }, { x: 6, y: 1, h: 4 }, { x: 5, y: 2, h: 3 }, { x: 6, y: 2, h: 8 },
      { x: 1, y: 3, h: 7 }, { x: 7, y: 3, h: 7 }, // Portals
      { x: 4, y: 3, h: 6 }, // Center divider wall
      { x: 2, y: 4, h: 2 }, { x: 6, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'Vortex Eye',
    theme: 'Swirling circular kinetic vortex',
    blocks: [
      { x: 3, y: 1, h: 4 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 4 },
      { x: 2, y: 2, h: 3 }, { x: 6, y: 2, h: 3 },
      { x: 1, y: 3, h: 7 }, { x: 4, y: 3, h: 8 }, { x: 7, y: 3, h: 7 }, // Portals flanking EMP
      { x: 2, y: 4, h: 3 }, { x: 6, y: 4, h: 3 },
      { x: 3, y: 5, h: 2 }, { x: 4, y: 5, h: 2 }, { x: 5, y: 5, h: 2 },
    ]
  },
  {
    candidateName: 'Pulse Bastion',
    theme: 'Sector 2 Apex Pulse Citadel',
    blocks: [
      { x: 0, y: 1, h: 6 }, { x: 1, y: 1, h: 4 }, { x: 7, y: 1, h: 4 }, { x: 8, y: 1, h: 6 },
      { x: 2, y: 1, h: 7 }, { x: 6, y: 1, h: 7 }, // Portals
      { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 2, y: 2, h: 3 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 6, y: 2, h: 3 }, // Dual EMPs
      { x: 3, y: 3, h: 3 }, { x: 4, y: 3, h: 4 }, { x: 5, y: 3, h: 3 },
    ]
  },

  // ── Quantum Sector (Portals & Spatial Wormholes) ───────────────────────────
  {
    candidateName: 'Stargate Nexus',
    theme: 'Flanked portal corridor',
    blocks: [
      { x: 0, y: 2, h: 7 }, { x: 8, y: 2, h: 7 }, // Portals
      { x: 1, y: 1, h: 6 }, { x: 2, y: 1, h: 4 }, { x: 3, y: 1, h: 4 }, { x: 5, y: 1, h: 4 }, { x: 6, y: 1, h: 4 }, { x: 7, y: 1, h: 6 },
      { x: 2, y: 2, h: 3 }, { x: 4, y: 2, h: 8 }, { x: 6, y: 2, h: 3 },
      { x: 3, y: 3, h: 2 }, { x: 4, y: 3, h: 4 }, { x: 5, y: 3, h: 2 },
    ]
  },
  {
    candidateName: 'Asteroid Shards',
    theme: 'Dispersed high-density mineral clusters',
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 2, h: 4 }, { x: 6, y: 2, h: 4 },
      { x: 3, y: 3, h: 8 }, { x: 5, y: 3, h: 8 },
      { x: 0, y: 4, h: 3 }, { x: 4, y: 4, h: 7 }, { x: 8, y: 4, h: 3 },
      { x: 4, y: 2, h: 7 }, // Paired portal
    ]
  },
  {
    candidateName: 'Crossfire Grid',
    theme: 'Cruciform defensive barrier',
    blocks: [
      { x: 4, y: 0, h: 6 }, { x: 4, y: 1, h: 5 }, { x: 4, y: 2, h: 8 }, { x: 4, y: 3, h: 5 }, { x: 4, y: 4, h: 6 },
      { x: 1, y: 2, h: 6 }, { x: 2, y: 2, h: 4 }, { x: 6, y: 2, h: 4 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 1, h: 7 }, { x: 6, y: 3, h: 7 }, // Diagonal portals
      { x: 2, y: 3, h: 3 }, { x: 6, y: 1, h: 3 },
    ]
  },
  {
    candidateName: 'Chronos Vault',
    theme: 'Internal fortress accessible by portal',
    blocks: [
      { x: 1, y: 1, h: 6 }, { x: 2, y: 1, h: 6 }, { x: 3, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 6, y: 1, h: 6 }, { x: 7, y: 1, h: 6 },
      { x: 4, y: 1, h: 7 }, // Entrance Portal
      { x: 4, y: 3, h: 7 }, // Exit Portal
      { x: 2, y: 2, h: 4 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 6, y: 2, h: 4 },
      { x: 3, y: 3, h: 4 }, { x: 5, y: 3, h: 4 },
      { x: 4, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'Mirror Portal Maze',
    theme: 'Dual-paired quad portal warp network',
    blocks: [
      { x: 0, y: 1, h: 7 }, { x: 8, y: 1, h: 7 }, // Pair 1
      { x: 2, y: 3, h: 7 }, { x: 6, y: 3, h: 7 }, // Pair 2
      { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 1, y: 2, h: 4 }, { x: 4, y: 2, h: 8 }, { x: 7, y: 2, h: 4 },
      { x: 3, y: 3, h: 3 }, { x: 5, y: 3, h: 3 },
      { x: 4, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'Singularity Matrix',
    theme: 'Dense portal-surrounded singularity',
    blocks: [
      { x: 4, y: 2, h: 8 }, // EMP core
      { x: 3, y: 1, h: 7 }, { x: 5, y: 3, h: 7 }, // Portals
      { x: 2, y: 1, h: 4 }, { x: 4, y: 1, h: 6 }, { x: 6, y: 1, h: 4 },
      { x: 1, y: 2, h: 3 }, { x: 7, y: 2, h: 3 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 2 }, { x: 5, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'Quantum Lattice',
    theme: 'Checkerboard of portals and EMP clusters',
    blocks: [
      { x: 0, y: 1, h: 7 }, { x: 8, y: 1, h: 7 }, // Portals
      { x: 2, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 6, y: 1, h: 5 },
      { x: 1, y: 2, h: 8 }, { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, { x: 7, y: 2, h: 8 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Hypercube Warp',
    theme: 'Tesseract 4D cube projection',
    blocks: [
      { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 6, y: 1, h: 5 },
      { x: 1, y: 2, h: 7 }, { x: 4, y: 2, h: 8 }, { x: 7, y: 2, h: 7 },
      { x: 2, y: 3, h: 4 }, { x: 3, y: 3, h: 5 }, { x: 5, y: 3, h: 5 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 4, y: 4, h: 6 }, { x: 5, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Chaos Lattice',
    theme: 'Staggered dual portal cross-fire',
    blocks: [
      { x: 1, y: 1, h: 8 }, { x: 3, y: 1, h: 8 }, { x: 5, y: 1, h: 8 }, { x: 7, y: 1, h: 8 },
      { x: 2, y: 2, h: 5 }, { x: 4, y: 2, h: 7 }, { x: 6, y: 2, h: 5 },
      { x: 1, y: 3, h: 6 }, { x: 4, y: 3, h: 7 }, { x: 7, y: 3, h: 6 },
      { x: 2, y: 4, h: 4 }, { x: 6, y: 4, h: 4 },
      { x: 3, y: 5, h: 3 }, { x: 5, y: 5, h: 3 },
    ]
  },
  {
    candidateName: 'Quantum Apex Gate',
    theme: 'Sector 3 Apex Void Gate',
    blocks: [
      { x: 0, y: 1, h: 7 }, { x: 2, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 6, y: 1, h: 5 }, { x: 8, y: 1, h: 7 },
      { x: 1, y: 2, h: 6 }, { x: 3, y: 2, h: 4 }, { x: 5, y: 2, h: 4 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 8 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ]
  },

  // ── Cyber Bastion (Fortresses, Walls & Heavy Armor) ──────────────────────
  {
    candidateName: 'The Great Wall',
    theme: 'Horizontal defensive line with center breach point',
    blocks: [
      { x: 0, y: 2, h: 6 }, { x: 1, y: 2, h: 6 }, { x: 2, y: 2, h: 7 }, { x: 3, y: 2, h: 6 },
      { x: 4, y: 2, h: 8 }, // Center breach EMP
      { x: 5, y: 2, h: 6 }, { x: 6, y: 2, h: 7 }, { x: 7, y: 2, h: 6 }, { x: 8, y: 2, h: 6 },
      { x: 1, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 5, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 3, h: 3 }, { x: 4, y: 3, h: 4 }, { x: 6, y: 3, h: 3 },
    ]
  },
  {
    candidateName: 'Bastion Ramparts',
    theme: 'Heavily fortified rampart towers',
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 0, y: 2, h: 6 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 8, y: 2, h: 6 },
      { x: 1, y: 3, h: 4 }, { x: 4, y: 3, h: 7 }, { x: 7, y: 3, h: 4 },
      { x: 4, y: 1, h: 7 }, // Paired portal
      { x: 2, y: 4, h: 3 }, { x: 6, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Shielded Bunker',
    theme: 'U-shaped titanium enclosure with soft core',
    blocks: [
      { x: 2, y: 1, h: 6 }, { x: 3, y: 1, h: 6 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 6, y: 1, h: 6 },
      { x: 2, y: 2, h: 6 }, { x: 3, y: 2, h: 5 }, { x: 4, y: 2, h: 5 }, { x: 5, y: 2, h: 5 }, { x: 6, y: 2, h: 6 },
      { x: 2, y: 3, h: 6 }, { x: 3, y: 3, h: 4 }, { x: 4, y: 3, h: 8 }, { x: 5, y: 3, h: 4 }, { x: 6, y: 3, h: 6 },
      { x: 1, y: 4, h: 2 }, { x: 7, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'EMP Labyrinth',
    theme: 'Multi-tiered puzzle maze with explosive shortcuts',
    blocks: [
      { x: 1, y: 1, h: 8 }, { x: 4, y: 1, h: 5 }, { x: 7, y: 1, h: 8 },
      { x: 2, y: 2, h: 4 }, { x: 4, y: 2, h: 8 }, { x: 6, y: 2, h: 4 },
      { x: 0, y: 3, h: 5 }, { x: 3, y: 3, h: 6 }, { x: 5, y: 3, h: 6 }, { x: 8, y: 3, h: 5 },
      { x: 1, y: 4, h: 7 }, { x: 7, y: 4, h: 7 }, // Escape portals
      { x: 4, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Iron Curtain',
    theme: 'Alternating titanium pillars and crystal cells',
    blocks: [
      { x: 1, y: 1, h: 6 }, { x: 3, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 7, y: 1, h: 6 },
      { x: 2, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 6, y: 1, h: 5 },
      { x: 0, y: 2, h: 7 }, { x: 8, y: 2, h: 7 }, // Lateral portals
      { x: 2, y: 3, h: 4 }, { x: 3, y: 3, h: 5 }, { x: 5, y: 3, h: 5 }, { x: 6, y: 3, h: 4 },
      { x: 4, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Laser Citadel',
    theme: 'Heavily guarded energy keep',
    blocks: [
      { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 5 },
      { x: 1, y: 2, h: 6 }, { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 4, y: 4, h: 4 }, { x: 5, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Fortress Moat',
    theme: 'Perimeter moat of titanium with portal bridges',
    blocks: [
      { x: 0, y: 1, h: 6 }, { x: 1, y: 1, h: 6 }, { x: 7, y: 1, h: 6 }, { x: 8, y: 1, h: 6 },
      { x: 2, y: 1, h: 7 }, { x: 6, y: 1, h: 7 },
      { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 0, y: 3, h: 6 }, { x: 8, y: 3, h: 6 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 8 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 4, y: 4, h: 4 }, { x: 5, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Overdrive Nexus',
    theme: 'Dynamic portal ricochet matrix',
    blocks: [
      { x: 0, y: 1, h: 5 }, { x: 2, y: 1, h: 7 }, { x: 4, y: 1, h: 8 }, { x: 6, y: 1, h: 7 }, { x: 8, y: 1, h: 5 },
      { x: 1, y: 2, h: 6 }, { x: 3, y: 2, h: 5 }, { x: 5, y: 2, h: 5 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 8 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Dreadnought Bastion',
    theme: 'Heavy battleship bow structure',
    blocks: [
      { x: 0, y: 1, h: 6 }, { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 }, { x: 8, y: 1, h: 6 },
      { x: 3, y: 1, h: 8 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 8 },
      { x: 1, y: 2, h: 7 }, { x: 7, y: 2, h: 7 }, // Lateral portals
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 },
    ]
  },
  {
    candidateName: 'Cyber Bastion Apex',
    theme: 'Sector 4 Apex Bastion Fortress',
    blocks: [
      { x: 1, y: 1, h: 6 }, { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 6 },
      { x: 0, y: 2, h: 6 }, { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, { x: 8, y: 2, h: 6 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 4 },
      { x: 3, y: 4, h: 5 }, { x: 4, y: 4, h: 8 }, { x: 5, y: 4, h: 5 },
      { x: 4, y: 5, h: 3 },
    ]
  },

  // ── Hyper Core Overdrive (Master Apex Reactors & Gauntlets) ───────────────
  {
    candidateName: 'Genesis Overdrive',
    theme: 'Max density energy crown',
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 2, h: 4 }, { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, { x: 6, y: 2, h: 4 },
      { x: 3, y: 3, h: 5 }, { x: 4, y: 3, h: 6 }, { x: 5, y: 3, h: 5 },
      { x: 4, y: 4, h: 4 },
    ]
  },
  {
    candidateName: 'Event Horizon',
    theme: 'Gravitational funnel',
    blocks: [
      { x: 3, y: 1, h: 6 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 6 },
      { x: 2, y: 2, h: 6 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 6, y: 2, h: 6 },
      { x: 1, y: 3, h: 7 }, { x: 4, y: 3, h: 5 }, { x: 7, y: 3, h: 7 },
      { x: 2, y: 4, h: 5 }, { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 }, { x: 6, y: 4, h: 5 },
      { x: 4, y: 5, h: 3 },
    ]
  },
  {
    candidateName: 'Obsidian Monolith',
    theme: 'Central titanium pillar surrounded by armored obsidian',
    blocks: [
      { x: 4, y: 0, h: 6 }, { x: 4, y: 1, h: 6 }, { x: 4, y: 2, h: 6 },
      { x: 3, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 2, y: 2, h: 5 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 6, y: 2, h: 5 },
      { x: 1, y: 3, h: 4 }, { x: 7, y: 3, h: 4 },
      { x: 2, y: 4, h: 5 }, { x: 4, y: 4, h: 8 }, { x: 6, y: 4, h: 5 },
      { x: 3, y: 5, h: 3 }, { x: 5, y: 5, h: 3 },
    ]
  },
  {
    candidateName: 'Quantum Cataclysm',
    theme: 'Tri-portal spatial rupture array',
    blocks: [
      { x: 0, y: 1, h: 7 }, { x: 4, y: 0, h: 8 }, { x: 8, y: 1, h: 7 },
      { x: 2, y: 1, h: 5 }, { x: 6, y: 1, h: 5 },
      { x: 1, y: 2, h: 4 }, { x: 3, y: 2, h: 7 }, { x: 5, y: 2, h: 7 }, { x: 7, y: 2, h: 4 },
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 },
      { x: 4, y: 5, h: 3 },
    ]
  },
  {
    candidateName: 'Titan Citadel Core',
    theme: 'Heavy multi-tier armor fortress',
    blocks: [
      { x: 2, y: 1, h: 6 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 6 },
      { x: 1, y: 2, h: 5 }, { x: 3, y: 2, h: 8 }, { x: 5, y: 2, h: 8 }, { x: 7, y: 2, h: 5 },
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 5 },
      { x: 0, y: 4, h: 7 }, { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 }, { x: 8, y: 4, h: 7 },
      { x: 4, y: 5, h: 4 },
    ]
  },
  {
    candidateName: 'Plasma Supernova',
    theme: 'Radial blast diamond of tier 5 crystals',
    blocks: [
      { x: 4, y: 0, h: 8 },
      { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 2, y: 2, h: 5 }, { x: 4, y: 2, h: 8 }, { x: 6, y: 2, h: 5 },
      { x: 1, y: 3, h: 4 }, { x: 3, y: 3, h: 5 }, { x: 5, y: 3, h: 5 }, { x: 7, y: 3, h: 4 },
      { x: 2, y: 4, h: 4 }, { x: 4, y: 4, h: 5 }, { x: 6, y: 4, h: 4 },
      { x: 4, y: 5, h: 3 },
    ]
  },
  {
    candidateName: 'Doomsday Matrix',
    theme: 'Triple EMP battery with titanium shields',
    blocks: [
      { x: 2, y: 1, h: 8 }, { x: 4, y: 1, h: 5 }, { x: 6, y: 1, h: 8 },
      { x: 1, y: 2, h: 6 }, { x: 3, y: 2, h: 5 }, { x: 5, y: 2, h: 5 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 8 }, { x: 6, y: 3, h: 5 },
      { x: 0, y: 4, h: 7 }, { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 }, { x: 8, y: 4, h: 7 },
      { x: 4, y: 5, h: 4 },
    ]
  },
  {
    candidateName: 'Singularity Overdrive',
    theme: 'Clustered tier-5 armor with portal wormholes',
    blocks: [
      { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 6 }, { x: 5, y: 1, h: 5 },
      { x: 1, y: 2, h: 7 }, { x: 2, y: 2, h: 5 }, { x: 4, y: 2, h: 8 }, { x: 6, y: 2, h: 5 }, { x: 7, y: 2, h: 7 },
      { x: 2, y: 3, h: 5 }, { x: 3, y: 3, h: 5 }, { x: 5, y: 3, h: 5 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 4 }, { x: 4, y: 4, h: 8 }, { x: 5, y: 4, h: 4 },
      { x: 4, y: 5, h: 3 },
    ]
  },
  {
    candidateName: 'Omega Bastion',
    theme: 'Penultimate armored citadel',
    blocks: [
      { x: 0, y: 1, h: 6 }, { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 }, { x: 8, y: 1, h: 6 },
      { x: 1, y: 2, h: 7 }, { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, { x: 7, y: 2, h: 7 },
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 4 }, { x: 4, y: 4, h: 8 }, { x: 5, y: 4, h: 4 },
      { x: 4, y: 5, h: 5 },
    ]
  },
  {
    candidateName: 'Grand Apex Reactor',
    theme: 'Master Climax 50 Apex Gauntlet',
    blocks: [
      { x: 4, y: 1, h: 8 }, // Apex Detonator Core
      { x: 3, y: 1, h: 5 }, { x: 5, y: 1, h: 5 },
      { x: 1, y: 1, h: 7 }, { x: 7, y: 1, h: 7 }, // Dual Warp Portals
      { x: 2, y: 2, h: 6 }, { x: 3, y: 2, h: 5 }, { x: 4, y: 2, h: 8 }, { x: 5, y: 2, h: 5 }, { x: 6, y: 2, h: 6 },
      { x: 0, y: 3, h: 5 }, { x: 2, y: 3, h: 4 }, { x: 6, y: 3, h: 4 }, { x: 8, y: 3, h: 5 },
      { x: 3, y: 4, h: 5 }, { x: 4, y: 4, h: 5 }, { x: 5, y: 4, h: 5 },
      { x: 4, y: 5, h: 4 },
    ]
  },

  // ── Additional Variations & Puzzle Formations ─────────────────────────────
  {
    candidateName: 'Solar Flare',
    theme: 'Sunburst formation with radial beams',
    blocks: [
      { x: 4, y: 0, h: 4 },
      { x: 2, y: 1, h: 3 }, { x: 4, y: 1, h: 5 }, { x: 6, y: 1, h: 3 },
      { x: 1, y: 2, h: 2 }, { x: 3, y: 2, h: 4 }, { x: 4, y: 2, h: 8 }, { x: 5, y: 2, h: 4 }, { x: 7, y: 2, h: 2 },
      { x: 2, y: 3, h: 3 }, { x: 4, y: 3, h: 5 }, { x: 6, y: 3, h: 3 },
      { x: 4, y: 4, h: 4 },
    ]
  },
  {
    candidateName: 'Shield Wall Delta',
    theme: 'Bunker roof testing bounce angles',
    blocks: [
      { x: 2, y: 1, h: 6 }, { x: 3, y: 1, h: 6 }, { x: 5, y: 1, h: 6 }, { x: 6, y: 1, h: 6 },
      { x: 4, y: 1, h: 8 },
      { x: 2, y: 2, h: 4 }, { x: 3, y: 2, h: 4 }, { x: 5, y: 2, h: 4 }, { x: 6, y: 2, h: 4 },
      { x: 1, y: 3, h: 3 }, { x: 4, y: 3, h: 5 }, { x: 7, y: 3, h: 3 },
      { x: 3, y: 4, h: 2 }, { x: 5, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'Neon Heart',
    theme: 'Heart-shaped crystal lattice',
    blocks: [
      { x: 2, y: 1, h: 3 }, { x: 3, y: 1, h: 4 }, { x: 5, y: 1, h: 4 }, { x: 6, y: 1, h: 3 },
      { x: 1, y: 2, h: 3 }, { x: 4, y: 2, h: 8 }, { x: 7, y: 2, h: 3 },
      { x: 1, y: 3, h: 2 }, { x: 4, y: 3, h: 5 }, { x: 7, y: 3, h: 2 },
      { x: 2, y: 4, h: 2 }, { x: 6, y: 4, h: 2 },
      { x: 3, y: 5, h: 1 }, { x: 5, y: 5, h: 1 },
      { x: 4, y: 6, h: 1 },
    ]
  },
  {
    candidateName: 'Quantum Maze Beta',
    theme: 'Twin corridor portal relay',
    blocks: [
      { x: 1, y: 1, h: 7 }, { x: 7, y: 4, h: 7 }, // Portals
      { x: 2, y: 1, h: 4 }, { x: 3, y: 1, h: 4 }, { x: 5, y: 1, h: 4 }, { x: 6, y: 1, h: 4 },
      { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, // Central walls
      { x: 2, y: 3, h: 3 }, { x: 4, y: 3, h: 8 }, { x: 6, y: 3, h: 3 },
      { x: 3, y: 4, h: 2 }, { x: 5, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'Cyber Skull',
    theme: 'Visually striking cyber skull silhouette',
    blocks: [
      { x: 2, y: 1, h: 4 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 4 },
      { x: 1, y: 2, h: 4 }, { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, { x: 7, y: 2, h: 4 }, // Eyes
      { x: 1, y: 3, h: 3 }, { x: 4, y: 3, h: 8 }, { x: 7, y: 3, h: 3 },
      { x: 2, y: 4, h: 2 }, { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 }, { x: 6, y: 4, h: 2 }, // Teeth
    ]
  },
  {
    candidateName: 'Helix Accelerator',
    theme: 'Sinuous kinetic accelerator',
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 2, h: 4 }, { x: 6, y: 2, h: 4 },
      { x: 3, y: 3, h: 8 }, { x: 5, y: 3, h: 8 },
      { x: 2, y: 4, h: 3 }, { x: 6, y: 4, h: 3 },
      { x: 1, y: 5, h: 2 }, { x: 7, y: 5, h: 2 },
      { x: 4, y: 3, h: 6 }, // Center buffer wall
    ]
  },
  {
    candidateName: 'Crossed Sabers',
    theme: 'Angled dual sword beams',
    blocks: [
      { x: 0, y: 1, h: 4 }, { x: 8, y: 1, h: 4 },
      { x: 1, y: 2, h: 4 }, { x: 7, y: 2, h: 4 },
      { x: 2, y: 3, h: 3 }, { x: 6, y: 3, h: 3 },
      { x: 3, y: 4, h: 3 }, { x: 4, y: 4, h: 8 }, { x: 5, y: 4, h: 3 }, // Saber cross
      { x: 2, y: 5, h: 2 }, { x: 6, y: 5, h: 2 },
    ]
  },
  {
    candidateName: 'Anvil Core',
    theme: 'Heavy flat-topped anvil shape',
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 5 }, { x: 5, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 3, y: 2, h: 6 }, { x: 4, y: 2, h: 8 }, { x: 5, y: 2, h: 6 },
      { x: 3, y: 3, h: 4 }, { x: 5, y: 3, h: 4 },
      { x: 2, y: 4, h: 3 }, { x: 4, y: 4, h: 3 }, { x: 6, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Diamondback',
    theme: 'Serpentine diamond pattern',
    blocks: [
      { x: 4, y: 1, h: 5 },
      { x: 3, y: 2, h: 4 }, { x: 5, y: 2, h: 4 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 8 }, { x: 6, y: 3, h: 4 },
      { x: 1, y: 4, h: 3 }, { x: 7, y: 4, h: 3 },
      { x: 3, y: 5, h: 2 }, { x: 5, y: 5, h: 2 },
      { x: 4, y: 6, h: 1 },
    ]
  },
  {
    candidateName: 'Quantum Cross',
    theme: 'Portal-bridged cruciform',
    blocks: [
      { x: 4, y: 0, h: 5 },
      { x: 4, y: 1, h: 4 },
      { x: 0, y: 2, h: 7 }, { x: 2, y: 2, h: 3 }, { x: 4, y: 2, h: 8 }, { x: 6, y: 2, h: 3 }, { x: 8, y: 2, h: 7 },
      { x: 4, y: 3, h: 4 },
      { x: 4, y: 4, h: 5 },
    ]
  },
  {
    candidateName: 'Fortress Citadel 2',
    theme: 'Double bastions with moat',
    blocks: [
      { x: 1, y: 1, h: 6 }, { x: 2, y: 1, h: 4 }, { x: 6, y: 1, h: 4 }, { x: 7, y: 1, h: 6 },
      { x: 0, y: 2, h: 5 }, { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, { x: 8, y: 2, h: 5 },
      { x: 1, y: 3, h: 4 }, { x: 4, y: 3, h: 8 }, { x: 7, y: 3, h: 4 },
      { x: 2, y: 4, h: 3 }, { x: 6, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Twin Reactor Nexus',
    theme: 'Paired reactors in fortified casing',
    blocks: [
      { x: 2, y: 1, h: 8 }, { x: 6, y: 1, h: 8 },
      { x: 1, y: 2, h: 5 }, { x: 3, y: 2, h: 6 }, { x: 5, y: 2, h: 6 }, { x: 7, y: 2, h: 5 },
      { x: 2, y: 3, h: 4 }, { x: 4, y: 3, h: 7 }, { x: 6, y: 3, h: 4 },
      { x: 4, y: 1, h: 7 }, // Paired portal
      { x: 3, y: 4, h: 3 }, { x: 5, y: 4, h: 3 },
    ]
  },
  {
    candidateName: 'Plasma Hourglass',
    theme: 'Tier 5 armored hourglass',
    blocks: [
      { x: 1, y: 1, h: 5 }, { x: 2, y: 1, h: 5 }, { x: 6, y: 1, h: 5 }, { x: 7, y: 1, h: 5 },
      { x: 2, y: 2, h: 4 }, { x: 3, y: 2, h: 4 }, { x: 5, y: 2, h: 4 }, { x: 6, y: 2, h: 4 },
      { x: 4, y: 3, h: 8 }, // EMP at center choke
      { x: 2, y: 4, h: 3 }, { x: 6, y: 4, h: 3 },
      { x: 1, y: 5, h: 2 }, { x: 7, y: 5, h: 2 },
    ]
  },
  {
    candidateName: 'Cyber Trident Core',
    theme: 'Heavy three-forked battle crest',
    blocks: [
      { x: 0, y: 1, h: 5 }, { x: 4, y: 0, h: 8 }, { x: 8, y: 1, h: 5 },
      { x: 1, y: 2, h: 4 }, { x: 4, y: 1, h: 5 }, { x: 7, y: 2, h: 4 },
      { x: 2, y: 3, h: 6 }, { x: 4, y: 2, h: 5 }, { x: 6, y: 3, h: 6 },
      { x: 3, y: 4, h: 3 }, { x: 4, y: 3, h: 4 }, { x: 5, y: 4, h: 3 },
      { x: 4, y: 4, h: 2 },
    ]
  },
  {
    candidateName: 'Titanium Vault Gate',
    theme: 'Heavy vault door with central core',
    blocks: [
      { x: 1, y: 1, h: 6 }, { x: 2, y: 1, h: 6 }, { x: 6, y: 1, h: 6 }, { x: 7, y: 1, h: 6 },
      { x: 3, y: 1, h: 5 }, { x: 4, y: 1, h: 8 }, { x: 5, y: 1, h: 5 },
      { x: 1, y: 2, h: 6 }, { x: 7, y: 2, h: 6 },
      { x: 2, y: 3, h: 5 }, { x: 4, y: 3, h: 6 }, { x: 6, y: 3, h: 5 },
      { x: 3, y: 4, h: 4 }, { x: 5, y: 4, h: 4 },
    ]
  }
];

/**
 * Evaluates all candidate levels, tests them, sorts them by difficulty,
 * and packages them into the final 50-level campaign.
 */
export function generateAndSort50Levels() {
  console.log('===============================================================');
  console.log('🚀 GENERATING & PROFILING 50 PROGRESSIVE LEVELS');
  console.log('===============================================================\n');

  const evaluated = [];

  for (let i = 0; i < CANDIDATE_LEVELS.length; i++) {
    const cand = CANDIDATE_LEVELS[i];
    const dummyLevel = {
      id: String(i + 1),
      name: cand.candidateName,
      creator: 'sourav',
      playCount: 1000 - i * 15,
      blocks: cand.blocks
    };

    process.stdout.write(`Testing candidate ${String(i + 1).padStart(2, '0')}: ${cand.candidateName.padEnd(24)} ... `);
    const layout = analyzeLevelLayout(dummyLevel.blocks);

    // Run multi-power headless simulation
    const runProfile = (profile) => {
      const runs = [];
      for (let r = 0; r < 2; r++) {
        runs.push(simulateLevelRun(dummyLevel, profile));
      }
      const avgTime = runs.reduce((a, b) => a + b.timeUsed, 0) / runs.length;
      const avgScore = Math.round(runs.reduce((a, b) => a + b.score, 0) / runs.length);
      const avgCombo = Math.round(runs.reduce((a, b) => a + b.maxCombo, 0) / runs.length);
      return { avgTime: parseFloat(avgTime.toFixed(1)), avgScore, avgCombo };
    };

    const lowest = runProfile(POWER_PROFILES.LOWEST);
    const balanced = runProfile(POWER_PROFILES.BALANCED);
    const maximum = runProfile(POWER_PROFILES.MAXIMUM);

    // Composite calibrated difficulty
    const normTime = Math.min(1.0, lowest.avgTime / 100);
    const simDiff = normTime * 0.70 + (Math.min(1.0, layout.effectiveHp / 50)) * 0.30;
    const finalDiff = parseFloat((layout.staticDifficulty * 0.50 + simDiff * 0.50).toFixed(2));

    const speedupPct = lowest.avgTime > 0
      ? parseFloat((((lowest.avgTime - maximum.avgTime) / lowest.avgTime) * 100).toFixed(1))
      : 0;

    console.log(`Diff: ${(finalDiff * 100).toFixed(0)}% | Time: ${lowest.avgTime}s -> ${maximum.avgTime}s`);

    evaluated.push({
      candidateName: cand.candidateName,
      theme: cand.theme,
      blocks: cand.blocks,
      layout,
      difficulty: finalDiff,
      performance: { lowest, balanced, maximum, speedupPct },
      scores: {
        lowest: lowest.avgScore,
        balanced: balanced.avgScore,
        maximum: maximum.avgScore,
        star1: Math.round(lowest.avgScore * 0.85),
        star2: balanced.avgScore,
        star3: Math.round(maximum.avgScore * 1.05)
      },
      parTimes: {
        gold: parseFloat((maximum.avgTime * 1.15).toFixed(1)),
        silver: parseFloat((balanced.avgTime * 1.10).toFixed(1)),
        bronze: parseFloat((lowest.avgTime * 1.10).toFixed(1))
      }
    });
  }

  // SORT STRICTLY BY DIFFICULTY (Ascending)
  evaluated.sort((a, b) => a.difficulty - b.difficulty || a.layout.effectiveHp - b.layout.effectiveHp);

  // Curate 50 progressive levels spanning the entire dynamic difficulty curve (11% -> 70%)
  const top50 = [];
  const total = evaluated.length;
  for (let i = 0; i < 50; i++) {
    const srcIndex = Math.round((i / 49) * (total - 1));
    top50.push(evaluated[srcIndex]);
  }

  // Format into final 50 LevelData objects across 5 sectors (10 levels each)
  const SECTOR_NAMES = [
    { num: 1, name: 'Neon Alley', start: 1, end: 10 },
    { num: 2, name: 'Pulse Grid', start: 11, end: 20 },
    { num: 3, name: 'Quantum Void', start: 21, end: 30 },
    { num: 4, name: 'Cyber Bastion', start: 31, end: 40 },
    { num: 5, name: 'Hyper Core Overdrive', start: 41, end: 50 },
  ];

  const final50Levels = top50.map((item, idx) => {
    const id = String(idx + 1);
    const sectorIndex = Math.floor(idx / 10);
    const sector = SECTOR_NAMES[sectorIndex];
    return {
      id,
      name: `Level ${id}: ${item.candidateName}`,
      creator: 'sourav',
      playCount: Math.max(90, Math.round(1500 - idx * 28 + Math.sin(idx) * 45)),
      blocks: item.blocks,
      difficulty: item.difficulty,
      parTimes: item.parTimes,
      scores: item.scores,
      performance: item.performance,
      layout: item.layout
    };
  });

  console.log(`\nSuccessfully curated and sorted 50 levels!`);
  console.log(`Difficulty Range: ${(final50Levels[0].difficulty * 100).toFixed(0)}% (L01) -> ${(final50Levels[49].difficulty * 100).toFixed(0)}% (L50)\n`);

  fs.writeFileSync('./scripts/final-50-levels-telemetry.json', JSON.stringify(final50Levels, null, 2));

  return final50Levels;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAndSort50Levels();
}
