import { BallState, PaddleState, BlockEngineState } from '../types';
import { ParticleSystem } from '../particles';
import { PowerUpManager } from '../powerUps';
import { ExplosionSystem } from '../explosionSystem';
import { ShaderManager } from './ShaderManager';
import { TextureAtlas } from './TextureAtlas';
import { SpriteBatcher } from './SpriteBatcher';
import { GLParticleSystem } from './GLParticleSystem';
import { getBallTierFromUpgrades, getPaddleTierFromUpgrades } from '../../constants/visualPresets';
import { currencyService } from '../../services/currency';
import { ACCRETION_EMBERS, drawBlackHoleFloor } from '../draw/blackHoleDrawers';
import { calculateTrajectoryGuideline } from '../trajectoryGuideline';

export class WebGLRenderer {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private width: number;
  private height: number;
  private shaders: ShaderManager;
  private atlas: TextureAtlas;
  private batcher: SpriteBatcher;
  private glParticles: GLParticleSystem;

  private backdropBuffer: WebGLBuffer | null = null;
  private animTick = 0;
  private shakeIntensity = 0;
  private ballFadeAlphas: Map<number, number> = new Map();

  private bhCanvas: HTMLCanvasElement | null = null;
  private bhCtx: CanvasRenderingContext2D | null = null;
  private bhTexture: WebGLTexture | null = null;
  private readonly bhHeight = 220;

  constructor(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    width: number,
    height: number
  ) {
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.shaders = new ShaderManager(gl);
    this.atlas = new TextureAtlas(gl);
    this.batcher = new SpriteBatcher(gl, 2048);
    this.glParticles = new GLParticleSystem(gl);

    this.initBackdropQuad();
    this.initBlackHoleTexture(gl, width);
  }

  private initBlackHoleTexture(gl: WebGLRenderingContext | WebGL2RenderingContext, width: number) {
    this.bhCanvas = document.createElement('canvas');
    this.bhCanvas.width = width;
    this.bhCanvas.height = this.bhHeight;
    this.bhCtx = this.bhCanvas.getContext('2d', { alpha: true });

    this.bhTexture = gl.createTexture();
    if (this.bhTexture) {
      gl.bindTexture(gl.TEXTURE_2D, this.bhTexture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        this.bhHeight,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
    }
  }

  private initBackdropQuad() {
    const gl = this.gl;
    this.backdropBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropBuffer);
    // Fullscreen quad in NDC
    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
  }

