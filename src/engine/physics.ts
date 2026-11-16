import { BallState, PaddleState, BlockEngineState, CollisionEvent, CollisionEventType } from './types';
import { BlockData } from '../types/game';
import {
  pairPortals,
  resolvePaddleBounce,
  handlePortalCollision,
  detonateEmpExplosion,
} from './physicsHelpers';

export interface PhysicsWorldConfig {
  width: number;
  height: number;
  paddleWidth: number;
  paddleHeight: number;
  ballRadius: number;
  ballSpeed: number;
  blockWidth: number;
  blockHeight: number;
  substeps?: number;
}

export class PhysicsWorld {
  public config: PhysicsWorldConfig;
  public balls: BallState[] = [];
  public paddle: PaddleState;
  public blocks: BlockEngineState[] = [];
  public combo: number = 0;
  public remainingBreakable: number = 0;
  public events: CollisionEvent[] = [];
  public hasShield: boolean = false;
  public isMegaBall: boolean = false;
  public ballImpactLevel: number = 1;

  private defaultBall: BallState;

  constructor(config: PhysicsWorldConfig) {
    this.config = {
      ...config,
      substeps: config.substeps ?? 6,
    };

    const initialPadX = config.width / 2;
    const initialPadY = config.height - config.paddleHeight * 3.5;

    this.paddle = {
      x: initialPadX,
      y: initialPadY,
      width: config.paddleWidth,
      height: config.paddleHeight,
      vx: 0,
      targetX: initialPadX,
      maxSpeed: 1600,
    };

    this.defaultBall = {
      x: initialPadX,
      y: initialPadY - config.ballRadius - 5,
      vx: 0,
      vy: 0,
      radius: config.ballRadius,
      speed: config.ballSpeed,
      baseSpeed: config.ballSpeed,
      isActive: false,
      warpCooldown: 0,
      paddleCooldown: 0,
      lastHitBlockCooldown: 0,
      trail: [],
    };
    this.balls = [{ ...this.defaultBall }];
  }

  // Compatibility getter for existing code referencing physics.ball
  public get ball(): BallState {
    return this.balls[0] || this.defaultBall;
  }

  public loadBlocks(blocksData: BlockData[]) {
    this.blocks = [];
    this.remainingBreakable = 0;
    const portalIndices: number[] = [];

    blocksData.forEach((b, index) => {
      const isDead = b.h <= 0;
      if ((b.h >= 1 && b.h <= 5) || b.h === 8) {
        this.remainingBreakable++;
      }

      const blockState: BlockEngineState = {
        index,
        col: b.x,
        row: b.y,
        x: b.x * this.config.blockWidth,
        y: b.y * this.config.blockHeight,
        w: this.config.blockWidth,
        h: this.config.blockHeight,
        health: b.h,
        initialHealth: b.h,
        isDead,
        hitAnim: 0,
        counter: b.h === 8 ? 3 : undefined,
        portalPairId: b.portalPairId,
        portalRechargeTimer: 0,
      };

      if (b.h === 7) {
        portalIndices.push(index);
      }

      this.blocks.push(blockState);
    });

    // Robust Portal Pairing
    pairPortals(this.blocks, portalIndices);
  }

  public resetBall(x: number, y: number, vx: number, vy: number) {
    const mainBall: BallState = {
      x,
      y,
      vx,
      vy,
      radius: this.config.ballRadius,
      speed: Math.hypot(vx, vy) || this.config.ballSpeed,
      baseSpeed: this.config.ballSpeed,
      isActive: Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01,
      warpCooldown: 0,
      paddleCooldown: 0,
      lastHitBlockCooldown: 0,
      isMega: this.isMegaBall,
      trail: [],
    };
    this.balls = [mainBall];
    this.combo = 0;
  }

