import { WasmPhysicsBridge } from './wasmBridge';
import { PhysicsWorld } from './physics';
import { ParticleSystem } from './particles';
import { GameRenderer } from './renderer';
import { AudioBridge } from './audioBridge';
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

  private useWasm: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Master Score & Game State
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
  private startTime: number = 0;
  private callbacks: EngineCallbacks = {};

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks = {}) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
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
  }

  public async initialize(): Promise<void> {
    const wasmSuccess = await this.wasmBridge.initialize();
    this.useWasm = wasmSuccess;
    if (this.useWasm) {
      this.wasmBridge.initEngine(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        BALL_RADIUS,
        BALL_SPEED
      );
    }
  }

  public setVibrate(enabled: boolean) {
    this.audio.setVibrate(enabled);
  }

  public startLevel(level: LevelData) {
    this.currentLevel = level;
    this.particles.clear();

    const breakables = level.blocks.filter((b) => b.h >= 1 && b.h <= 5).length;
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

    if (this.useWasm) {
      this.wasmBridge.initEngine(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        BALL_RADIUS,
        BALL_SPEED
      );
      this.wasmBridge.loadBlocks(level.blocks, BLOCK_WIDTH, BLOCK_HEIGHT);
      this.wasmBridge.resetBall(
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - BALL_RADIUS - 5,
        0,
        0
      );
    }

    this.tsPhysics.loadBlocks(level.blocks);
    this.tsPhysics.resetBall(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - BALL_RADIUS - 5,
      0,
      0
    );

    this.callbacks.onLivesChange?.(this.state.lives);
    this.callbacks.onComboChange?.(0);
    this.callbacks.onScoreUpdate?.(this.state);
  }

  public launchBall() {
    if (this.state.status !== 'countdown' && this.state.status !== 'playing') return;

    this.state.status = 'playing';
    this.startTime = performance.now();

    // Random upward angle between -45 and +45 degrees
    const angle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1) + (Math.random() * 0.2 - 0.1);
    const vx = Math.sin(angle) * BALL_SPEED;
    const vy = -Math.cos(angle) * BALL_SPEED;

    const ballX = CANVAS_WIDTH / 2;
    const ballY = CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - BALL_RADIUS - 5;

    if (this.useWasm) {
      this.wasmBridge.resetBall(ballX, ballY, vx, vy);
    }
    this.tsPhysics.resetBall(ballX, ballY, vx, vy);
  }

  public setPaddleTarget(targetX: number) {
    if (this.useWasm) {
      this.wasmBridge.setPaddleTarget(targetX);
    }
    this.tsPhysics.setPaddleTarget(targetX);
  }

  public movePaddleRelative(deltaX: number) {
    const currentTarget = this.useWasm
      ? this.wasmBridge.getPaddleState().x + deltaX
      : this.tsPhysics.paddle.targetX + deltaX;
    this.setPaddleTarget(currentTarget);
  }

  public startLoop() {
    if (this.animFrameId) return;

    this.lastTime = performance.now();
    const loop = (timestamp: number) => {
      this.update(timestamp);
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private update(timestamp: number) {
    // 1. During countdown, pause, gameover, or win, NEVER run ball physics or ball loss!
    if (this.state.status !== 'playing') {
      if (this.useWasm) {
        this.wasmBridge.update(1);
        const p = this.wasmBridge.getPaddleState();
        this.tsPhysics.paddle.x = p.x;
        this.tsPhysics.paddle.vx = p.vx;
      } else {
        const halfPadW = this.tsPhysics.paddle.width / 2;
        this.tsPhysics.paddle.vx = (this.tsPhysics.paddle.targetX - this.tsPhysics.paddle.x) * 0.35;
        this.tsPhysics.paddle.x += this.tsPhysics.paddle.vx;
        if (this.tsPhysics.paddle.x < halfPadW) this.tsPhysics.paddle.x = halfPadW;
        else if (this.tsPhysics.paddle.x > this.tsPhysics.config.width - halfPadW) {
          this.tsPhysics.paddle.x = this.tsPhysics.config.width - halfPadW;
        }
      }
      // Ball rests on paddle waiting for launch
      this.tsPhysics.ball.x = this.tsPhysics.paddle.x;
      this.tsPhysics.ball.y = this.tsPhysics.paddle.y - this.tsPhysics.ball.radius - 4;
      this.tsPhysics.ball.vx = 0;
      this.tsPhysics.ball.vy = 0;
      this.tsPhysics.ball.isActive = false;

      this.particles.update(CANVAS_WIDTH, CANVAS_HEIGHT);
      return;
    }

    const elapsed = (timestamp - this.startTime) / 1000;
    this.state.timeUsed = elapsed;

    let events: CollisionEvent[] = [];

    if (this.useWasm) {
      this.wasmBridge.update(6);
      events = this.wasmBridge.pollEvents();

      // Sync block state from WASM to tsPhysics for rendering
      const blockCount = this.wasmBridge.getBlockCount();
      for (let i = 0; i < blockCount; i++) {
        const bState = this.wasmBridge.getBlockState(i);
        if (this.tsPhysics.blocks[i]) {
          this.tsPhysics.blocks[i].health = bState.health;
          this.tsPhysics.blocks[i].isDead = bState.isDead;
        }
      }

      // Sync ball and paddle states
      const b = this.wasmBridge.getBallState();
      this.tsPhysics.ball.x = b.x;
      this.tsPhysics.ball.y = b.y;
      this.tsPhysics.ball.vx = b.vx;
      this.tsPhysics.ball.vy = b.vy;
      this.tsPhysics.ball.isActive = Math.abs(b.vx) > 0.01 || Math.abs(b.vy) > 0.01;

      const p = this.wasmBridge.getPaddleState();
      this.tsPhysics.paddle.x = p.x;
      this.tsPhysics.paddle.vx = p.vx;
      this.tsPhysics.combo = this.wasmBridge.getCombo();
    } else {
      events = this.tsPhysics.step(6);
    }

    // Process Collision Events
    for (const ev of events) {
      this.audio.triggerEvent(ev.type, ev.combo);
      this.callbacks.onEventAudio?.(ev.type, ev.combo);

      if (ev.type === 'paddle') {
        this.particles.spawnPaddleBounce(ev.hitX, ev.hitY);
        this.state.combo = 0;
        this.callbacks.onComboChange?.(0);
      } else if (ev.type === 'block_damage') {
        const block = this.tsPhysics.blocks[ev.blockIndex];
        const color = block ? BLOCK_COLORS[block.initialHealth]?.border || '#00f7ff' : '#00f7ff';
        this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, color, false);

        this.state.combo = ev.combo;
        if (this.state.combo > this.state.maxCombo) {
          this.state.maxCombo = this.state.combo;
        }
        const pts = 50 * (1 + Math.floor(ev.combo / 3));
        this.state.score += pts;
        this.particles.addFloatingText(`+${pts}`, ev.hitX, ev.hitY, color);
        this.callbacks.onComboChange?.(this.state.combo);
        this.callbacks.onScoreUpdate?.(this.state);
      } else if (ev.type === 'block_destroy') {
        const block = this.tsPhysics.blocks[ev.blockIndex];
        const color = block ? BLOCK_COLORS[block.initialHealth]?.border || '#ff0844' : '#ff0844';
        this.particles.spawnBlockExplosion(ev.hitX, ev.hitY, color, true);

        this.state.blocksDestroyed++;
        this.state.combo = ev.combo;
        if (this.state.combo > this.state.maxCombo) {
          this.state.maxCombo = this.state.combo;
        }

        const pts = 100 * (1 + ev.combo);
        this.state.score += pts;
        const comboText = ev.combo > 1 ? `+${pts} (${ev.combo}x)` : `+${pts}`;
        this.particles.addFloatingText(comboText, ev.hitX, ev.hitY, ev.combo > 2 ? '#eeff01' : color);

        this.callbacks.onComboChange?.(this.state.combo);
        this.callbacks.onScoreUpdate?.(this.state);

        // Check Victory
        const remaining = this.useWasm
          ? this.wasmBridge.getRemainingBreakable()
          : this.tsPhysics.remainingBreakable;

        if (remaining <= 0 && this.state.status === 'playing') {
          this.handleWin();
          return;
        }
      } else if (ev.type === 'ball_lost') {
        this.handleLifeLost();
        return;
      }
    }

    // Update Ball Motion Trail
    const ball = this.tsPhysics.ball;
    if (ball.isActive) {
      ball.trail.unshift({
        x: ball.x,
        y: ball.y,
        alpha: 1.0,
        size: ball.radius * 0.85,
      });
      if (ball.trail.length > 8) ball.trail.pop();
      for (let i = 0; i < ball.trail.length; i++) {
        ball.trail[i].alpha *= 0.72;
        ball.trail[i].size *= 0.94;
      }
    } else {
      ball.trail = [];
    }

    // Update Particles
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

    // Set status to paused during recovery window
    this.state.status = 'paused';
    const resetY = CANVAS_HEIGHT - PADDLE_HEIGHT * 3.5 - BALL_RADIUS - 5;
    const paddleX = this.tsPhysics.paddle.x;

    if (this.useWasm) {
      this.wasmBridge.resetBall(paddleX, resetY, 0, 0);
    }
    this.tsPhysics.resetBall(paddleX, resetY, 0, 0);

    setTimeout(() => {
      if (this.state.lives > 0 && this.state.status === 'paused') {
        this.state.status = 'playing';
        const angle = (Math.PI / 4) * (Math.random() > 0.5 ? 1 : -1);
        const vx = Math.sin(angle) * BALL_SPEED;
        const vy = -Math.cos(angle) * BALL_SPEED;

        if (this.useWasm) {
          this.wasmBridge.resetBall(paddleX, resetY, vx, vy);
        }
        this.tsPhysics.resetBall(paddleX, resetY, vx, vy);
      }
    }, 700);
  }

  private handleWin() {
    this.state.status = 'win';
    this.audio.playWin();

    // Bonus for time and remaining lives
    const timeBonus = Math.max(0, Math.floor(1000 - this.state.timeUsed * 25));
    const lifeBonus = this.state.lives * 250;
    this.state.score += timeBonus + lifeBonus;

    this.particles.spawnVictoryConfetti(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.callbacks.onLevelWin?.(this.state);
  }

  public render() {
    this.renderer.render(
      this.ctx,
      this.tsPhysics.ball,
      this.tsPhysics.paddle,
      this.tsPhysics.blocks,
      this.particles
    );
  }

  public destroy() {
    this.stopLoop();
  }
}