  public triggerShake(intensity: number) {
    this.shakeIntensity = Math.min(22, this.shakeIntensity + intensity);
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  public render(
    balls: BallState[] | BallState,
    paddle: PaddleState,
    blocks: BlockEngineState[],
    particles: ParticleSystem,
    powerUps?: PowerUpManager,
    ballSkin: string = 'cyan',
    alpha: number = 1.0,
    explosions?: ExplosionSystem
  ) {
    const gl = this.gl;
    const w = this.width;
    const h = this.height;
    this.animTick += 0.05;

    gl.viewport(0, 0, w, h);
    gl.clearColor(3 / 255, 4 / 255, 12 / 255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 1. Draw Procedural Cosmic Backdrop
    const backdropProg = this.shaders.getProgram('backdrop');
    gl.useProgram(backdropProg.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.backdropBuffer);
    const posLoc = backdropProg.attribs.aPosition;
    if (posLoc !== undefined) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 2. Draw Stars & Black Hole Embers via GPU Point Sprites
    const particleList: { x: number; y: number; size: number; r: number; g: number; b: number; a: number }[] = [];

    if (particles.stars.length > 0) {
      for (const s of particles.stars) {
        particleList.push({
          x: s.x,
          y: s.y,
          size: s.size * 1.5,
          r: 1.0,
          g: 1.0,
          b: 1.0,
          a: Math.max(0.1, Math.min(1.0, s.alpha)),
        });
      }
    }

    // 40 Relativistic Keplerian Black Hole Embers
    const cx = w * 0.5;
    const cy = h + 24;
    const baseRx = Math.min(w * 0.44, 500);
    const baseRy = 62;
    for (let i = 0; i < ACCRETION_EMBERS.length; i++) {
      const ember = ACCRETION_EMBERS[i];
      const curAngle = ember.angle + this.animTick * ember.speed * 0.85;
      const rX = baseRx * ember.radiusFactor;
      const rY = baseRy * ember.radiusFactor * 0.82;
      const px = cx + Math.cos(curAngle) * rX;
      const py = cy + Math.sin(curAngle) * rY;
      const isCyan = px < cx;
      const depthFactor = (Math.sin(curAngle) + 1.2) / 2.2;
      const doppler = isCyan ? 1.25 : 0.75;
      const finalAlpha = Math.min(1.0, ember.baseAlpha * depthFactor * doppler);
      particleList.push({
        x: px,
        y: py,
        size: ember.size * (0.85 + depthFactor * 0.35) * 2.2,
        r: isCyan ? (i % 2 === 0 ? 0.0 : 1.0) : 0.75,
        g: isCyan ? (i % 2 === 0 ? 0.97 : 1.0) : 0.52,
        b: isCyan ? 1.0 : 0.98,
        a: finalAlpha,
      });
    }

    if (particleList.length > 0) {
      this.glParticles.renderPoints(
        this.shaders.getProgram('particle'),
        particleList,
        w,
        h
      );
    }

    // 3. Cosmic Black Hole Singularity Floor (Dedicated WebGL Texture)
    if (this.bhCtx && this.bhTexture && this.bhCanvas) {
      this.bhCtx.clearRect(0, 0, w, this.bhHeight);
      drawBlackHoleFloor(this.bhCtx, w, this.bhHeight, this.animTick);
      gl.bindTexture(gl.TEXTURE_2D, this.bhTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.bhCanvas);
      const spriteProg = this.shaders.getProgram('sprite');
      this.batcher.begin(spriteProg, this.bhTexture, w, h);
      this.batcher.pushSprite(0, h - this.bhHeight, w, this.bhHeight, 0, 0, 1, 1, 1, 1, 1, 1);
      this.batcher.flush();
    }

    if (!this.atlas.texture) return;

    // 4. Begin Batched GPU Quad Rendering (Atlas)
    const spriteProg = this.shaders.getProgram('sprite');
    this.batcher.begin(spriteProg, this.atlas.texture, w, h);

    const whiteUV = this.atlas.getUV('white_rect');

    // 4.1. Bottom Forcefield Laser Barrier (Active Shield)
    if (powerUps && powerUps.hasActiveShield()) {
      const shieldY = h - 35;
      this.batcher.pushSprite(0, shieldY - 2, w, 4, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 0.2, 0.9, 0.6, 0.95);
      this.batcher.pushSprite(0, shieldY - 5, w, 10, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 0.1, 0.8, 0.5, 0.25);
    }

    // 4.2. Active Laser Cannon Bolts
    if (powerUps && powerUps.lasers.length > 0) {
      for (const bolt of powerUps.lasers) {
        this.batcher.pushSprite(bolt.x - bolt.w / 2, bolt.y - bolt.h / 2, bolt.w, bolt.h, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 1.0, 0.0, 0.35, 0.9);
        this.batcher.pushSprite(bolt.x - bolt.w / 4, bolt.y - bolt.h / 2 + 2, bolt.w / 2, bolt.h - 4, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 1.0, 1.0, 1.0, 1.0);
      }
    }

    // 4.3. Draw All Alive Blocks in 1 Batched Pass
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.isDead || b.health <= 0) continue;

      const blockKey = b.health === 7 ? `block_7_p${b.portalPairId || 1}` : `block_${b.health}`;
      const uv = this.atlas.getUV(blockKey);
      const tint = b.hitAnim > 0 ? 1.0 + b.hitAnim * 0.6 : 1.0;

      // Portal (health 7) recharge cooldown transparency
      let alphaBlock = 1.0;
      if (b.health === 7 && (b.portalRechargeTimer ?? 0) > 0) {
        const ticksLeft = b.portalRechargeTimer!;
        // Distinct dormant transparency during 3s recharge break (acts like an ethereal portal in cooldown)
        alphaBlock = ticksLeft < 30 ? 0.22 + ((30 - ticksLeft) / 30) * 0.78 : 0.22;
      }

      this.batcher.pushSprite(b.x, b.y, b.w, b.h, uv.u0, uv.v0, uv.u1, uv.v1, tint, tint, tint, alphaBlock);

      // Recharging portal: draw an inner pulsing cooldown energy line across the bottom of the portal with theme color
      if (b.health === 7 && (b.portalRechargeTimer ?? 0) > 0) {
        const pairId = b.portalPairId || 1;
        let barR = 0.0, barG = 0.97, barB = 1.0;
        if (pairId === 2) { barR = 0.94; barG = 0.47; barB = 0.98; }
        else if (pairId === 3) { barR = 0.98; barG = 0.75; barB = 0.14; }
        else if (pairId === 4) { barR = 0.20; barG = 0.83; barB = 0.60; }
        const progress = Math.max(0, 1.0 - (b.portalRechargeTimer! / 180));
        const barW = (b.w - 16) * progress;
        this.batcher.pushSprite(b.x + 8, b.y + b.h - 8, barW, 3, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, barR, barG, barB, 0.85);
      }
    }

    // 4.4. Draw Destroying Blocks (Shrinking Inward & Black Hole Suction Animation)
    if (particles.destroyingBlocks.length > 0) {
      for (const db of particles.destroyingBlocks) {
        const dbKey = db.initialHealth === 7 ? 'block_7_p1' : `block_${db.initialHealth}`;
        const uv = this.atlas.getUV(dbKey);
        const cx = db.x + db.w / 2;
        const cy = db.y + db.h / 2;
        const curW = db.w * db.scale;
        const curH = db.h * db.scale;
        this.batcher.pushSprite(cx - curW / 2, cy - curH / 2, curW, curH, uv.u0, uv.v0, uv.u1, uv.v1, 1.25, 1.25, 1.25, db.alpha);
      }
    }

    // 5. Draw Paddle with Sub-frame State Interpolation
    const renderPaddleX =
      paddle.prevX !== undefined && alpha < 0.999
        ? paddle.prevX + (paddle.x - paddle.prevX) * alpha
        : paddle.x;

    const padWidthLvl = currencyService.getUpgradeLevel('paddle_width');
    const padSpeedLvl = currencyService.getUpgradeLevel('paddle_speed');
    const padTier = getPaddleTierFromUpgrades(padWidthLvl, padSpeedLvl);
    const paddleUV = this.atlas.getUV(`paddle_t${padTier}`);
    const padMargin = 16;
    const padSlotW = paddle.width + padMargin * 2;
    const padSlotH = paddle.height + padMargin * 2;

    this.batcher.pushSprite(
      renderPaddleX - paddle.width / 2 - padMargin, paddle.y - padMargin,
      padSlotW, padSlotH, paddleUV.u0, paddleUV.v0, paddleUV.u1, paddleUV.v1, 1.0, 1.0, 1.0, 1.0
    );

    // 5.1. Trajectory Matrix Guideline (8-Ball Pool Style Predictive Beam)
    // Targets the single nearest descending ball (or ball resting on paddle for launch aim)
    const ballList = Array.isArray(balls) ? balls : [balls];
    const trajLvl = currencyService.getUpgradeLevel('ball_trajectory');
    const dotUV = this.atlas.getUV('guideline_dot');
    const reticleUV = this.atlas.getUV('guideline_reticle');
    const arrowUV = this.atlas.getUV('guideline_arrow');

    for (const key of this.ballFadeAlphas.keys()) {
      if (key >= ballList.length) this.ballFadeAlphas.delete(key);
    }

    // Select single priority ball: ball on paddle (launch state) or nearest descending ball to paddle
    let targetIdx = -1;
    let minDescDist = Infinity;
    const targetY = paddle.y - 12;

    for (let i = 0; i < ballList.length; i++) {
      const b = ballList[i];
      if (!b) continue;
      const bRad = b.radius || 10;
      const onPad = !b.isActive || (Math.abs(b.vy) < 0.01 && Math.abs(b.vx) < 0.01) || (b.y >= paddle.y - bRad * 3 && Math.abs(b.vy) < 30);
      if (onPad) {
        targetIdx = i;
        break;
      }
      const dist = (paddle.y - bRad) - b.y;
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
        paddle,
        w,
        h,
        trajLvl,
        prevAlpha,
        1 / 60
      );
      this.ballFadeAlphas.set(idx, nextFadeAlpha);

      if (guideline.visible && guideline.alpha > 0.01) {
        const gAlpha = guideline.alpha;
        const inR = 0.0, inG = 0.97, inB = 1.0;
        const inAlpha = gAlpha * 1.0;

        // 1. Draw Incoming Predictive Dotted Segments (Vibrant Cyan)
        for (const seg of guideline.incomingSegments) {
          const dx = seg.x2 - seg.x1;
          const dy = seg.y2 - seg.y1;
          const len = Math.hypot(dx, dy);
          const stepSize = 34;
          const count = Math.floor(len / stepSize);
          const nx = dx / len, ny = dy / len;

          for (let s = 1; s <= count; s++) {
            const px = seg.x1 + nx * (s * stepSize);
            const py = seg.y1 + ny * (s * stepSize);
            const dotSize = 24;
            this.batcher.pushSprite(px - dotSize / 2, py - dotSize / 2, dotSize, dotSize, dotUV.u0, dotUV.v0, dotUV.u1, dotUV.v1, inR, inG, inB, inAlpha);
          }
        }

        // 2. Draw Target Impact Reticle on Paddle Horizon (Emerald when locked, Cyan when seeking)
        const reticleSize = 40;
        const retR = guideline.isHit ? 0.06 : inR;
        const retG = guideline.isHit ? 0.98 : inG;
        const retB = guideline.isHit ? 0.65 : inB;
        this.batcher.pushSprite(guideline.hitX - reticleSize / 2, guideline.hitY - reticleSize / 2, reticleSize, reticleSize, reticleUV.u0, reticleUV.v0, reticleUV.u1, reticleUV.v1, retR, retG, retB, gAlpha * 1.0);

        // 3. Draw Paddle Lock-on Beam (Emerald when targeted, Cyan indicator when seeking)
        const halfPadW = paddle.width / 2;
        if (guideline.isHit) {
          this.batcher.pushSprite(paddle.x - halfPadW, paddle.y, paddle.width, 5, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 0.06, 0.98, 0.65, gAlpha * 0.9);
        } else {
          const guideX = Math.max(paddle.x - halfPadW, Math.min(paddle.x + halfPadW, guideline.hitX));
          this.batcher.pushSprite(guideX - 8, paddle.y - 4, 16, 6, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, inR, inG, inB, gAlpha * 0.85);
        }

        // 4. Draw Outgoing / Launch Aiming Deflected Guideline
        if (guideline.outgoingSegments.length > 0) {
          const outR = guideline.isLaunchAim ? 0.0 : 0.06;
          const outG = guideline.isLaunchAim ? 0.97 : 0.98;
          const outB = guideline.isLaunchAim ? 1.0 : 0.65;
          const outAlpha = gAlpha * 0.95;

          for (const seg of guideline.outgoingSegments) {
            const dx = seg.x2 - seg.x1;
            const dy = seg.y2 - seg.y1;
            const len = Math.hypot(dx, dy);
            const stepSize = 34;
            const count = Math.floor(len / stepSize);
            const nx = dx / len, ny = dy / len;

            for (let s = 1; s <= count; s++) {
              const px = seg.x1 + nx * (s * stepSize);
              const py = seg.y1 + ny * (s * stepSize);
              const dotSize = 24;
              this.batcher.pushSprite(px - dotSize / 2, py - dotSize / 2, dotSize, dotSize, dotUV.u0, dotUV.v0, dotUV.u1, dotUV.v1, outR, outG, outB, outAlpha * (1.0 - (s / (count + 1)) * 0.3));
            }
          }

          const lastSeg = guideline.outgoingSegments[guideline.outgoingSegments.length - 1];
          const outAngle = Math.atan2(guideline.outVx, -guideline.outVy);
          const arrowSize = 30;
          this.batcher.pushSprite(lastSeg.x2 - arrowSize / 2, lastSeg.y2 - arrowSize / 2, arrowSize, arrowSize, arrowUV.u0, arrowUV.v0, arrowUV.u1, arrowUV.v1, outR, outG, outB, outAlpha, outAngle);
        }
      }
    }

