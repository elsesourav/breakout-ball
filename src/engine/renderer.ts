import { BallState, PaddleState, BlockEngineState } from './types';
import { ParticleSystem } from './particles';
import { BLOCK_COLORS } from '../constants/game';
import { PowerUpManager } from './powerUps';
import { currencyService } from '../services/currency';
import { getActiveDesignConfig, getBallTierFromUpgrades } from '../constants/visualPresets';
import { drawBlockWithPreset } from './draw/blockDrawers';
import { drawPaddleWithPreset } from './draw/paddleDrawers';
import { drawBallWithPreset } from './draw/ballDrawers';
import { drawBlackHoleFloor } from './draw/blackHoleDrawers';

const BALL_SKIN_PALETTES: Record<string, { c1: string; c2: string; c3: string; glow: string }> = {
  cyan: { c1: '#ffffff', c2: '#7df9ff', c3: '#00f7ff', glow: '#00f7ff' },
  fire: { c1: '#ffffff', c2: '#ff9900', c3: '#ff0055', glow: '#ff5500' },
  void: { c1: '#ffffff', c2: '#e879f9', c3: '#7c3aed', glow: '#c084fc' },
  matrix: { c1: '#ffffff', c2: '#6ee7b7', c3: '#059669', glow: '#10b981' },
  gold: { c1: '#ffffff', c2: '#fef08a', c3: '#eab308', glow: '#ffd700' },
};

export class GameRenderer {
  private width: number;
  private height: number;
  private animTick = 0;
  private shakeIntensity = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public triggerShake(intensity: number) {
    this.shakeIntensity = Math.min(22, this.shakeIntensity + intensity);
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    balls: BallState[] | BallState,
    paddle: PaddleState,
    blocks: BlockEngineState[],
    particles: ParticleSystem,
    powerUps?: PowerUpManager,
    ballSkin: string = 'cyan'
  ) {
    const w = this.width;
    const h = this.height;
    this.animTick += 0.05;

    const ballList = Array.isArray(balls) ? balls : [balls];

    // 1. Clear & Cyber Radial Backdrop
    ctx.clearRect(0, 0, w, h);

    // Screen Shake Camera Translation
    ctx.save();
    if (this.shakeIntensity > 0.1) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
      this.shakeIntensity *= 0.88;
      if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
    }

    // 1. Clear & Arcade Map Style Backdrop (Clean, 100% opaque #03040c matching level map)
    ctx.fillStyle = '#03040c';
    ctx.fillRect(0, 0, w, h);

    // Subtle atmospheric arcade energy gradients matching the arcade map
    const topGlow = ctx.createRadialGradient(w * 0.5, 0, 10, w * 0.5, 0, h * 0.45);
    topGlow.addColorStop(0, 'rgba(255, 215, 0, 0.08)');
    topGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, w, h);

    const midGlow = ctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.45, h * 0.5);
    midGlow.addColorStop(0, 'rgba(183, 115, 255, 0.07)');
    midGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = midGlow;
    ctx.fillRect(0, 0, w, h);

    const botGlow = ctx.createRadialGradient(w * 0.5, h, 10, w * 0.5, h, h * 0.4);
    botGlow.addColorStop(0, 'rgba(0, 247, 255, 0.10)');
    botGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = botGlow;
    ctx.fillRect(0, 0, w, h);

    // Perspective cyber grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 80;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Background Stars
    particles.render(ctx);

    const animTick = this.animTick;

    // 3. Cosmic Black Hole Gravitational Singularity Floor
    drawBlackHoleFloor(ctx, w, h, animTick);

    // 4. Power-Up Shards & Shield Barrier
    if (powerUps) {
      powerUps.render(ctx, paddle, w, h);
    }

    const designConfig = getActiveDesignConfig();

    // 5. 3D Tactile Blocks Rendering (Dynamic Presets)
    blocks.forEach((block) => {
      drawBlockWithPreset(ctx, block, designConfig.blockPreset, {
        animTick,
        portalCenterStyle: designConfig.portalCenterStyle,
      });
    });

    // 6. 3D Paddle Rendering (Dynamic Presets & Upgrade Progression Tiers)
    const hasLaser = !!powerUps && powerUps.buffs.laser > 0;
    const hasShield = !!powerUps && (powerUps.buffs.hasShield || powerUps.buffs.shieldCharges > 0);
    const widthLevel = currencyService.getUpgradeLevel('paddle_width');
    const speedLevel = currencyService.getUpgradeLevel('paddle_speed');
    drawPaddleWithPreset(ctx, paddle, 1, {
      animTick,
      hasLaser,
      hasShield,
      widthLevel,
      speedLevel,
      tier: designConfig.paddleTierOverride,
    });

    // 7. Render All Active Balls with 3D Shading & Internal Upgrades (Zero Outside Particles)
    const palette = BALL_SKIN_PALETTES[ballSkin] || BALL_SKIN_PALETTES.cyan;
    const ballSizeLvl = currencyService.getUpgradeLevel('ball_size');
    const ballSpeedLvl = currencyService.getUpgradeLevel('ball_speed');
    const ballImpactLvl = currencyService.getUpgradeLevel('ball_impact');
    const ballTier = designConfig.ballTierOverride || getBallTierFromUpgrades(ballSizeLvl, ballSpeedLvl, ballImpactLvl);

    for (const b of ballList) {
      if (!b.isActive) continue;
      drawBallWithPreset(ctx, b, designConfig.ballPreset || 1, {
        animTick,
        tier: ballTier,
        palette,
        isMega: b.isMega,
      });
    }
    ctx.restore();
  }
}
