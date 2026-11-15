import { WasmPhysicsBridge } from './wasmBridge';
import { PhysicsWorld } from './physics';
import { ParticleSystem } from './particles';
import { GameRenderer } from './renderer';
import { AudioBridge } from './audioBridge';
import { PowerUpManager } from './powerUps';
import { currencyService } from '../services/currency';
import { LevelData, BlockData } from '../types/game';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_WIDTH,
  BLOCK_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  BALL_SPEED,
  BLOCK_COLORS,
} from '../constants/game';
import { ScoreState, EngineCallbacks, CollisionEvent } from './types';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private wasmBridge: WasmPhysicsBridge;
  private tsPhysics: PhysicsWorld;
  private particles: ParticleSystem;
  private renderer: GameRenderer;
  private audio: AudioBridge;
  public powerUps: PowerUpManager;
  private ballSkin: string = 'cyan';

  private useWasm: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private isPaused: boolean = false;

  // Fixed 60Hz physics timestep (0.016667s) guarantees identical speed on all devices (60Hz, 120Hz, 144Hz, 240Hz, mobile, tablet)
  private readonly FIXED_STEP: number = 1 / 60;
  private readonly MAX_FRAME_DELTA: number = 0.1; // 100ms cap to prevent spiral of death

  public state: ScoreState = {
    score: 0,
    blocksDestroyed: 0,
    totalBreakable: 0,
    combo: 0,
    maxCombo: 0,
    timeUsed: 0,
    lives: 3,
    status: 'countdown',
  };

  private currentLevel: LevelData | null = null;
  private callbacks: EngineCallbacks = {};

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks = {}) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.callbacks = callbacks;
    this.wasmBridge = new WasmPhysicsBridge();
    this.tsPhysics = new PhysicsWorld({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      paddleWidth: PADDLE_WIDTH,
      paddleHeight: PADDLE_HEIGHT,
      ballRadius: BALL_RADIUS,
      ballSpeed: BALL_SPEED,
      blockWidth: BLOCK_WIDTH,
      blockHeight: BLOCK_HEIGHT,
      substeps: 6,
    });

    this.particles = new ParticleSystem(CANVAS_WIDTH, CANVAS_HEIGHT, 85);
    this.renderer = new GameRenderer(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.audio = new AudioBridge(true);
    this.powerUps = new PowerUpManager();
  }

  public async initialize(): Promise<void> {
    const wasmSuccess = await this.wasmBridge.initialize();
    this.useWasm = wasmSuccess;
  }

  public setVibrate(enabled: boolean) {
    this.audio.setVibrate(enabled);
  }

  public startLevel(level: LevelData) {
    this.currentLevel = level;
    this.particles.clear();
    this.powerUps.reset();
    this.accumulator = 0;

    const breakables = level.blocks.filter((b) => (b.h >= 1 && b.h <= 5) || b.h === 8).length;
    this.state = {
      score: 0,
      blocksDestroyed: 0,
      totalBreakable: breakables,
      combo: 0,
      maxCombo: 0,
      timeUsed: 0,
      lives: 3,
      status: 'countdown',
    };

    const padWidthLvl = currencyService.getUpgradeLevel('paddle_width');
    const basePadW = PADDLE_WIDTH * (1 + (padWidthLvl - 1) * 0.08);
    this.tsPhysics.paddle.width = basePadW;

    const ballSizeLvl = currencyService.getUpgradeLevel('ball_size');
    const ballRad = BALL_RADIUS * (1 + (ballSizeLvl - 1) * 0.05);

    const initialBallX = CANVAS_WIDTH / 2;
    const initialBallY = CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - ballRad - 5;

    this.tsPhysics.loadBlocks(level.blocks);
    this.tsPhysics.resetBall(initialBallX, initialBallY, 0, 0);

    this.callbacks.onLivesChange?.(this.state.lives);
    this.callbacks.onComboChange?.(0);
    this.callbacks.onScoreUpdate?.(this.state);
  }

  public launchBall() {
    if (this.state.status !== 'countdown' && this.state.status !== 'playing') return;

    this.state.status = 'playing';

    const ballSpeedLvl = currencyService.getUpgradeLevel('ball_speed');
    const currentSpeed = BALL_SPEED * (1 + (ballSpeedLvl - 1) * 0.035);

    const angle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1) + (Math.random() * 0.2 - 0.1);
    const vx = Math.sin(angle) * currentSpeed;
    const vy = -Math.cos(angle) * currentSpeed;

    const ballSizeLvl = currencyService.getUpgradeLevel('ball_size');
    const ballRad = BALL_RADIUS * (1 + (ballSizeLvl - 1) * 0.05);

    const ballX = CANVAS_WIDTH / 2;
    const ballY = CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - ballRad - 5;

    this.tsPhysics.resetBall(ballX, ballY, vx, vy);
  }

  public setPaddleTarget(targetX: number) {
    this.tsPhysics.setPaddleTarget(targetX);
  }

  public movePaddleRelative(deltaX: number) {
    const padSpeedLvl = currencyService.getUpgradeLevel('paddle_speed');
    const speedMultiplier = 1 + (padSpeedLvl - 1) * 0.10;
    const currentTarget = this.tsPhysics.paddle.targetX + deltaX * speedMultiplier;
    this.setPaddleTarget(currentTarget);
  }

  /**
   * Device-Independent Fixed Timestep Game Loop:
   * Uses an accumulator pattern ensuring 60 physics updates/sec regardless of display refresh rate
   */
  public startLoop() {
    if (this.animFrameId) return;

    this.lastTime = performance.now();
    this.accumulator = 0;

    const loop = (timestamp: number) => {
      const now = performance.now();
      let dt = (now - this.lastTime) / 1000;
      this.lastTime = now;

      if (this.isPaused) {
        this.accumulator = 0;
        this.render();
        this.animFrameId = requestAnimationFrame(loop);
        return;
      }

      if (dt > this.MAX_FRAME_DELTA) {
        dt = this.MAX_FRAME_DELTA;
      }
      this.accumulator += dt;

      while (this.accumulator >= this.FIXED_STEP) {
        this.fixedTick(this.FIXED_STEP);
        this.accumulator -= this.FIXED_STEP;
      }

      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public stopLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private recordScore(combo: number, pts: number) {
    this.state.combo = combo;
    if (this.state.combo > this.state.maxCombo) this.state.maxCombo = this.state.combo;
    this.state.score += pts;
    this.callbacks.onComboChange?.(this.state.combo);
    this.callbacks.onScoreUpdate?.(this.state);
  }

  private fixedTick(dt: number) {
    // 1. In non-playing states, keep ball glued to paddle
    if (this.state.status !== 'playing') {
      const halfPadW = this.tsPhysics.paddle.width / 2;
      this.tsPhysics.paddle.vx = (this.tsPhysics.paddle.targetX - this.tsPhysics.paddle.x) * 0.35;
      this.tsPhysics.paddle.x += this.tsPhysics.paddle.vx;
      if (this.tsPhysics.paddle.x < halfPadW) this.tsPhysics.paddle.x = halfPadW;
      else if (this.tsPhysics.paddle.x > this.tsPhysics.config.width - halfPadW) {
        this.tsPhysics.paddle.x = this.tsPhysics.config.width - halfPadW;
      }

      for (const b of this.tsPhysics.balls) {
        b.x = this.tsPhysics.paddle.x;
        b.y = this.tsPhysics.paddle.y - b.radius - 4;
        b.vx = 0;
        b.vy = 0;
        b.isActive = false;
      }

      this.particles.update(CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    this.state.timeUsed += dt;

    // Apply Active Modifiers
    const isSlowMo = this.powerUps.buffs.slowMo > 0;
    for (const b of this.tsPhysics.balls) {
      b.speed = isSlowMo ? b.baseSpeed * 0.55 : b.baseSpeed;
    }

    const isExpand = this.powerUps.buffs.expand > 0;
    const padWidthLvl = currencyService.getUpgradeLevel('paddle_width');
    const basePadW = PADDLE_WIDTH * (1 + (padWidthLvl - 1) * 0.08);
    const expandLvl = currencyService.getUpgradeLevel('expand_power');
    const expandMultiplier = 1.30 + (expandLvl - 1) * 0.04;
    this.tsPhysics.paddle.width = isExpand ? basePadW * expandMultiplier : basePadW;
    this.tsPhysics.isMegaBall = this.powerUps.buffs.megaBall > 0;
    this.tsPhysics.hasShield = this.powerUps.buffs.hasShield;
    this.tsPhysics.ballImpactLevel = currencyService.getUpgradeLevel('ball_impact');

    // 2. Physics Simulation Step
    const events = this.tsPhysics.step(6);

    // 3. Power-Up Simulation Step
    const { collected, laserHits } = this.powerUps.update(
      this.tsPhysics.paddle,
      dt,
      this.tsPhysics.blocks
    );

    // Handle Collected Power-Ups
    for (const powerType of collected) {
      this.audio.triggerEvent('powerup_collect');
      if (powerType === 'multiball') {
        this.tsPhysics.spawnExtraBalls();
        this.particles.spawnVictoryConfetti(CANVAS_WIDTH, CANVAS_HEIGHT);
      } else if (powerType === 'shield') {
        this.tsPhysics.hasShield = true;
      }
      this.particles.addFloatingText(
        `${powerType.toUpperCase()}`,
        this.tsPhysics.paddle.x,
        this.tsPhysics.paddle.y - 35,
        '#00f7ff'
      );
    }

    // Handle Laser Cannons striking blocks
    for (const hit of laserHits) {
      const block = this.tsPhysics.blocks[hit.blockIndex];
      if (block && !block.isDead) {
        block.hitAnim = 1.0;
        if (block.health >= 1 && block.health <= 5) {
          block.health--;
          if (block.health <= 0) {
            block.isDead = true;
            this.tsPhysics.remainingBreakable = Math.max(0, this.tsPhysics.remainingBreakable - 1);
            events.push({
              type: 'block_destroy',
              blockIndex: hit.blockIndex,
              hitX: hit.x,
              hitY: hit.y,
              combo: ++this.state.combo,
            });
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
        this.renderer.triggerShake(2.0);
      } else if (ev.type === 'emp_explode') {
        this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, '#ff9900', true);
        this.particles.addFloatingText('💥 EMP DETONATION!', ev.hitX, ev.hitY, '#ff3b00');
        this.renderer.triggerShake(8.0);
        this.state.blocksDestroyed++;
        this.recordScore(ev.combo, 500);
        if (this.tsPhysics.remainingBreakable <= 0 && this.state.status === 'playing') {
          this.handleWin();
          return;
        }
      } else if (ev.type === 'shield_bounce') {
        this.particles.spawnPaddleBounce(ev.hitX, ev.hitY);
        this.particles.addFloatingText('🛡️ FORCEFIELD SAVED', ev.hitX, ev.hitY, '#10b981');
        this.renderer.triggerShake(3.0);
      } else if (ev.type === 'block_damage') {
        const block = this.tsPhysics.blocks[ev.blockIndex];
        const color = block ? BLOCK_COLORS[block.initialHealth]?.border || '#00f7ff' : '#00f7ff';
        this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, color, false);
        this.renderer.triggerShake(1.5 * impactShakeMult);
        const pts = 50 * (1 + Math.floor(ev.combo / 3));
        this.particles.addFloatingText(`+${pts}`, ev.hitX, ev.hitY, color);
        this.recordScore(ev.combo, pts);
      } else if (ev.type === 'crit_damage') {
        const block = this.tsPhysics.blocks[ev.blockIndex];
        const color = block ? BLOCK_COLORS[block.initialHealth]?.border || '#fbbf24' : '#fbbf24';
        this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, color, true);
        this.renderer.triggerShake(3.5 * impactShakeMult);
        const pts = 100 * (1 + Math.floor(ev.combo / 2));
        this.particles.addFloatingText(`💥 CRIT +${pts}`, ev.hitX, ev.hitY, '#fbbf24');
        this.recordScore(ev.combo, pts);
      } else if (ev.type === 'block_destroy') {
        const block = this.tsPhysics.blocks[ev.blockIndex];
        const color = block ? BLOCK_COLORS[block.initialHealth]?.border || '#ff0844' : '#ff0844';
        this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, color, true);
        this.renderer.triggerShake(3.5 * impactShakeMult);
        this.powerUps.spawnDrop(ev.hitX, ev.hitY, 0.32);
        this.state.blocksDestroyed++;
        const pts = 100 * (1 + ev.combo);
        const comboText = ev.combo > 1 ? `+${pts} (${ev.combo}x)` : `+${pts}`;
        this.particles.addFloatingText(comboText, ev.hitX, ev.hitY, ev.combo > 2 ? '#eeff01' : color);
        this.recordScore(ev.combo, pts);
        if (this.tsPhysics.remainingBreakable <= 0 && this.state.status === 'playing') {
          this.handleWin();
          return;
        }
      } else if (ev.type === 'ball_lost') {
        this.renderer.triggerShake(10.0);
        this.handleLifeLost();
        return;
      }
    }

    // Synchronize destroyed breakables and remaining targets with ground-truth block state
    let deadCount = 0;
    let remCount = 0;
    for (const b of this.tsPhysics.blocks) {
      if ((b.initialHealth >= 1 && b.initialHealth <= 5) || b.initialHealth === 8) {
        if (b.isDead) deadCount++;
        else remCount++;
      }
    }
    this.state.blocksDestroyed = Math.max(this.state.blocksDestroyed, deadCount);
    this.tsPhysics.remainingBreakable = remCount;
    if (remCount <= 0 && this.state.status === 'playing') {
      this.handleWin();
      return;
    }

    // 5. Update Ball Motion Trails
    for (const b of this.tsPhysics.balls) {
      if (b.isActive) {
        b.trail.unshift({
          x: b.x,
          y: b.y,
          alpha: 1.0,
          size: b.radius * 0.85,
        });
        if (b.trail.length > 8) b.trail.pop();
        for (let i = 0; i < b.trail.length; i++) {
          b.trail[i].alpha *= 0.72;
          b.trail[i].size *= 0.94;
        }
      } else {
        b.trail = [];
      }
    }

    // 6. Update Particle Engine
    this.particles.update(CANVAS_WIDTH, CANVAS_HEIGHT);
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
    const resetY = CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - BALL_RADIUS - 5;
    const paddleX = this.tsPhysics.paddle.x;

    this.tsPhysics.resetBall(paddleX, resetY, 0, 0);

    setTimeout(() => {
      if (this.state.lives > 0 && this.state.status === 'paused') {
        this.state.status = 'playing';
        const angle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
        const ballSpeedLvl = currencyService.getUpgradeLevel('ball_speed');
        const currentSpeed = BALL_SPEED * (1 + (ballSpeedLvl - 1) * 0.035);
        const vx = Math.sin(angle) * currentSpeed;
        const vy = -Math.cos(angle) * currentSpeed;
        this.tsPhysics.resetBall(paddleX, resetY, vx, vy);
      }
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

  public setBallSkin(skin?: string) {
    if (skin) this.ballSkin = skin;
  }

  public render() {
    this.renderer.render(
      this.ctx,
      this.tsPhysics.balls,
      this.tsPhysics.paddle,
      this.tsPhysics.blocks,
      this.particles,
      this.powerUps,
      this.ballSkin
    );
  }

  public destroy() {
    this.stopLoop();
  }
}