    // 6. Draw Falling Power-Up Shards
    if (powerUps && powerUps.drops.length > 0) {
      for (const drop of powerUps.drops) {
        const puUV = this.atlas.getUV(`pu_${drop.meta.type}`);
        this.batcher.pushSprite(drop.x - 14, drop.y - 14, 28, 28, puUV.u0, puUV.v0, puUV.u1, puUV.v1, 1.0, 1.0, 1.0, 1.0);
      }
    }

    // 7. Draw All Active Balls with Sub-frame Interpolation & Trails
    for (const b of ballList) {
      if (!b.isActive) continue;
      const renderBallX = b.prevX !== undefined && alpha < 0.999 ? b.prevX + (b.x - b.prevX) * alpha : b.x;
      const renderBallY = b.prevY !== undefined && alpha < 0.999 ? b.prevY + (b.y - b.prevY) * alpha : b.y;
      const ballKey = b.isMega ? 'ball_mega' : `ball_${ballSkin}`;
      const ballUV = this.atlas.getUV(ballKey);
      const ballMargin = 12;
      const ballSlotSize = Math.ceil(b.radius * 2 + ballMargin * 2);
      this.batcher.pushSprite(renderBallX - ballSlotSize / 2, renderBallY - ballSlotSize / 2, ballSlotSize, ballSlotSize, ballUV.u0, ballUV.v0, ballUV.u1, ballUV.v1, 1.0, 1.0, 1.0, 1.0);
    }

