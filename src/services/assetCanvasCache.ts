import { draw3DStardustCoreBall } from '../engine/draw/ballDrawers';
import { drawMechTitanPaddle } from '../engine/draw/paddleDrawers';
import { drawPlanarDeltaVortex } from '../engine/draw/powerUpDrawers';
import { POWER_UP_CONFIGS, PowerUpType } from '../engine/powerUpTypes';

const thumbnailCache = new Map<string, string>();

const CANVAS_SIZE = 72; // High-DPI 72x72 for crystal-clear Retina rendering

function getPowerTypeForUpgrade(upgradeId: string): PowerUpType {
  switch (upgradeId) {
    case 'laser_power':
      return 'laser';
    case 'mega_power':
      return 'megaball';
    case 'slowmo_power':
      return 'slowmo';
    case 'expand_power':
      return 'expand';
    case 'multi_power':
      return 'multiball';
    case 'shield_power':
      return 'shield';
    default:
      return 'laser';
  }
}

/** Render a single asset onto an offscreen canvas and return its Data URL */
export function renderAssetToDataUrl(
  drawFn: (ctx: CanvasRenderingContext2D, size: number) => void,
  size = CANVAS_SIZE
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, size, size);
  drawFn(ctx, size);

  return canvas.toDataURL('image/png');
}

/** Draw real 3D ball asset based on upgrade type and level */
function drawBallAsset(
  ctx: CanvasRenderingContext2D,
  size: number,
  upgradeId: string,
  level: number
) {
  const cx = size / 2;
  const cy = size / 2;

  let radius = 14;
  let palette = {
    glow: '#00f7ff',
    c1: '#e0ffff',
    c2: '#00d4ff',
    c3: '#0044aa',
  };

  if (upgradeId === 'ball_size') {
    radius = Math.min(22, 12 + level * 1.5);
  } else if (upgradeId === 'ball_speed') {
    palette = {
      glow: '#00f7ff',
      c1: '#ffffff',
      c2: '#38bdf8',
      c3: '#0369a1',
    };
  } else if (upgradeId === 'ball_impact') {
    palette = {
      glow: '#f43f5e',
      c1: '#ffffff',
      c2: '#fb7185',
      c3: '#881337',
    };
  } else if (upgradeId === 'ball_trajectory') {
    palette = {
      glow: '#10b981',
      c1: '#ffffff',
      c2: '#34d399',
      c3: '#065f46',
    };
  }

  // Draw decorative predictive guideline ring on thumbnail for trajectory matrix
  if (upgradeId === 'ball_trajectory') {
    ctx.save();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Directional ray preview
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 10);
    ctx.lineTo(cx + 10, cy - 10);
    ctx.stroke();
    ctx.restore();
  }

  draw3DStardustCoreBall(
    ctx,
    { x: cx, y: cy, radius },
    {
      tier: level >= 6 ? 3 : level >= 3 ? 2 : 1,
      palette,
      animTick: 0,
    }
  );
}

/** Draw real Mech Titan paddle asset based on upgrade type and level */
function drawPaddleAsset(
  ctx: CanvasRenderingContext2D,
  size: number,
  upgradeId: string,
  level: number
) {
  const cx = size / 2;
  const cy = size * 0.38;

  let width = 42;
  if (upgradeId === 'paddle_width') {
    width = Math.min(60, 36 + level * 2.8);
  }

  const height = 12;
  const tier = level >= 6 ? 3 : level >= 3 ? 2 : 1;

  drawMechTitanPaddle(
    ctx,
    {
      x: cx,
      y: cy,
      width,
      height,
      vx: 0,
      targetX: cx,
    },
    {
      tier,
      widthLevel: upgradeId === 'paddle_width' ? level : 1,
      speedLevel: upgradeId === 'paddle_speed' ? level : 1,
      animTick: 0,
    }
  );
}

/** Draw real in-game Planar Delta Vortex power-up drop asset */
function drawPowerAsset(
  ctx: CanvasRenderingContext2D,
  size: number,
  upgradeId: string,
  _level: number
) {
  const cx = size / 2;
  const cy = size / 2;
  const powerType = getPowerTypeForUpgrade(upgradeId);
  const meta = POWER_UP_CONFIGS[powerType];

  drawPlanarDeltaVortex(
    ctx,
    {
      id: 1,
      x: cx,
      y: cy,
      vy: 0,
      meta,
      collected: false,
      angle: 0,
    },
    {
      animTick: 0,
      scale: 0.62,
    }
  );
}

/**
 * Retrieve cached asset thumbnail data URL or generate on-the-fly
 */
export function getAssetThumbnail(idOrType: string, level = 1): string {
  const cacheKey = `${idOrType}_lvl_${level}`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }

  let dataUrl = '';

  if (idOrType === 'ball' || idOrType.startsWith('ball_')) {
    dataUrl = renderAssetToDataUrl((ctx, s) => drawBallAsset(ctx, s, idOrType, level));
  } else if (idOrType === 'paddle' || idOrType.startsWith('paddle_')) {
    dataUrl = renderAssetToDataUrl((ctx, s) => drawPaddleAsset(ctx, s, idOrType, level));
  } else if (idOrType === 'power' || idOrType.endsWith('_power')) {
    dataUrl = renderAssetToDataUrl((ctx, s) => drawPowerAsset(ctx, s, idOrType, level));
  } else {
    dataUrl = renderAssetToDataUrl((ctx, s) => drawBallAsset(ctx, s, 'ball_size', level));
  }

  if (dataUrl) {
    thumbnailCache.set(cacheKey, dataUrl);
  }

  return dataUrl;
}

/**
 * Pre-render all upgrade and module thumbnails when game starts
 */
export function prewarmAssetThumbnails(): void {
  if (typeof document === 'undefined') return;

  // Generic category tabs
  getAssetThumbnail('ball', 1);
  getAssetThumbnail('paddle', 1);
  getAssetThumbnail('power', 1);

  // Ball Modules
  ['ball_size', 'ball_speed', 'ball_impact', 'ball_trajectory'].forEach((id) => {
    for (let l = 1; l <= 8; l++) {
      getAssetThumbnail(id, l);
    }
  });

  // Paddle Modules
  ['paddle_width', 'paddle_speed'].forEach((id) => {
    for (let l = 1; l <= 8; l++) {
      getAssetThumbnail(id, l);
    }
  });

  // Power Modules
  [
    'expand_power',
    'slowmo_power',
    'laser_power',
    'mega_power',
    'multi_power',
    'shield_power',
  ].forEach((id) => {
    for (let l = 1; l <= 10; l++) {
      getAssetThumbnail(id, l);
    }
  });
}

// Auto-prewarm on client load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    prewarmAssetThumbnails();
  }, 100);
}
