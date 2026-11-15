/**
 * Level Validation Utility
 * Validates arena and campaign levels for structural integrity and portal logic.
 */

import { LevelData, BlockData } from '../types/game';

export interface LevelValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateLevel(level: LevelData): LevelValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!level.id || typeof level.id !== 'string') {
    errors.push('Level ID is missing or invalid.');
  }

  if (!Array.isArray(level.blocks) || level.blocks.length === 0) {
    errors.push('Level must contain at least one block.');
    return { isValid: false, errors, warnings };
  }

  // 1. Grid coordinates & bounds check
  const posMap = new Set<string>();
  const portalPairs = new Map<number, BlockData[]>();
  const unassignedPortals: BlockData[] = [];
  let breakableCount = 0;

  level.blocks.forEach((b, idx) => {
    if (b.x < 0 || b.x > 8 || b.y < 0 || b.y > 10) {
      errors.push(`Block [${idx}] (${b.x}, ${b.y}) is out of grid bounds (0-8, 0-10).`);
    }

    const key = `${b.x},${b.y}`;
    if (posMap.has(key)) {
      warnings.push(`Duplicate block placement at (${b.x}, ${b.y}).`);
    }
    posMap.add(key);

    if ((b.h >= 1 && b.h <= 5) || b.h === 8) {
      breakableCount++;
    }

    // Portal accounting
    if (b.h === 7) {
      if (b.portalPairId !== undefined) {
        if (!portalPairs.has(b.portalPairId)) {
          portalPairs.set(b.portalPairId, []);
        }
        portalPairs.get(b.portalPairId)!.push(b);
      } else {
        unassignedPortals.push(b);
      }
    }
  });

  if (breakableCount === 0) {
    errors.push('Level must contain at least one breakable block (h: 1-5 or h: 8).');
  }

  // 2. Strict Portal Logic Verification
  portalPairs.forEach((blocks, pairId) => {
    if (blocks.length !== 2) {
      errors.push(
        `Portal Pair #${pairId} has ${blocks.length} portals. Every portal pair MUST have exactly 2 linked portals.`
      );
    }
  });

  if (unassignedPortals.length > 0) {
    if (unassignedPortals.length % 2 !== 0) {
      errors.push(
        `Level has ${unassignedPortals.length} portals without pair IDs. Portals must be paired in 2s.`
      );
    } else {
      warnings.push(
        `Level contains ${unassignedPortals.length} portals using legacy sequential pairing instead of explicit portalPairId.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a whole collection of levels and report any issues.
 */
export function validateLevelCollection(levels: LevelData[]): {
  total: number;
  validCount: number;
  invalidCount: number;
  report: { id: string; name?: string; errors: string[] }[];
} {
  const report: { id: string; name?: string; errors: string[] }[] = [];
  let validCount = 0;

  levels.forEach((lvl) => {
    const res = validateLevel(lvl);
    if (res.isValid) {
      validCount++;
    } else {
      report.push({ id: lvl.id, name: lvl.name, errors: res.errors });
    }
  });

  return {
    total: levels.length,
    validCount,
    invalidCount: report.length,
    report,
  };
}