    // 8. Draw Explosions (Shockwave Rings, Fireball Flare, Shards & Shatter Chunks)
    if (explosions) {
      const ringUV = this.atlas.getUV('shockwave_ring');
      for (const wave of explosions.blastWaves) {
        const rad = wave.radius;
        const progress = Math.min(1.0, wave.radius / wave.maxRadius);
        const alphaWave = Math.max(0, wave.life / wave.maxLife);
        this.batcher.pushSprite(wave.x - rad, wave.y - rad, rad * 2, rad * 2, ringUV.u0, ringUV.v0, ringUV.u1, ringUV.v1, 1.0, 0.65, 0.15, alphaWave);

        // Core Plasma Fireball in WebGL
        if (progress < 0.65) {
          const coreAlpha = alphaWave * (1.0 - progress / 0.65) * 0.85;
          const coreR = Math.max(16, rad * 0.6);
          this.batcher.pushSprite(wave.x - coreR, wave.y - coreR, coreR * 2, coreR * 2, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 1.0, 0.9, 0.4, coreAlpha);
        }
      }

      // Epicenter Explosive Shards & Sparks
      for (const shard of explosions.shards) {
        const sSize = shard.size * 1.5;
        const [sr, sg, sb] = parseColorRgb(shard.color);
        this.batcher.pushSprite(shard.x - sSize / 2, shard.y - sSize / 2, sSize, sSize, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, sr, sg, sb, shard.alpha, shard.angle);
      }

      // Directional Shatter Chunks of Destroyed Near Blocks with Authentic Block Colors
      for (const chunk of explosions.shatterChunks) {
        if (chunk.delay > 0) continue;
        const [cr, cg, cb] = parseColorRgb(chunk.color);
        this.batcher.pushSprite(chunk.x - chunk.w / 2, chunk.y - chunk.h / 2, chunk.w, chunk.h, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, cr, cg, cb, chunk.alpha, chunk.angle);
      }
    }

    // 9. Flush all game objects to GPU in ONE single draw call!
    this.batcher.flush();

    // 9. Draw Combat Particles via GPU Point Sprites
    if (particles.particles.length > 0) {
      const combatPoints = particles.particles.map((p) => ({
        x: p.x, y: p.y, size: Math.max(3.0, p.size * 2.2),
        r: p.r ?? 1.0, g: p.g ?? 0.9, b: p.b ?? 0.3,
        a: Math.max(0.12, Math.min(1.0, p.alpha)),
      }));
      this.glParticles.renderPoints(this.shaders.getProgram('particle'), combatPoints, w, h);
    }
  }
}

function parseColorRgb(color: string): [number, number, number] {
  if (color && color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    if (!isNaN(num)) return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }
  return [1.0, 0.6, 0.2];
}
