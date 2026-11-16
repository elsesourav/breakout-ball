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

    // 3. Cosmic Black Hole Singularity Floor (Dedicated WebGL Texture with exact same draw)
    if (this.bhCtx && this.bhTexture && this.bhCanvas) {
      this.bhCtx.clearRect(0, 0, w, this.bhHeight);
      drawBlackHoleFloor(this.bhCtx, w, this.bhHeight, this.animTick);
      gl.bindTexture(gl.TEXTURE_2D, this.bhTexture);
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.bhCanvas
      );

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

      const uv = this.atlas.getUV(`block_${b.health}`);
      const tint = b.hitAnim > 0 ? 1.0 + b.hitAnim * 0.6 : 1.0;

      // Portal (health 7) recharge cooldown transparency
      let alphaBlock = 1.0;
      if (b.health === 7 && (b.portalRechargeTimer ?? 0) > 0) {
        const ticksLeft = b.portalRechargeTimer!;
        // Distinct dormant transparency during 3s recharge break (acts like an ethereal portal in cooldown)
        alphaBlock = ticksLeft < 30 ? 0.22 + ((30 - ticksLeft) / 30) * 0.78 : 0.22;
      }

      this.batcher.pushSprite(
        b.x,
        b.y,
        b.w,
        b.h,
        uv.u0,
        uv.v0,
        uv.u1,
        uv.v1,
        tint,
        tint,
        tint,
        alphaBlock
      );

      // Recharging portal: draw an inner pulsing cooldown energy line across the bottom of the portal
      if (b.health === 7 && (b.portalRechargeTimer ?? 0) > 0) {
        const progress = Math.max(0, 1.0 - (b.portalRechargeTimer! / 180));
        const barW = (b.w - 16) * progress;
        this.batcher.pushSprite(
          b.x + 8,
          b.y + b.h - 8,
          barW,
          3,
          whiteUV.u0,
          whiteUV.v0,
          whiteUV.u1,
          whiteUV.v1,
          0.0,
          0.97,
          1.0,
          0.85
        );
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
      renderPaddleX - paddle.width / 2 - padMargin,
      paddle.y - padMargin,
      padSlotW,
      padSlotH,
      paddleUV.u0,
      paddleUV.v0,
      paddleUV.u1,
      paddleUV.v1,
      1.0,
      1.0,
      1.0,
      1.0
    );

    // 6. Draw Falling Power-Up Shards
    if (powerUps && powerUps.drops.length > 0) {
      for (const drop of powerUps.drops) {
        const puUV = this.atlas.getUV(`pu_${drop.meta.type}`);
        this.batcher.pushSprite(
          drop.x - 14,
          drop.y - 14,
          28,
          28,
          puUV.u0,
          puUV.v0,
          puUV.u1,
          puUV.v1,
          1.0,
          1.0,
          1.0,
          1.0
        );
      }
    }

    // 7. Draw All Active Balls with Sub-frame Interpolation & Trails
    const ballList = Array.isArray(balls) ? balls : [balls];
    for (const b of ballList) {
      if (!b.isActive) continue;

      const renderBallX =
        b.prevX !== undefined && alpha < 0.999
          ? b.prevX + (b.x - b.prevX) * alpha
          : b.x;
      const renderBallY =
        b.prevY !== undefined && alpha < 0.999
          ? b.prevY + (b.y - b.prevY) * alpha
          : b.y;

      const ballKey = b.isMega ? 'ball_mega' : `ball_${ballSkin}`;
      const ballUV = this.atlas.getUV(ballKey);
      const ballMargin = 12;
      const ballSlotSize = Math.ceil(b.radius * 2 + ballMargin * 2);

      this.batcher.pushSprite(
        renderBallX - ballSlotSize / 2,
        renderBallY - ballSlotSize / 2,
        ballSlotSize,
        ballSlotSize,
        ballUV.u0,
        ballUV.v0,
        ballUV.u1,
        ballUV.v1,
        1.0,
        1.0,
        1.0,
        1.0
      );
    }

    // 8. Draw Explosions (Shockwave Rings & Near-Block Shatter Chunks)
    if (explosions) {
      const ringUV = this.atlas.getUV('shockwave_ring');
      for (const wave of explosions.blastWaves) {
        const rad = wave.radius;
        const alphaWave = Math.max(0, wave.life / wave.maxLife);
        this.batcher.pushSprite(
          wave.x - rad,
          wave.y - rad,
          rad * 2,
          rad * 2,
          ringUV.u0,
          ringUV.v0,
          ringUV.u1,
          ringUV.v1,
          1.0,
          0.6,
          0.1,
          alphaWave
        );
      }
      for (const chunk of explosions.shatterChunks) {
        if (chunk.delay > 0) continue;
        this.batcher.pushSprite(
          chunk.x - chunk.w / 2,
          chunk.y - chunk.h / 2,
          chunk.w,
          chunk.h,
          whiteUV.u0,
          whiteUV.v0,
          whiteUV.u1,
          whiteUV.v1,
          1.0,
          0.3,
          0.2,
          chunk.alpha,
          chunk.angle
        );
      }
    }

    // 9. Flush all game objects to GPU in ONE single draw call!
    this.batcher.flush();

    // 9. Draw Combat Particles via GPU Point Sprites
    if (particles.particles.length > 0) {
      const combatPoints = particles.particles.map((p) => ({
        x: p.x,
        y: p.y,
        size: p.size * 1.8,
        r: 1.0,
        g: 0.9,
        b: 0.3,
        a: Math.max(0.05, Math.min(1.0, p.alpha)),
      }));
      this.glParticles.renderPoints(
        this.shaders.getProgram('particle'),
        combatPoints,
        w,
        h
      );
    }
  }
}
