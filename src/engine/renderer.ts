import { BallState, PaddleState, BlockEngineState } from './types';
import { ParticleSystem } from './particles';
import { BLOCK_COLORS } from '../constants/game';
import { PowerUpManager } from './powerUps';
import { currencyService } from '../services/currency';
import { getActiveDesignConfig, getBallTierFromUpgrades } from '../constants/visualPresets';
import { drawBlockWithPreset } from './draw/blockDrawers';
import { drawPaddleWithPreset } from './draw/paddleDrawers';
import { drawBallWithPreset } from './draw/ballDrawers';

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

    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, h);
    bgGrad.addColorStop(0, 'rgba(10, 13, 44, 0.82)');
    bgGrad.addColorStop(0.6, 'rgba(4, 6, 22, 0.90)');
    bgGrad.addColorStop(1, 'rgba(1, 2, 10, 0.96)');
    ctx.fillStyle = bgGrad;
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

    // 3. Danger Floor (Lava / Void Laser)
    ctx.save();
    const lavaHeight = 44;
    const lavaGrad = ctx.createLinearGradient(0, h - lavaHeight, 0, h);
    lavaGrad.addColorStop(0, 'rgba(255, 8, 68, 0.0)');
    lavaGrad.addColorStop(0.5, 'rgba(255, 8, 68, 0.35)');
    lavaGrad.addColorStop(1, 'rgba(255, 8, 68, 0.9)');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, h - lavaHeight, w, lavaHeight);

    ctx.strokeStyle = '#ff0844';
    ctx.shadowColor = '#ff0844';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h - lavaHeight);
    ctx.lineTo(w, h - lavaHeight);
    ctx.stroke();
    ctx.restore();

    // 4. Power-Up Shards & Shield Barrier
    if (powerUps) {
      powerUps.render(ctx, paddle, w, h);
    }

    const designConfig = getActiveDesignConfig();
    const animTick = this.animTick;

    // 5. 3D Tactile Blocks Rendering (Dynamic Presets)
    blocks.forEach((block) => {
      drawBlockWithPreset(ctx, block, designConfig.blockPreset, { animTick });
    });

    // 6. 3D Paddle Rendering (Dynamic Presets & Upgrade Progression Tiers)
    const hasLaser = !!powerUps && powerUps.buffs.laser > 0;
    const hasShield = !!powerUps && (powerUps.buffs.hasShield || powerUps.buffs.shieldCharges > 0);
    const widthLevel = currencyService.getUpgradeLevel('paddle_width');
    const speedLevel = currencyService.getUpgradeLevel('paddle_speed');
    drawPaddleWithPreset(ctx, paddle, designConfig.paddlePreset, {
      animTick,
      hasLaser,
      hasShield,
      widthLevel,
      speedLevel,
      weaponVariant: designConfig.paddleWeaponVariant,
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
