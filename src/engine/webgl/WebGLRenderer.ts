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

    // 2. Draw Stars via GPU Point Sprites (1 draw call for 240 stars!)
    if (particles.stars.length > 0) {
      const starPoints = particles.stars.map((s) => ({
        x: s.x,
        y: s.y,
        size: s.size * 1.5,
        r: 1.0,
        g: 1.0,
        b: 1.0,
        a: Math.max(0.1, Math.min(1.0, s.alpha)),
      }));
      this.glParticles.renderPoints(
        this.shaders.getProgram('particle'),
        starPoints,
        w,
        h
      );
    }

    if (!this.atlas.texture) return;

    // 3. Begin Batched GPU Quad Rendering
    const spriteProg = this.shaders.getProgram('sprite');
    this.batcher.begin(spriteProg, this.atlas.texture, w, h);

    const whiteUV = this.atlas.getUV('white_rect');

    // 3.1. Cosmic Black Hole Singularity Floor
    const bhUV = this.atlas.getUV('blackhole_floor');
    this.batcher.pushSprite(0, h - 44, w, 44, bhUV.u0, bhUV.v0, bhUV.u1, bhUV.v1, 1.0, 1.0, 1.0, 0.9);

    // 3.2. Bottom Forcefield Laser Barrier (Active Shield)
    if (powerUps && powerUps.hasActiveShield()) {
      const shieldY = h - 35;
      this.batcher.pushSprite(0, shieldY - 2, w, 4, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 0.2, 0.9, 0.6, 0.95);
      this.batcher.pushSprite(0, shieldY - 5, w, 10, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 0.1, 0.8, 0.5, 0.25);
    }

    // 3.3. Active Laser Cannon Bolts
    if (powerUps && powerUps.lasers.length > 0) {
      for (const bolt of powerUps.lasers) {
        this.batcher.pushSprite(bolt.x - bolt.w / 2, bolt.y - bolt.h / 2, bolt.w, bolt.h, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 1.0, 0.0, 0.35, 0.9);
        this.batcher.pushSprite(bolt.x - bolt.w / 4, bolt.y - bolt.h / 2 + 2, bolt.w / 2, bolt.h - 4, whiteUV.u0, whiteUV.v0, whiteUV.u1, whiteUV.v1, 1.0, 1.0, 1.0, 1.0);
      }
    }

    // 4. Draw All Alive Blocks in 1 Batched Pass
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.isDead || b.health <= 0) continue;

      const uv = this.atlas.getUV(`block_${b.health}`);
      const tint = b.hitAnim > 0 ? 1.0 + b.hitAnim * 0.6 : 1.0;
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
        1.0
      );
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

    this.batcher.pushSprite(
      renderPaddleX - paddle.width / 2,
      paddle.y,
      paddle.width,
      paddle.height,
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
      const diam = b.radius * 2.4;

      this.batcher.pushSprite(
        renderBallX - diam / 2,
        renderBallY - diam / 2,
        diam,
        diam,
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
