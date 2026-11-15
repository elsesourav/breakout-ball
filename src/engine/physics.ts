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

    // Robust Portal Pairing: Match portals by portalPairId, with fallback sequential/ring pairing
    const pairMap = new Map<number, number[]>();
    portalIndices.forEach((idx, i) => {
      const pid = this.blocks[idx].portalPairId ?? Math.floor(i / 2) + 1;
      if (!pairMap.has(pid)) pairMap.set(pid, []);
      pairMap.get(pid)!.push(idx);
    });

    const orphanIndices: number[] = [];
    pairMap.forEach((indices) => {
      if (indices.length >= 2) {
        for (let p = 0; p < indices.length; p++) {
          const nextIdx = indices[(p + 1) % indices.length];
          this.blocks[indices[p]].portalPairIndex = nextIdx;
        }
      } else if (indices.length === 1) {
        orphanIndices.push(indices[0]);
      }
    });

    // Pair up any leftover orphan portals across different groups
    for (let o = 0; o < orphanIndices.length - 1; o += 2) {
      const idxA = orphanIndices[o];
      const idxB = orphanIndices[o + 1];
      this.blocks[idxA].portalPairIndex = idxB;
      this.blocks[idxB].portalPairIndex = idxA;
    }

    // If an odd single portal remains completely alone in the entire level:
    // It remains a portal (health = 7) and acts as an indestructible quantum reflector!
    // It NEVER transforms into a Titanium block or changes appearance.
    if (orphanIndices.length % 2 === 1) {
      const loneIdx = orphanIndices[orphanIndices.length - 1];
      this.blocks[loneIdx].portalPairIndex = undefined;
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
      paddleCooldown: 0,
      lastHitBlockCooldown: 0,
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

      [spread, -spread].forEach((offset) => {
        newBalls.push({
          x: b.x,
          y: b.y,
          vx: Math.cos(angle + offset) * spd,
          vy: Math.sin(angle + offset) * spd,
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
      });
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
      // Direct tracking capped by current upgrade max speed:
      // If distance exceeds maxStep, travel at maximum physical speed;
      // If distance is within reach, smoothly snap into target without overshooting
      const step = dist >= maxStep ? Math.sign(dx) * maxStep : dx * 0.55;
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

        // 2. High-Precision Paddle Collision & Dynamic Angular Deflection
        const padLeft = this.paddle.x - halfPadW;
        const padRight = this.paddle.x + halfPadW;
        const padTop = this.paddle.y;
        const padBottom = this.paddle.y + this.paddle.height;

        const closestPadX = Math.max(padLeft, Math.min(ball.x, padRight));
        const closestPadY = Math.max(padTop, Math.min(ball.y, padBottom));
        const padDistSq = (ball.x - closestPadX) ** 2 + (ball.y - closestPadY) ** 2;

        // Continuous swept check: Did the ball pass through the top paddle line this substep?
        const crossedPaddleTop = prevBallY <= padTop + ball.radius && ball.y + ball.radius >= padTop;
        const withinPaddleWidth = ball.x >= padLeft - ball.radius && ball.x <= padRight + ball.radius;
        const isNearPaddle = padDistSq <= ball.radius ** 2 || (crossedPaddleTop && withinPaddleWidth && ball.vy > 0);
        const isNotOnCooldown = !ball.paddleCooldown || ball.paddleCooldown <= 0;
        const isMovingTowardsPaddle = ball.vy > 0 || ball.y <= padTop + this.paddle.height * 0.5;

        if (isNearPaddle && isNotOnCooldown && isMovingTowardsPaddle) {
          const hitOffset = Math.max(-1, Math.min(1, (ball.x - this.paddle.x) / halfPadW));
          const maxAngle = (Math.PI / 180) * 62;
          const bounceAngle = hitOffset * maxAngle;
          const spin = this.paddle.vx * 0.28;
          const currentSpeed = ball.speed || this.config.ballSpeed;

          let newVx = currentSpeed * Math.sin(bounceAngle) + spin;
          let newVy = -currentSpeed * Math.cos(bounceAngle);
          const minVy = -currentSpeed * 0.35;
          if (newVy > minVy) newVy = minVy; // Ensure strong upward launch trajectory

          const newLen = Math.hypot(newVx, newVy);
          if (newLen > 0.001) {
            ball.vx = (newVx / newLen) * currentSpeed;
            ball.vy = (newVy / newLen) * currentSpeed;
          } else {
            ball.vx = 0;
            ball.vy = -currentSpeed;
          }

          // Position cleanly above paddle surface to prevent penetration
          ball.y = padTop - ball.radius - 1;
          ball.paddleCooldown = 8;
          ball.lastHitBlockIndex = undefined;
          this.combo = 0;

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
              // 1. Post-warp transit: allow ball to move freely away from portals without re-triggering or getting snagged
              if (ball.warpCooldown && ball.warpCooldown > 0) {
                continue;
              }

              // 2. Recharge Break (3 seconds): Portal acts like "a normal nothing" (transparent pass-through) while cooling down
              if (block.portalRechargeTimer && block.portalRechargeTimer > 0) {
                continue;
              }

              // 3. 50% Penetration Rule: Ball must be at least 50% inside the portal block rectangle
              // (Ball center (ball.x, ball.y) has crossed inside [block.x, block.x + block.w] x [block.y, block.y + block.h])
              const isCenterInside =
                ball.x >= block.x &&
                ball.x <= block.x + block.w &&
                ball.y >= block.y &&
                ball.y <= block.y + block.h;

              if (isCenterInside) {
                if (
                  block.portalPairIndex !== undefined &&
                  this.blocks[block.portalPairIndex] &&
                  this.blocks[block.portalPairIndex].health === 7 &&
                  !this.blocks[block.portalPairIndex].isDead
                ) {
                  const targetPortal = this.blocks[block.portalPairIndex];
                  if (typeof targetPortal.x === 'number' && typeof targetPortal.y === 'number') {
                    // Safe exit placement completely clear of destination portal block
                    const clearance = ball.radius + 8;
                    const exitDown = targetPortal.y < this.config.blockHeight * 2 || ball.vy > 0;
                    ball.x = Math.max(
                      ball.radius + 6,
                      Math.min(this.config.width - ball.radius - 6, targetPortal.x + targetPortal.w / 2)
                    );
                    ball.y = exitDown 
                      ? targetPortal.y + targetPortal.h + clearance 
                      : targetPortal.y - clearance;
                    ball.vy = exitDown ? Math.abs(ball.vy) : -Math.abs(ball.vy);
                    
                    // Anti-looping cooldown: 35 ticks (~0.58s) guarantees ball escapes portal zone
                    ball.warpCooldown = 35;

                    // 3-Second Recharge Break: Both input and output portals enter 3.0s recharge break (180 ticks)
                    // They turn transparent and act like nothing, while any other connected portal pairs remain active!
                    block.portalRechargeTimer = 180;
                    targetPortal.portalRechargeTimer = 180;

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
              } else {
                // Ball touches outer edge of portal (< 50% inside):
                // Transportation does NOT apply yet.
                // If the ball is moving inward toward the portal center, allow it to enter without outer perimeter bounce
                const toCenterX = (block.x + block.w / 2) - ball.x;
                const toCenterY = (block.y + block.h / 2) - ball.y;
                const isMovingInward = (ball.vx * toCenterX + ball.vy * toCenterY) > 0;

                if (isMovingInward && block.portalPairIndex !== undefined) {
                  continue; // Permit smooth entrance into event horizon so center reaches 50%
                }
                // Otherwise (glancing away or lone portal): reflect normally below
              }
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
      if (other.isDead || other.health === 6 || other.health === 7) continue;
      const ox = other.x + other.w / 2;
      const oy = other.y + other.h / 2;
      const dSq = (ox - hitCenterX) ** 2 + (oy - hitCenterY) ** 2;

      if (dSq <= blastSq) {
        if (other.health === 8) {
          // Chain reaction detonation
          this.detonateEmpReactor(ob);
          continue;
        }
        if (other.health >= 1 && other.health <= 5) {
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
}