  public spawnExtraBalls(extraCount: number = 2) {
    const active = this.balls.filter((b) => b.isActive);
    if (active.length === 0) return;

    const newBalls: BallState[] = [];
    const maxAllowed = 8;
    const maxSpread = (32 * Math.PI) / 180;

    for (const b of active) {
      if (this.balls.length + newBalls.length >= maxAllowed) break;
      const baseAngle = Math.atan2(b.vy, b.vx);
      const spd = b.speed || this.config.ballSpeed;

      const offsets: number[] = [];
      if (extraCount <= 1) {
        offsets.push(maxSpread * 0.5);
      } else {
        const step = (maxSpread * 2) / (extraCount - 1);
        for (let i = 0; i < extraCount; i++) {
          offsets.push(-maxSpread + i * step);
        }
      }

      for (const offset of offsets) {
        if (this.balls.length + newBalls.length >= maxAllowed) break;
        newBalls.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(baseAngle + offset) * spd,
          vy: Math.sin(baseAngle + offset) * spd,
          radius: b.radius,
          speed: spd,
          baseSpeed: b.baseSpeed,
          isActive: true,
          isMega: b.isMega,
          warpCooldown: 0,
          paddleCooldown: 0,
          lastHitBlockCooldown: 0,
          trail: [],
        });
      }
    }

    this.balls.push(...newBalls);
  }

  public setPaddleTarget(targetX: number) {
    this.paddle.targetX = targetX;
  }

  public step(substeps: number = 6): CollisionEvent[] {
    this.events = [];

    // Decrement portal recharge break timers once per physics frame
    for (let b = 0; b < this.blocks.length; b++) {
      const blk = this.blocks[b];
      if (blk.portalRechargeTimer && blk.portalRechargeTimer > 0) {
        blk.portalRechargeTimer--;
      }
    }

    // Physically accurate paddle speed control:
    // Paddle tracks targetX strictly capped by its maximum physical speed (px/sec)
    const dt = 1 / 60;
    const maxSpeed = this.paddle.maxSpeed ?? 1600;
    const maxStep = maxSpeed * dt;
    const dx = this.paddle.targetX - this.paddle.x;
    const dist = Math.abs(dx);

    if (dist > 0.01) {
      // Direct tracking strictly capped by current upgrade max speed:
      // If distance exceeds maxStep, travel at maximum physical speed;
      // If distance is within reach of current frame, snap cleanly to target with zero artificial delay
      const step = dist >= maxStep ? Math.sign(dx) * maxStep : dx;
      this.paddle.vx = step / dt;
      this.paddle.x += step;
    } else {
      this.paddle.x = this.paddle.targetX;
      this.paddle.vx = 0;
    }

    const halfPadW = this.paddle.width / 2;
    if (this.paddle.x < halfPadW) {
      this.paddle.x = halfPadW;
      this.paddle.vx = 0;
    } else if (this.paddle.x > this.config.width - halfPadW) {
      this.paddle.x = this.config.width - halfPadW;
      this.paddle.vx = 0;
    }

    // Step each active ball independently
    for (let bi = this.balls.length - 1; bi >= 0; bi--) {
      const ball = this.balls[bi];

      if (!ball.isActive) {
        ball.x = this.paddle.x;
        ball.y = this.paddle.y - ball.radius - 4;
        continue;
      }

      if (ball.warpCooldown && ball.warpCooldown > 0) {
        ball.warpCooldown--;
      }

      if (ball.paddleCooldown && ball.paddleCooldown > 0) {
        ball.paddleCooldown--;
      }

      if (ball.lastHitBlockCooldown && ball.lastHitBlockCooldown > 0) {
        ball.lastHitBlockCooldown--;
        if (ball.lastHitBlockCooldown <= 0) {
          ball.lastHitBlockIndex = undefined;
        }
      }

      ball.radius = this.isMegaBall ? this.config.ballRadius * 1.45 : this.config.ballRadius;
      ball.isMega = this.isMegaBall;

      const subDt = 1 / substeps;
      // Track blocks damaged by this ball during this tick to strictly prevent multiple damage hits from one impact
      const damagedBlocksThisTick = new Set<number>();

      for (let step = 0; step < substeps; step++) {
        const prevBallY = ball.y;
        // Always move by current velocity so any bounce in a previous substep immediately moves the ball away
        ball.x += ball.vx * subDt;
        ball.y += ball.vy * subDt;

        // 1. Boundary Wall Collisions
        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius;
          ball.vx = Math.abs(ball.vx);
          this.events.push({ type: 'wall', blockIndex: -1, hitX: ball.x, hitY: ball.y, combo: this.combo });
        } else if (ball.x + ball.radius >= this.config.width) {
          ball.x = this.config.width - ball.radius;
          ball.vx = -Math.abs(ball.vx);
          this.events.push({ type: 'wall', blockIndex: -1, hitX: ball.x, hitY: ball.y, combo: this.combo });
        }

        if (ball.y - ball.radius <= 0) {
          ball.y = ball.radius;
          ball.vy = Math.abs(ball.vy);
          this.events.push({ type: 'wall', blockIndex: -1, hitX: ball.x, hitY: ball.y, combo: this.combo });
        }

        // Bottom Out or Shield Barrier
        const shieldY = this.config.height - 35;
        if (this.hasShield && ball.y + ball.radius >= shieldY && ball.vy > 0) {
          ball.vy = -Math.abs(ball.vy);
          ball.y = shieldY - ball.radius;
          this.events.push({ type: 'shield_bounce', blockIndex: -1, hitX: ball.x, hitY: shieldY, combo: this.combo });
        } else if (ball.y - ball.radius >= this.config.height) {
          ball.isActive = false;
          const aliveCount = this.balls.filter((b) => b.isActive).length;
          if (aliveCount === 0) {
            this.events.push({ type: 'ball_lost', blockIndex: -1, hitX: ball.x, hitY: ball.y, combo: this.combo });
          }
          break;
        }

        // 2. High-Precision Paddle Collision & Dynamic Angular Deflection
        if (resolvePaddleBounce(ball, this.paddle, halfPadW, this.config, prevBallY, this.events)) {
          this.combo = 0;
          continue;
        }

        // 3. Block Continuous Swept Collision
        for (let b = 0; b < this.blocks.length; b++) {
          const block = this.blocks[b];
          if (block.isDead) continue;

          // Strictly guarantee: each block can only take damage once per physics frame from a ball
          if (damagedBlocksThisTick.has(b)) continue;
          if (ball.lastHitBlockIndex === b && (ball.lastHitBlockCooldown ?? 0) > 0) continue;

          const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.w));
          const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.h));
          const distX = ball.x - closestX;
          const distY = ball.y - closestY;
          const distSq = distX * distX + distY * distY;

          if (distSq <= ball.radius * ball.radius) {
            const hitCenterX = block.x + block.w / 2;
            const hitCenterY = block.y + block.h / 2;

            // SPECIAL A: Quantum Portal Warp (Type 7)
            if (block.health === 7) {
              const res = handlePortalCollision(ball, block, this.blocks, b, this.config, this.events, this.combo);
              if (res === 'continue') continue;
              if (res === 'break') break;
            }

            // Normal reflection & physically accurate collision normal
            let nx = 0;
            let ny = 0;
            let penetration = 0;
            const dist = Math.sqrt(distSq);

            if (dist > 0.0001) {
              nx = distX / dist;
              ny = distY / dist;
              penetration = ball.radius - dist;
            } else {
              // Deep overlap: resolve along shallowest axis
              const dLeft = Math.abs(ball.x - block.x);
              const dRight = Math.abs(block.x + block.w - ball.x);
              const dTop = Math.abs(ball.y - block.y);
              const dBottom = Math.abs(block.y + block.h - ball.y);
              const minD = Math.min(dLeft, dRight, dTop, dBottom);
              if (minD === dTop) {
                nx = 0; ny = -1; penetration = ball.radius + dTop;
              } else if (minD === dBottom) {
                nx = 0; ny = 1; penetration = ball.radius + dBottom;
              } else if (minD === dLeft) {
                nx = -1; ny = 0; penetration = ball.radius + dLeft;
              } else {
                nx = 1; ny = 0; penetration = ball.radius + dRight;
              }
            }

            const isBreakable = (block.health >= 1 && block.health <= 5) || block.health === 8;
            if (!this.isMegaBall || !isBreakable) {
              const dot = ball.vx * nx + ball.vy * ny;
              if (dot < 0) {
                ball.vx -= 2 * dot * nx;
                ball.vy -= 2 * dot * ny;
              }
              if (penetration > 0) {
                ball.x += nx * (penetration + 0.5);
                ball.y += ny * (penetration + 0.5);
              }

              // Anti-horizontal trap: keep ball dynamic and engaging
              const currentSpeed = ball.speed || this.config.ballSpeed;
              const spd = Math.hypot(ball.vx, ball.vy);
              if (spd > 0.001) {
                ball.vx = (ball.vx / spd) * currentSpeed;
                ball.vy = (ball.vy / spd) * currentSpeed;
              }
              const minVy = 0.22 * currentSpeed;
              if (Math.abs(ball.vy) < minVy) {
                ball.vy = ball.vy >= 0 ? minVy : -minVy;
                const newSpd = Math.hypot(ball.vx, ball.vy);
                if (newSpd > 0.001) {
                  ball.vx = (ball.vx / newSpd) * currentSpeed;
                  ball.vy = (ball.vy / newSpd) * currentSpeed;
                }
              }
            }

            // Mark block damaged this tick and activate hit cooldown
            damagedBlocksThisTick.add(b);
            ball.lastHitBlockIndex = b;
            ball.lastHitBlockCooldown = 4;
            block.hitAnim = 1.0;

            // SPECIAL B: Countdown EMP Reactor (Type 8)
            if (block.health === 8) {
              this.detonateEmpReactor(b);
              break;
            }

            // Standard Breakable Blocks (1 - 5)
            // Strictly 1 damage per hit for standard ball (Mega Ball pierces and breaks block)
            if (block.health >= 1 && block.health <= 5) {
              const damage = this.isMegaBall ? block.health : 1;
              block.health = Math.max(0, block.health - damage);

              const critChance = (this.ballImpactLevel - 1) * 0.12;
              const isCrit = !this.isMegaBall && critChance > 0 && Math.random() < critChance;

              this.combo++;
              if (block.health <= 0) {
                block.isDead = true;
                this.remainingBreakable = Math.max(0, this.remainingBreakable - 1);
                this.events.push({
                  type: 'block_destroy',
                  blockIndex: b,
                  hitX: hitCenterX,
                  hitY: hitCenterY,
                  combo: this.combo,
                });
              } else if (isCrit) {
                // Critical impact: grants bonus score & celebratory effects without stripping extra HP
                this.events.push({
                  type: 'crit_damage',
                  blockIndex: b,
                  hitX: hitCenterX,
                  hitY: hitCenterY,
                  combo: this.combo,
                });
              } else {
                this.events.push({
                  type: 'block_damage',
                  blockIndex: b,
                  hitX: hitCenterX,
                  hitY: hitCenterY,
                  combo: this.combo,
                });
              }
            } else {
              this.events.push({
                type: 'wall',
                blockIndex: b,
                hitX: hitCenterX,
                hitY: hitCenterY,
                combo: this.combo,
              });
            }

            break; // Max one collision per substep
          }
        }
      }

      // Clean up fallen ball if multiple balls active
      if (!ball.isActive && this.balls.length > 1) {
        this.balls.splice(bi, 1);
      }
    }

    // Decay block hit flash
    for (let b = 0; b < this.blocks.length; b++) {
      if (this.blocks[b].hitAnim > 0) {
        this.blocks[b].hitAnim = Math.max(0, this.blocks[b].hitAnim - 0.1);
      }
    }

    return this.events;
  }

  private decrementEmpReactors() {
    for (let b = 0; b < this.blocks.length; b++) {
      const block = this.blocks[b];
      if (block.health === 8 && !block.isDead && block.counter !== undefined) {
        block.counter--;
        block.hitAnim = 0.6;
        if (block.counter <= 0) {
          this.detonateEmpReactor(b);
        }
      }
    }
  }

  public detonateEmpReactor(b: number) {
    detonateEmpExplosion(this.blocks, b, this.config, this.events, this);
  }
}
