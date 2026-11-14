import { BallState, PaddleState, BlockEngineState, CollisionEvent, CollisionEventType } from './types';
import { BlockData } from '../types/game';

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
      };

      if (b.h === 7) {
        portalIndices.push(index);
      }

      this.blocks.push(blockState);
    });

    // Pair portal blocks in order (portal A <-> portal B)
    for (let p = 0; p < portalIndices.length - 1; p += 2) {
      const idxA = portalIndices[p];
      const idxB = portalIndices[p + 1];
      this.blocks[idxA].portalPairIndex = idxB;
      this.blocks[idxB].portalPairIndex = idxA;
    }
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
      isMega: this.isMegaBall,
      trail: [],
    };
    this.balls = [mainBall];
    this.combo = 0;
  }

  public spawnExtraBalls() {
    const active = this.balls.filter((b) => b.isActive);
    if (active.length === 0) return;

    const newBalls: BallState[] = [];
    const spread = (26 * Math.PI) / 180;

    for (const b of active) {
      if (this.balls.length + newBalls.length >= 8) break;
      const angle = Math.atan2(b.vy, b.vx);
      const spd = b.speed || this.config.ballSpeed;

      newBalls.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(angle + spread) * spd,
        vy: Math.sin(angle + spread) * spd,
        radius: b.radius,
        speed: spd,
        baseSpeed: b.baseSpeed,
        isActive: true,
        isMega: b.isMega,
        warpCooldown: 0,
        trail: [],
      });

      newBalls.push({
        x: b.x,
        y: b.y,
        vx: Math.cos(angle - spread) * spd,
        vy: Math.sin(angle - spread) * spd,
        radius: b.radius,
        speed: spd,
        baseSpeed: b.baseSpeed,
        isActive: true,
        isMega: b.isMega,
        warpCooldown: 0,
        trail: [],
      });
    }

    this.balls.push(...newBalls);
  }

  public setPaddleTarget(targetX: number) {
    this.paddle.targetX = targetX;
  }

  public step(substeps: number = 6): CollisionEvent[] {
    this.events = [];

    // Smooth paddle interpolation
    this.paddle.vx = (this.paddle.targetX - this.paddle.x) * 0.35;
    this.paddle.x += this.paddle.vx;

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

      ball.radius = this.isMegaBall ? this.config.ballRadius * 1.45 : this.config.ballRadius;
      ball.isMega = this.isMegaBall;

      const subDt = 1 / substeps;
      const subVx = ball.vx * subDt;
      const subVy = ball.vy * subDt;

      for (let step = 0; step < substeps; step++) {
        ball.x += subVx;
        ball.y += subVy;

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
        if (ball.y - ball.radius >= this.config.height) {
          if (this.hasShield) {
            this.hasShield = false;
            ball.vy = -Math.abs(ball.vy);
            ball.y = this.config.height - 40;
            this.events.push({ type: 'shield_bounce', blockIndex: -1, hitX: ball.x, hitY: ball.y, combo: this.combo });
            break;
          } else {
            ball.isActive = false;
            const aliveCount = this.balls.filter((b) => b.isActive).length;
            if (aliveCount === 0) {
              this.events.push({ type: 'ball_lost', blockIndex: -1, hitX: ball.x, hitY: ball.y, combo: this.combo });
            }
            break;
          }
        }

        // 2. Paddle Curvature & Bounce
        const padLeft = this.paddle.x - halfPadW;
        const padRight = this.paddle.x + halfPadW;
        const padTop = this.paddle.y;
        const padBottom = this.paddle.y + this.paddle.height;

        const closestPadX = Math.max(padLeft, Math.min(ball.x, padRight));
        const closestPadY = Math.max(padTop, Math.min(ball.y, padBottom));
        const padDistSq = (ball.x - closestPadX) ** 2 + (ball.y - closestPadY) ** 2;

        if (padDistSq <= ball.radius ** 2 && ball.vy > 0) {
          const hitOffset = Math.max(-1, Math.min(1, (ball.x - this.paddle.x) / halfPadW));
          const maxAngle = (Math.PI / 180) * 62;
          const bounceAngle = hitOffset * maxAngle;
          const spin = this.paddle.vx * 0.25;
          const currentSpeed = ball.speed;

          let newVx = currentSpeed * Math.sin(bounceAngle) + spin;
          let newVy = -currentSpeed * Math.cos(bounceAngle);
          const minVy = -currentSpeed * 0.35;
          if (newVy > minVy) newVy = minVy;

          const newLen = Math.hypot(newVx, newVy);
          if (newLen > 0.001) {
            ball.vx = (newVx / newLen) * currentSpeed;
            ball.vy = (newVy / newLen) * currentSpeed;
          } else {
            ball.vx = 0;
            ball.vy = -currentSpeed;
          }

          ball.y = padTop - ball.radius - 1;
          this.combo = 0;

          // Tick down any active EMP counter reactors on paddle bounce!
          this.decrementEmpReactors();

          this.events.push({
            type: 'paddle',
            blockIndex: -1,
            hitX: ball.x,
            hitY: padTop,
            combo: 0,
          });
          continue;
        }

        // 3. Block Continuous Swept Collision
        for (let b = 0; b < this.blocks.length; b++) {
          const block = this.blocks[b];
          if (block.isDead) continue;

          const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.w));
          const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.h));
          const distX = ball.x - closestX;
          const distY = ball.y - closestY;
          const distSq = distX * distX + distY * distY;

          if (distSq <= ball.radius * ball.radius) {
            const hitCenterX = block.x + block.w / 2;
            const hitCenterY = block.y + block.h / 2;

            // SPECIAL A: Quantum Portal Warp (Type 7)
            if (block.health === 7 && (!ball.warpCooldown || ball.warpCooldown <= 0)) {
              if (block.portalPairIndex !== undefined && this.blocks[block.portalPairIndex]) {
                const targetPortal = this.blocks[block.portalPairIndex];
                ball.x = targetPortal.x + targetPortal.w / 2;
                ball.y = targetPortal.y + (ball.vy > 0 ? targetPortal.h + ball.radius + 4 : -ball.radius - 4);
                ball.warpCooldown = 18;
                this.events.push({
                  type: 'portal_warp',
                  blockIndex: b,
                  hitX: hitCenterX,
                  hitY: hitCenterY,
                  combo: this.combo,
                });
                break;
              }
            }

            // Normal reflection (Mega Ball pierces breakables without reflecting!)
            const isBreakable = (block.health >= 1 && block.health <= 5) || block.health === 8;
            if (!this.isMegaBall || !isBreakable) {
              const dist = Math.sqrt(distSq);
              const nx = dist > 0.0001 ? distX / dist : (ball.vx > 0 ? -1 : 1);
              const ny = dist > 0.0001 ? distY / dist : (ball.vy > 0 ? -1 : 1);
              const penetration = ball.radius - dist;
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
              const minVy = 0.22 * ball.speed;
              if (Math.abs(ball.vy) < minVy) {
                ball.vy = ball.vy >= 0 ? minVy : -minVy;
                const spd = Math.hypot(ball.vx, ball.vy);
                if (spd > 0.001) {
                  ball.vx = (ball.vx / spd) * ball.speed;
                  ball.vy = (ball.vy / spd) * ball.speed;
                }
              }
            }

            block.hitAnim = 1.0;

            // SPECIAL B: Countdown EMP Reactor (Type 8)
            if (block.health === 8) {
              this.detonateEmpReactor(b);
              break;
            }

            // Standard Breakable Blocks (1 - 5)
            if (block.health >= 1 && block.health <= 5) {
              if (this.isMegaBall) {
                block.health = 0;
              } else {
                block.health--;
              }

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
    const block = this.blocks[b];
    if (block.isDead) return;

    block.isDead = true;
    this.remainingBreakable = Math.max(0, this.remainingBreakable - 1);
    const hitCenterX = block.x + block.w / 2;
    const hitCenterY = block.y + block.h / 2;

    this.events.push({
      type: 'emp_explode',
      blockIndex: b,
      hitX: hitCenterX,
      hitY: hitCenterY,
      combo: ++this.combo,
    });

    // Kinetic Shockwave radius (2.2 * blockWidth)
    const blastRadius = this.config.blockWidth * 2.2;
    const blastSq = blastRadius * blastRadius;

    for (let ob = 0; ob < this.blocks.length; ob++) {
      const other = this.blocks[ob];
      if (other.isDead || other.health === 6) continue;
      const ox = other.x + other.w / 2;
      const oy = other.y + other.h / 2;
      const dSq = (ox - hitCenterX) ** 2 + (oy - hitCenterY) ** 2;

      if (dSq <= blastSq) {
        other.health = Math.max(0, other.health - 2);
        other.hitAnim = 1.0;
        if (other.health <= 0) {
          other.isDead = true;
          this.remainingBreakable = Math.max(0, this.remainingBreakable - 1);
          this.events.push({
            type: 'block_destroy',
            blockIndex: ob,
            hitX: ox,
            hitY: oy,
            combo: ++this.combo,
          });
        }
      }
    }
  }
}
