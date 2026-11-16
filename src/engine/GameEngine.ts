import { WasmPhysicsBridge } from './wasmBridge';
import { PhysicsWorld } from './physics';
import { ParticleSystem } from './particles';
import { GameRenderer } from './renderer';
import { WebGLRenderer } from './webgl/WebGLRenderer';
import { createWebGLContext } from './webgl/WebGLContext';
import { AudioBridge } from './audioBridge';
import { PowerUpManager } from './powerUps';
import { ExplosionSystem } from './explosionSystem';
import { currencyService } from '../services/currency';
import { LevelData, BlockData } from '../types/game';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT,
  PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS, BALL_SPEED, BLOCK_COLORS,
} from '../constants/game';
import { ScoreState, EngineCallbacks, CollisionEvent } from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private glRenderer: WebGLRenderer | null = null;
  private useWebGL = false;
  private wasmBridge: WasmPhysicsBridge;
  private tsPhysics: PhysicsWorld;
  private particles: ParticleSystem;
  private renderer: GameRenderer;
  private audio: AudioBridge;
  public powerUps: PowerUpManager;
  public explosions: ExplosionSystem;
  private ballSkin = 'cyan';
  private useWasm = false;
  private animFrameId: number | null = null;
  private lastTime = 0;
  private accumulator = 0;
  private isPaused = false;
  private buffsEmitTimer = 0;
  private readonly FIXED_STEP = 1 / 60;
  private readonly MAX_FRAME_DELTA = 0.1;

  public state: ScoreState = {
    score: 0, blocksDestroyed: 0, totalBreakable: 0,
    combo: 0, maxCombo: 0, timeUsed: 0, lives: 3, status: 'countdown',
  };

  private currentLevel: LevelData | null = null;
  private callbacks: EngineCallbacks = {};

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks = {}) {
    this.canvas = canvas;
    const glResult = createWebGLContext(canvas);
    if (glResult) {
      this.glRenderer = new WebGLRenderer(glResult.gl, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.useWebGL = true;
    } else {
      const context = canvas.getContext('2d', { alpha: true });
      if (!context) throw new Error('Could not get 2D or WebGL canvas context');
      this.ctx = context;
      this.useWebGL = false;
    }

    this.callbacks = callbacks;
    this.wasmBridge = new WasmPhysicsBridge();
    this.tsPhysics = new PhysicsWorld({
      width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
      paddleWidth: PADDLE_WIDTH, paddleHeight: PADDLE_HEIGHT,
      ballRadius: BALL_RADIUS, ballSpeed: BALL_SPEED,
      blockWidth: BLOCK_WIDTH, blockHeight: BLOCK_HEIGHT,
      substeps: 6,
    });

    this.particles = new ParticleSystem(CANVAS_WIDTH, CANVAS_HEIGHT, 240);
    this.renderer = new GameRenderer(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.audio = new AudioBridge(true);
    this.powerUps = new PowerUpManager();
    this.explosions = new ExplosionSystem();
  }

  public async initialize(): Promise<void> {
    const wasmSuccess = await this.wasmBridge.initialize();
    this.useWasm = wasmSuccess;
  }

  public setVibrate(enabled: boolean) { this.audio.setVibrate(enabled); }
  public setPaddleTarget(targetX: number) {
    this.tsPhysics.setPaddleTarget(targetX);
    if (this.useWasm && this.wasmBridge.ready) this.wasmBridge.setPaddleTarget(targetX);
  }
  public getPaddleTarget(): number { return this.tsPhysics.paddle.targetX; }
  public getPaddleMaxSpeed(): number { return this.tsPhysics.paddle.maxSpeed ?? 1600; }
  public getPaddlePosition(): number { return this.tsPhysics.paddle.x; }
  public pause() { this.isPaused = true; }
  public resume() { this.isPaused = false; this.lastTime = performance.now(); this.accumulator = 0; }
  public getIsPaused(): boolean { return this.isPaused; }
  public stopLoop() { if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = null; } }
  public setBallSkin(skin?: string) { if (skin) this.ballSkin = skin; }
  public destroy() { this.stopLoop(); }

  public movePaddleRelative(deltaX: number) {
    const padSpeedLvl = currencyService.getUpgradeLevel('paddle_speed');
    this.setPaddleTarget(this.tsPhysics.paddle.targetX + deltaX * (1 + (padSpeedLvl - 1) * 0.12));
  }

  public startLevel(level: LevelData) {
    this.currentLevel = level;
    this.particles.clear();
    this.explosions.clear();
    this.powerUps.reset();
    this.accumulator = 0;

    const breakables = level.blocks.filter((b) => (b.h >= 1 && b.h <= 5) || b.h === 8).length;
    this.state = {
      score: 0, blocksDestroyed: 0, totalBreakable: breakables,
      combo: 0, maxCombo: 0, timeUsed: 0, lives: 3, status: 'countdown',
    };

    const { padW, padSpd, ballRad, ballSpd } = this.applyUpgrades();
    const initialBallX = CANVAS_WIDTH / 2;
    const initialBallY = CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - ballRad - 5;

    this.tsPhysics.loadBlocks(level.blocks);
    this.tsPhysics.resetBall(initialBallX, initialBallY, 0, 0);
    if (this.tsPhysics.balls[0]) {
      this.tsPhysics.balls[0].radius = ballRad;
      this.tsPhysics.balls[0].baseSpeed = ballSpd;
      this.tsPhysics.balls[0].speed = ballSpd;
    }

    if (this.useWasm && this.wasmBridge.ready) {
      this.wasmBridge.initEngine(CANVAS_WIDTH, CANVAS_HEIGHT, padW, PADDLE_HEIGHT, ballRad, ballSpd, BLOCK_WIDTH, BLOCK_HEIGHT);
      this.wasmBridge.loadBlocks(level.blocks, BLOCK_WIDTH, BLOCK_HEIGHT);
      this.wasmBridge.resetBall(initialBallX, initialBallY, 0, 0);
    }

    this.callbacks.onLivesChange?.(this.state.lives);
    this.callbacks.onComboChange?.(0);
    this.callbacks.onScoreUpdate?.(this.state);
  }

  private applyUpgrades() {
    const padW = PADDLE_WIDTH * (1 + (currencyService.getUpgradeLevel('paddle_width') - 1) * 0.08);
    const padSpd = 1600 * (1 + (currencyService.getUpgradeLevel('paddle_speed') - 1) * 0.12);
    const ballRad = BALL_RADIUS * (1 + (currencyService.getUpgradeLevel('ball_size') - 1) * 0.05);
    const ballSpd = BALL_SPEED * (1 + (currencyService.getUpgradeLevel('ball_speed') - 1) * 0.035);
    this.tsPhysics.paddle.width = padW;
    this.tsPhysics.paddle.maxSpeed = padSpd;
    this.tsPhysics.config.ballRadius = ballRad;
    this.tsPhysics.config.ballSpeed = ballSpd;
    return { padW, padSpd, ballRad, ballSpd };
  }

  public launchBall() {
    if (this.state.status !== 'countdown' && this.state.status !== 'playing' && this.state.status !== 'paused') return;
    this.state.status = 'playing';

    const { padW, padSpd, ballRad, ballSpd } = this.applyUpgrades();
    const paddle = this.tsPhysics.paddle;
    const ballX = paddle.x;
    const ballY = paddle.y - ballRad - 4;
    const maxSpeed = paddle.maxSpeed || 1600;
    const paddleVelRatio = Math.max(-1, Math.min(1, paddle.vx / maxSpeed));
    const boardCenter = CANVAS_WIDTH / 2;
    const paddlePosRatio = (paddle.x - boardCenter) / boardCenter;

    let throwAngle = Math.abs(paddle.vx) > 30
      ? -Math.PI / 2 + paddleVelRatio * 0.55
      : -Math.PI / 2 + (-paddlePosRatio * 0.25) + (Math.random() - 0.5) * 0.1;

    throwAngle = Math.max((-150 * Math.PI) / 180, Math.min((-30 * Math.PI) / 180, throwAngle));
    const vx = Math.cos(throwAngle) * ballSpd;
    const vy = Math.sin(throwAngle) * ballSpd;

    this.tsPhysics.resetBall(ballX, ballY, vx, vy);
    if (this.tsPhysics.balls[0]) {
      Object.assign(this.tsPhysics.balls[0], {
        radius: ballRad, baseSpeed: ballSpd, speed: ballSpd, prevX: ballX, prevY: ballY,
      });
    }

    if (this.useWasm && this.wasmBridge.ready) {
      this.wasmBridge.resetBall(ballX, ballY, vx, vy);
    }
  }

  public startLoop() {
    if (this.animFrameId) return;
    this.lastTime = performance.now();
    this.accumulator = 0;
    let isFirstFrame = true;

    const loop = () => {
      const now = performance.now();
      if (isFirstFrame) { this.lastTime = now; this.accumulator = 0; isFirstFrame = false; }
      let dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      if (this.isPaused) {
        this.accumulator = 0;
        this.render();
        this.animFrameId = requestAnimationFrame(loop);
        return;
      }

      if (dt > this.MAX_FRAME_DELTA) dt = this.MAX_FRAME_DELTA;
      this.accumulator += dt;
      while (this.accumulator >= this.FIXED_STEP) {
        this.fixedTick(this.FIXED_STEP);
        this.accumulator -= this.FIXED_STEP;
      }
      this.render(Math.max(0, Math.min(1, this.accumulator / this.FIXED_STEP)));
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private recordScore(combo: number, pts: number) {
    this.state.combo = combo;
    if (this.state.combo > this.state.maxCombo) this.state.maxCombo = this.state.combo;
    this.state.score += pts;
    this.callbacks.onComboChange?.(this.state.combo);
    this.callbacks.onScoreUpdate?.(this.state);
  }

  private fixedTick(dt: number) {
    if (this.state.status !== 'playing') {
      const halfPadW = this.tsPhysics.paddle.width / 2;
      this.tsPhysics.paddle.prevX = this.tsPhysics.paddle.x;

      const maxSpeed = this.tsPhysics.paddle.maxSpeed ?? 1600;
      const maxStep = maxSpeed * dt;
      const dx = this.tsPhysics.paddle.targetX - this.tsPhysics.paddle.x;
      const dist = Math.abs(dx);
      if (dist > 0.01) {
        const step = dist >= maxStep ? Math.sign(dx) * maxStep : dx;
        this.tsPhysics.paddle.vx = step / dt;
        this.tsPhysics.paddle.x += step;
      } else {
        this.tsPhysics.paddle.x = this.tsPhysics.paddle.targetX;
        this.tsPhysics.paddle.vx = 0;
      }

      this.tsPhysics.paddle.x = Math.max(halfPadW, Math.min(this.tsPhysics.config.width - halfPadW, this.tsPhysics.paddle.x));

      for (const b of this.tsPhysics.balls) {
        b.prevX = b.x; b.prevY = b.y;
        b.x = this.tsPhysics.paddle.x; b.y = this.tsPhysics.paddle.y - b.radius - 4;
        b.vx = 0; b.vy = 0; b.isActive = false;
      }
      this.particles.update(CANVAS_WIDTH, CANVAS_HEIGHT);
      this.explosions.update();
      return;
    }

    this.state.timeUsed += dt;

    // Apply Active Modifiers
    const isSlowMo = this.powerUps.buffs.slowMo > 0;
    for (const b of this.tsPhysics.balls) {
      const targetSpeed = isSlowMo ? b.baseSpeed * 0.55 : b.baseSpeed;
      b.speed = targetSpeed;
      const curV = Math.hypot(b.vx, b.vy);
      if (curV > 0.01 && Math.abs(curV - targetSpeed) > 1.0) {
        b.vx = (b.vx / curV) * targetSpeed;
        b.vy = (b.vy / curV) * targetSpeed;
      }
    }

    const isExpand = this.powerUps.buffs.expand > 0;
    const padWidthLvl = currencyService.getUpgradeLevel('paddle_width');
    const basePadW = PADDLE_WIDTH * (1 + (padWidthLvl - 1) * 0.08);
    const expandMultiplier = 1.30 + (currencyService.getUpgradeLevel('expand_power') - 1) * 0.04;
    this.tsPhysics.paddle.width = isExpand ? basePadW * expandMultiplier : basePadW;
    this.tsPhysics.paddle.maxSpeed = 1600 * (1 + (currencyService.getUpgradeLevel('paddle_speed') - 1) * 0.12);
    this.tsPhysics.isMegaBall = this.powerUps.buffs.megaBall > 0;
    this.tsPhysics.hasShield = this.powerUps.hasActiveShield();
    this.tsPhysics.ballImpactLevel = currencyService.getUpgradeLevel('ball_impact');

    let events: CollisionEvent[];
    if (this.useWasm && this.wasmBridge.ready) {
      this.wasmBridge.setModifiers(this.tsPhysics.hasShield, this.tsPhysics.isMegaBall, this.tsPhysics.ballImpactLevel, this.tsPhysics.paddle.maxSpeed);
      this.wasmBridge.update(6);
      this.tsPhysics.balls = this.wasmBridge.syncBallStates(this.tsPhysics.balls);
      this.wasmBridge.getPaddleState(this.tsPhysics.paddle);
      this.wasmBridge.syncBlockStates(this.tsPhysics.blocks);
      this.tsPhysics.remainingBreakable = this.wasmBridge.getRemainingBreakable();
      this.state.combo = this.wasmBridge.getCombo();
      events = this.wasmBridge.pollEvents();
    } else {
      events = this.tsPhysics.step(6);
    }
    const { collected, laserHits } = this.powerUps.update(this.tsPhysics.paddle, dt, this.tsPhysics.blocks);

    if (this.callbacks.onBuffsChange) {
      this.buffsEmitTimer = (this.buffsEmitTimer || 0) + 1;
      if (this.buffsEmitTimer >= 6 || collected.length > 0) {
        this.buffsEmitTimer = 0;
        const activeList = this.powerUps.getActiveBuffs();
        const activeBalls = this.tsPhysics.balls.filter((b) => b.isActive).length;
        if (activeBalls > 1) {
          activeList.unshift({
            type: 'multiball', name: `MULTI-BALL (${activeBalls}x)`, current: activeBalls, max: 8, color: '#00f7ff', glow: 'rgba(0, 247, 255, 0.4)', isShield: true,
          });
        }
        this.callbacks.onBuffsChange(activeList);
      }
    }

    for (const powerType of collected) {
      this.audio.triggerEvent('powerup_collect');
      if (powerType === 'multiball') {
        const extraCount = 1 + currencyService.getUpgradeLevel('multi_power');
        this.tsPhysics.spawnExtraBalls(extraCount);
        if (this.useWasm && this.wasmBridge.ready) {
          this.wasmBridge.spawnExtraBalls(extraCount);
        }
        this.particles.spawnVictoryConfetti(CANVAS_WIDTH, CANVAS_HEIGHT);
        this.audio.unlockAchievement('multiball_chaos');
      } else if (powerType === 'shield') {
        this.tsPhysics.hasShield = this.powerUps.hasActiveShield();
      }
      this.particles.addFloatingText(`${powerType.toUpperCase()}`, this.tsPhysics.paddle.x, this.tsPhysics.paddle.y - 35, '#00f7ff');
    }

    for (const hit of laserHits) {
      const block = this.tsPhysics.blocks[hit.blockIndex];
      if (block && !block.isDead) {
        block.hitAnim = 1.0;
        if (this.useWasm && this.wasmBridge.ready) {
          this.wasmBridge.damageBlock(hit.blockIndex, 1);
        }
        if (block.health >= 1 && block.health <= 5) {
          block.health--;
          if (block.health <= 0) {
            block.isDead = true;
            this.tsPhysics.remainingBreakable = Math.max(0, this.tsPhysics.remainingBreakable - 1);
            events.push({ type: 'block_destroy', blockIndex: hit.blockIndex, hitX: hit.x, hitY: hit.y, combo: ++this.state.combo });
          }
        }
      }
    }

    // 4. Process Collision & Combat Events
    const ballImpactLvl = currencyService.getUpgradeLevel('ball_impact');
    const impactShakeMult = 1 + (ballImpactLvl - 1) * 0.15;

    for (const ev of events) {
      this.audio.triggerEvent(ev.type, ev.combo);
      this.callbacks.onEventAudio?.(ev.type, ev.combo);

      if (ev.type === 'paddle') {
        this.particles.spawnPaddleBounce(ev.hitX, ev.hitY);
        this.state.combo = 0;
        this.callbacks.onComboChange?.(0);
      } else if (ev.type === 'portal_warp') {
        this.particles.spawnPaddleBounce(ev.hitX, ev.hitY);
        this.particles.addFloatingText('🌀 PORTAL WARP', ev.hitX, ev.hitY, '#00f7ff');
        this.triggerCameraShake(2.0);
      } else if (ev.type === 'emp_explode') {
        this.explosions.spawnExplosion(ev.hitX, ev.hitY, this.tsPhysics.config.blockWidth * 2.3);
        this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, '#ff9900', true);
        this.particles.addFloatingText('💥 EMP DETONATION!', ev.hitX, ev.hitY, '#ff3b00');
        this.triggerCameraShake(14.0);
        this.state.blocksDestroyed++;
        this.recordScore(ev.combo, 500);
        if (this.tsPhysics.remainingBreakable <= 0 && this.state.status === 'playing') {
          this.handleWin();
          return;
        }
      } else if (ev.type === 'shield_bounce') {
        this.powerUps.consumeShield();
        this.tsPhysics.hasShield = this.powerUps.hasActiveShield();
        this.particles.spawnPaddleBounce(ev.hitX, ev.hitY);
        this.particles.addFloatingText('🛡️ FORCEFIELD SAVED', ev.hitX, ev.hitY, '#10b981');
        this.triggerCameraShake(3.0);
      } else if (ev.type === 'block_damage' || ev.type === 'crit_damage' || ev.type === 'block_destroy') {
        const block = this.tsPhysics.blocks[ev.blockIndex];
        const isCrit = ev.type === 'crit_damage';
        const isDestroy = ev.type === 'block_destroy';
        const fallback = isCrit ? '#fbbf24' : isDestroy ? '#ff0844' : '#00f7ff';
        const color = block ? BLOCK_COLORS[block.initialHealth]?.border || fallback : fallback;

        // If block destroyed or damaged by EMP blast wave, trigger dedicated near-block explosion animation
        if (ev.source === 'emp' && ev.epicenterX !== undefined && ev.epicenterY !== undefined && block) {
          if (isDestroy) this.explosions.spawnNearBlockShatter(block.x, block.y, block.w, block.h, color, ev.epicenterX, ev.epicenterY);
          else this.explosions.spawnNearBlockDamage(block.x, block.y, block.w, block.h, color);
        } else {
          this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, color, isCrit || isDestroy);
        }

        this.triggerCameraShake((isCrit || isDestroy ? 3.5 : 1.5) * impactShakeMult);

        let pts = 50 * (1 + Math.floor(ev.combo / 3));
        let text = `+${pts}`;
        if (isCrit) {
          pts = 100 * (1 + Math.floor(ev.combo / 2));
          text = `💥 CRIT +${pts}`;
        } else if (isDestroy) {
          this.powerUps.spawnDrop(ev.hitX, ev.hitY, 0.32);
          this.state.blocksDestroyed++;
          pts = 100 * (1 + ev.combo);
          text = ev.combo > 1 ? `+${pts} (${ev.combo}x)` : `+${pts}`;
        }
        this.particles.addFloatingText(text, ev.hitX, ev.hitY, isCrit ? '#fbbf24' : color);
        this.recordScore(ev.combo, pts);
        if (isDestroy && this.tsPhysics.remainingBreakable <= 0 && this.state.status === 'playing') {
          this.handleWin();
          return;
        }
      } else if (ev.type === 'ball_lost') {
        this.triggerCameraShake(10.0);
        this.handleLifeLost();
        return;
      }
    }

    let deadCount = 0, remCount = 0;
    for (const b of this.tsPhysics.blocks) {
      if ((b.initialHealth >= 1 && b.initialHealth <= 5) || b.initialHealth === 8) {
        if (b.isDead) deadCount++; else remCount++;
      }
    }
    this.state.blocksDestroyed = Math.max(this.state.blocksDestroyed, deadCount);
    this.tsPhysics.remainingBreakable = remCount;
    if (remCount <= 0 && this.state.status === 'playing') { this.handleWin(); return; }

    // 5. Update Ball Motion Trails
    for (const b of this.tsPhysics.balls) {
      if (b.isActive) {
        b.trail.unshift({ x: b.x, y: b.y, alpha: 1.0, size: b.radius * 0.85 });
        if (b.trail.length > 8) b.trail.pop();
        for (let i = 0; i < b.trail.length; i++) {
          b.trail[i].alpha *= 0.72;
          b.trail[i].size *= 0.94;
        }
      } else {
        b.trail = [];
      }
    }
    this.particles.update(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.explosions.update();
  }

  private handleLifeLost() {
    if (this.state.status !== 'playing') return;

    this.state.lives--;
    this.callbacks.onLivesChange?.(this.state.lives);
    this.state.combo = 0;
    this.callbacks.onComboChange?.(0);

    if (this.state.lives <= 0) {
      this.state.status = 'gameover';
      this.audio.playGameOver();
      this.callbacks.onGameOver?.(this.state);
      return;
    }

    this.state.status = 'paused';
    const { ballRad } = this.applyUpgrades();
    const paddleX = this.tsPhysics.paddle.x;
    const resetY = this.tsPhysics.paddle.y - ballRad - 4;
    this.tsPhysics.paddle.prevX = paddleX;
    this.tsPhysics.resetBall(paddleX, resetY, 0, 0);
    if (this.tsPhysics.balls[0]) Object.assign(this.tsPhysics.balls[0], { radius: ballRad, prevX: paddleX, prevY: resetY });
    if (this.useWasm && this.wasmBridge.ready) this.wasmBridge.resetBall(paddleX, resetY, 0, 0);

    setTimeout(() => {
      if (this.state.lives > 0 && (this.state.status === 'paused' || this.state.status === 'countdown')) this.launchBall();
    }, 700);
  }

  private handleWin() {
    this.state.status = 'win';
    this.state.blocksDestroyed = this.state.totalBreakable;
    this.audio.playWin();
    const timeBonus = Math.max(0, Math.floor(1000 - this.state.timeUsed * 25));
    const lifeBonus = this.state.lives * 250;
    this.state.score += timeBonus + lifeBonus;
    this.particles.spawnVictoryConfetti(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.particles.addFloatingText('LEVEL CLEARED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.42, '#00f7ff');
    this.callbacks.onLevelWin?.(this.state);
  }

  private triggerCameraShake(intensity: number) {
    if (this.useWebGL && this.glRenderer) this.glRenderer.triggerShake(intensity);
    else this.renderer.triggerShake(intensity);
  }

  public render(alpha: number = 1.0) {
    if (this.useWebGL && this.glRenderer) {
      this.glRenderer.render(this.tsPhysics.balls, this.tsPhysics.paddle, this.tsPhysics.blocks, this.particles, this.powerUps, this.ballSkin, alpha, this.explosions);
    } else if (this.ctx) {
      this.renderer.render(this.ctx, this.tsPhysics.balls, this.tsPhysics.paddle, this.tsPhysics.blocks, this.particles, this.powerUps, this.ballSkin, alpha, this.explosions);
    }
  }
}
