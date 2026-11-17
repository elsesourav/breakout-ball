import { BallState, PaddleState, BlockEngineState } from './types';
import { ParticleSystem } from './particles';
import { BLOCK_COLORS } from '../constants/game';
import { PowerUpManager } from './powerUps';
import { ExplosionSystem } from './explosionSystem';
import { currencyService } from '../services/currency';
import { getActiveDesignConfig, getBallTierFromUpgrades } from '../constants/visualPresets';
import { drawBlockWithPreset, drawArmored3DSlabBlock } from './draw/blockDrawers';
import { drawPaddleWithPreset } from './draw/paddleDrawers';
import { drawBallWithPreset } from './draw/ballDrawers';
import { drawBlackHoleFloor } from './draw/blackHoleDrawers';
import { calculateTrajectoryGuideline } from './trajectoryGuideline';

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
  private ballFadeAlphas: Map<number, number> = new Map();

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
    ballSkin: string = 'cyan',
    alpha: number = 1.0,
    explosions?: ExplosionSystem
  ) {
    const w = this.width;
    const h = this.height;
    this.animTick += 0.05;

    const ballList = Array.isArray(balls) ? balls : [balls];

    // Sub-frame interpolation for paddle
    const renderPaddleX = paddle.prevX !== undefined && alpha < 0.999
      ? paddle.prevX + (paddle.x - paddle.prevX) * alpha
      : paddle.x;
    const interpolatedPaddle: PaddleState = {
      ...paddle,
      x: renderPaddleX,
    };

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

    // 2. Background Stars
    particles.render(ctx);

    const animTick = this.animTick;

    // 3. Cosmic Black Hole Gravitational Singularity Floor
    drawBlackHoleFloor(ctx, w, h, animTick);

    // 4. Power-Up Shards & Shield Barrier
    if (powerUps) {
      powerUps.render(ctx, interpolatedPaddle, w, h);
    }

    const designConfig = getActiveDesignConfig();

    // 5. 3D Tactile Blocks Rendering (Dynamic Presets)
    blocks.forEach((block) => {
      drawBlockWithPreset(ctx, block, designConfig.blockPreset, {
        animTick,
        portalCenterStyle: designConfig.portalCenterStyle,
      });
    });

    // 5.1. Render Destroying Blocks (Shrinking Inward & Black Hole Suction Animation)
    if (particles.destroyingBlocks.length > 0) {
      ctx.save();
      for (const db of particles.destroyingBlocks) {
        ctx.save();
        ctx.translate(db.x + db.w / 2, db.y + db.h / 2);
        ctx.scale(db.scale, db.scale);
        ctx.globalAlpha = db.alpha;
        drawArmored3DSlabBlock(ctx, {
          index: 0,
          col: 0,
          row: 0,
          x: -db.w / 2,
          y: -db.h / 2,
          w: db.w,
          h: db.h,
          health: db.initialHealth || 1,
          initialHealth: db.initialHealth || 1,
          isDead: false,
          hitAnim: 0,
        }, { animTick });
        ctx.restore();
      }
      ctx.restore();
    }

    // 5.2. Render Explode Block Shockwaves, Lightning & Near-Block Shatter Waves
    if (explosions) {
      explosions.render(ctx);
    }

    // 6. 3D Paddle Rendering with Sub-Frame State Interpolation
    const hasLaser = !!powerUps && powerUps.buffs.laser > 0;
    const hasShield = !!powerUps && (powerUps.buffs.hasShield || powerUps.buffs.shieldCharges > 0);
    const hasExpand = !!powerUps && powerUps.buffs.expand > 0;
    const widthLevel = currencyService.getUpgradeLevel('paddle_width');
    const speedLevel = currencyService.getUpgradeLevel('paddle_speed');
    const paddleFancyLvl = currencyService.getUpgradeLevel('paddle_fancy');
    drawPaddleWithPreset(ctx, interpolatedPaddle, 1, {
      animTick,
      hasLaser,
      hasShield,
      hasExpand,
      widthLevel,
      speedLevel,
      fancyLevel: paddleFancyLvl,
      tier: designConfig.paddleTierOverride,
    });

    // 6.1. V-Type Trajectory Matrix Guideline (Incoming + Outgoing Deflection Ray)
    // Selects the single priority descending ball nearest to the paddle under detection radius
    const trajLvl = currencyService.getUpgradeLevel('ball_trajectory');
    
    // Clean up fade alphas for balls that no longer exist
    for (const key of this.ballFadeAlphas.keys()) {
      if (key >= ballList.length) this.ballFadeAlphas.delete(key);
    }

    let targetIdx = -1;
    let minDescDist = Infinity;
    const detectionRadius = 600 + (trajLvl - 1) * (1200 / 7);
    const halfPadW = interpolatedPaddle.width / 2;

    for (let i = 0; i < ballList.length; i++) {
      const b = ballList[i];
      if (!b || (!b.isActive && !b.isLaunchAiming)) continue;
      if (b.isLaunchAiming) {
        targetIdx = i;
        break;
      }
      if (b.vy <= 0.1) continue;
      const bRad = b.radius || 10;
      const targetY = interpolatedPaddle.y - bRad;
      const speed = Math.hypot(b.vx, b.vy);
      const velDist = (speed * (targetY - b.y)) / b.vy;
      if (b.y < targetY && velDist <= detectionRadius && velDist < minDescDist) {
        minDescDist = velDist;
        targetIdx = i;
      }
    }

    for (let idx = 0; idx < ballList.length; idx++) {
      const b = ballList[idx];
      const prevAlpha = this.ballFadeAlphas.get(idx) || 0;

      if (!b || idx !== targetIdx) {
        if (prevAlpha > 0.01) this.ballFadeAlphas.set(idx, Math.max(0, prevAlpha - 1/60 * 4.0));
        else this.ballFadeAlphas.delete(idx);
        continue;
      }

      const { guideline, nextFadeAlpha } = calculateTrajectoryGuideline(
        b,
        interpolatedPaddle,
        w,
        h,
        trajLvl,
        prevAlpha,
        1 / 60
      );
      this.ballFadeAlphas.set(idx, nextFadeAlpha);

      // Display V-type guideline ONLY when under radius AND paddle intercepts target velocity location
      if (guideline.visible && guideline.alpha > 0.01 && (guideline.isHit || b.isLaunchAiming)) {
        ctx.save();
        const gAlpha = guideline.alpha;

        // 1. Incoming Arm of the V (Cyan laser dashes from ball to paddle)
        ctx.lineWidth = 5.5;
        ctx.setLineDash([16, 14]);
        ctx.strokeStyle = `rgba(0, 247, 255, ${gAlpha * 0.95})`;
        ctx.shadowColor = '#00f7ff';
        ctx.shadowBlur = 12;

        for (const seg of guideline.incomingSegments) {
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        }

        // 2. Apex of the V: Concentric Landing Target Reticle on Paddle Face
        const retR = guideline.isHit ? '16, 185, 129' : '0, 247, 255';
        ctx.setLineDash([]);
        ctx.shadowColor = guideline.isHit ? '#10b981' : '#00f7ff';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(guideline.hitX, guideline.hitY, 18, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${retR}, ${gAlpha * 0.95})`;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(guideline.hitX, guideline.hitY, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(guideline.hitX, guideline.hitY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 3. Paddle Lock-on Beam along paddle face (when paddle intercepts landing point)
        if (guideline.isHit) {
          const halfPadW = interpolatedPaddle.width / 2;
          ctx.strokeStyle = `rgba(16, 185, 129, ${gAlpha * 0.95})`;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 14;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(interpolatedPaddle.x - halfPadW, interpolatedPaddle.y);
          ctx.lineTo(interpolatedPaddle.x + halfPadW, interpolatedPaddle.y);
          ctx.stroke();
        }

        // 4. Outgoing Arm of the V (Emerald Green deflection ray with Arrowhead)
        if (guideline.outgoingSegments.length > 0) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${gAlpha * 0.95})`;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 5.5;
          ctx.setLineDash([16, 14]);

          for (const seg of guideline.outgoingSegments) {
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
          }

          // Directional Arrowhead at end of deflection ray
          const lastSeg = guideline.outgoingSegments[guideline.outgoingSegments.length - 1];
          const outAngle = Math.atan2(guideline.outVx, -guideline.outVy);
          ctx.setLineDash([]);
          ctx.save();
          ctx.translate(lastSeg.x2, lastSeg.y2);
          ctx.rotate(outAngle);
          ctx.fillStyle = `rgba(52, 211, 153, ${gAlpha})`;
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(11, 10);
          ctx.lineTo(0, 5);
          ctx.lineTo(-11, 10);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }
    }

    // 7. Render All Active Balls with Sub-Frame State Interpolation (Ultra-Smooth 120Hz/144Hz)
    const palette = BALL_SKIN_PALETTES[ballSkin] || BALL_SKIN_PALETTES.cyan;
    const ballSizeLvl = currencyService.getUpgradeLevel('ball_size');
    const ballSpeedLvl = currencyService.getUpgradeLevel('ball_speed');
    const ballImpactLvl = currencyService.getUpgradeLevel('ball_impact');
    const ballTier = designConfig.ballTierOverride || getBallTierFromUpgrades(ballSizeLvl, ballSpeedLvl, ballImpactLvl, trajLvl);

    for (const b of ballList) {
      if (!b.isActive) continue;

      const renderBallX = b.prevX !== undefined && alpha < 0.999
        ? b.prevX + (b.x - b.prevX) * alpha
        : b.x;
      const renderBallY = b.prevY !== undefined && alpha < 0.999
        ? b.prevY + (b.y - b.prevY) * alpha
        : b.y;

      const interpolatedBall: BallState = {
        ...b,
        x: renderBallX,
        y: renderBallY,
      };

      const ballFancyLvl = currencyService.getUpgradeLevel('ball_fancy');
      drawBallWithPreset(ctx, interpolatedBall, designConfig.ballPreset || 1, {
        animTick,
        tier: ballTier,
        palette,
        isMega: b.isMega,
        fancyLevel: ballFancyLvl,
      });
    }
    ctx.restore();
  }
}
