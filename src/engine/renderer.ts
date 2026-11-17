import { BallState, PaddleState, BlockEngineState } from './types';
import { ParticleSystem } from './particles';
import { BLOCK_COLORS } from '../constants/game';
import { PowerUpManager } from './powerUps';
import { ExplosionSystem } from './explosionSystem';
import { currencyService } from '../services/currency';
import { getActiveDesignConfig, getBallTierFromUpgrades } from '../constants/visualPresets';
import { drawBlockWithPreset } from './draw/blockDrawers';
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
        ctx.fillStyle = db.color;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(-db.w / 2, -db.h / 2, db.w, db.h, 4);
        } else {
          ctx.rect(-db.w / 2, -db.h / 2, db.w, db.h);
        }
        ctx.fill();
        ctx.strokeStyle = db.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();
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
    const widthLevel = currencyService.getUpgradeLevel('paddle_width');
    const speedLevel = currencyService.getUpgradeLevel('paddle_speed');
    drawPaddleWithPreset(ctx, interpolatedPaddle, 1, {
      animTick,
      hasLaser,
      hasShield,
      widthLevel,
      speedLevel,
      tier: designConfig.paddleTierOverride,
    });

    // 6.1. Trajectory Matrix Guideline (8-Ball Pool Style Predictive Beam)
    // Supports all active balls simultaneously (especially during Multiball)
    const trajLvl = currencyService.getUpgradeLevel('ball_trajectory');
    
    // Clean up fade alphas for balls that no longer exist
    for (const key of this.ballFadeAlphas.keys()) {
      if (key >= ballList.length) this.ballFadeAlphas.delete(key);
    }

    // Select single priority ball: ball on paddle (launch state) or nearest descending ball to paddle
    let targetIdx = -1;
    let minDescDist = Infinity;
    for (let i = 0; i < ballList.length; i++) {
      const b = ballList[i];
      if (!b) continue;
      const bRad = b.radius || 10;
      const onPad = !b.isActive || (Math.abs(b.vy) < 0.01 && Math.abs(b.vx) < 0.01) || (b.y >= interpolatedPaddle.y - bRad * 3 && Math.abs(b.vy) < 30);
      if (onPad) {
        targetIdx = i;
        break;
      }
      const dist = (interpolatedPaddle.y - bRad) - b.y;
      if (b.isActive && b.vy > 15 && dist > 0 && dist < minDescDist) {
        minDescDist = dist;
        targetIdx = i;
      }
    }

    for (let idx = 0; idx < ballList.length; idx++) {
      const b = ballList[idx];
      const prevAlpha = this.ballFadeAlphas.get(idx) || 0;

      if (!b || idx !== targetIdx) {
        if (prevAlpha > 0.01) this.ballFadeAlphas.set(idx, Math.max(0, prevAlpha - 1/60 * 3.5));
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

      // Display incoming / launch aiming guideline
      if (guideline.visible && guideline.alpha > 0.01) {
        ctx.save();
        const gAlpha = guideline.alpha;

        // 1. Incoming Predictive Dotted Line (Vibrant Cyan, NEVER Red)
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

        // 2. Impact Target Reticle (Emerald when locked, Cyan otherwise - Triple-ring concentric marker)
        ctx.setLineDash([]);
        const retColor = guideline.isHit ? `rgba(16, 185, 129, ${gAlpha * 0.95})` : `rgba(0, 247, 255, ${gAlpha * 0.95})`;
        ctx.shadowColor = guideline.isHit ? '#10b981' : '#00f7ff';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(guideline.hitX, guideline.hitY, 18, 0, Math.PI * 2);
        ctx.strokeStyle = retColor;
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

        // 3. Paddle Face Beam
        const halfPadW = interpolatedPaddle.width / 2;
        if (guideline.isHit) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${gAlpha * 0.95})`;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 14;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(interpolatedPaddle.x - halfPadW, interpolatedPaddle.y);
          ctx.lineTo(interpolatedPaddle.x + halfPadW, interpolatedPaddle.y);
          ctx.stroke();
        } else {
          const guideX = Math.max(interpolatedPaddle.x - halfPadW, Math.min(interpolatedPaddle.x + halfPadW, guideline.hitX));
          ctx.fillStyle = `rgba(0, 247, 255, ${gAlpha * 0.9})`;
          ctx.fillRect(guideX - 8, interpolatedPaddle.y - 4, 16, 6);
        }

        // 4. Outgoing / Launch Aiming Deflected Guideline
        if (guideline.outgoingSegments.length > 0) {
          const outCol = guideline.isLaunchAim ? `rgba(0, 247, 255, ${gAlpha * 0.95})` : `rgba(16, 185, 129, ${gAlpha * 0.95})`;
          ctx.strokeStyle = outCol;
          ctx.shadowColor = guideline.isLaunchAim ? '#00f7ff' : '#10b981';
          ctx.shadowBlur = 12;
          ctx.lineWidth = 5.5;
          ctx.setLineDash([16, 14]);

          for (const seg of guideline.outgoingSegments) {
            ctx.beginPath();
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
            ctx.stroke();
          }

          // Directional Arrowhead
          const lastSeg = guideline.outgoingSegments[guideline.outgoingSegments.length - 1];
          const outAngle = Math.atan2(guideline.outVx, -guideline.outVy);
          ctx.setLineDash([]);
          ctx.save();
          ctx.translate(lastSeg.x2, lastSeg.y2);
          ctx.rotate(outAngle);
          ctx.fillStyle = guideline.isLaunchAim ? `rgba(0, 247, 255, ${gAlpha})` : `rgba(52, 211, 153, ${gAlpha})`;
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

      drawBallWithPreset(ctx, interpolatedBall, designConfig.ballPreset || 1, {
        animTick,
        tier: ballTier,
        palette,
        isMega: b.isMega,
      });
    }
    ctx.restore();
  }
}
