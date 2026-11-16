import { LevelData } from '../types/game';
import { firestoreDb } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Ensures all portals remain Quantum Portals (h: 7) and are properly paired.
 * Under NO circumstances does this function convert a portal (h: 7) into a standard block or Titanium block!
 */
export function sanitizePortals(level: LevelData): LevelData {
  if (!level || !level.blocks || !Array.isArray(level.blocks)) return level;
  const portals = level.blocks.filter((b) => b.h === 7);
  if (portals.length === 0) return level;

  let unassignedPortalsCount = 0;
  const newBlocks = level.blocks.map((b) => {
    if (b.h !== 7) return b;
    if (b.portalPairId !== undefined && b.portalPairId >= 1 && b.portalPairId <= 4) {
      return b;
    }
    const pairId = Math.min(4, Math.floor(unassignedPortalsCount / 2) + 1);
    unassignedPortalsCount++;
    return { ...b, portalPairId: pairId };
  });

  return {
    ...level,
    blocks: newBlocks,
  };
}

export async function getOverallLeaderboard() {
  try {
    const snap = await getDoc(doc(firestoreDb, 'leaderboards', 'overall'));
    if (snap.exists() && Array.isArray(snap.data()?.entries)) return snap.data()?.entries;
  } catch {}
  return [];
}
