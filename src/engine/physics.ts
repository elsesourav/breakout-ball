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
  public ball: BallState;
  public paddle: PaddleState;
  public blocks: BlockEngineState[] = [];
  public combo: number = 0;
  public remainingBreakable: number = 0;
  public events: CollisionEvent[] = [];

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

    this.ball = {
      x: initialPadX,
      y: initialPadY - config.ballRadius - 5,
      vx: 0,
      vy: 0,
      radius: config.ballRadius,
      speed: config.ballSpeed,
      baseSpeed: config.ballSpeed,
      isActive: false,
      trail: [],
    };
  }

  public loadBlocks(blocksData: BlockData[]) {
    this.blocks = [];
    this.remainingBreakable = 0;

    blocksData.forEach((b, index) => {
      const isDead = b.h <= 0;
      if (b.h >= 1 && b.h <= 5) {
        this.remainingBreakable++;
      }

      this.blocks.push({
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
      });
    });
  }

  public resetBall(x: number, y: number, vx: number, vy: number) {
    this.ball.x = x;
    this.ball.y = y;
    this.ball.vx = vx;
    this.ball.vy = vy;
    this.ball.speed = Math.hypot(vx, vy) || this.config.ballSpeed;
    this.ball.isActive = Math.abs(vx) > 0.01 || Math.abs(vy) > 0.01;
    this.ball.trail = [];
    this.combo = 0;
  }

  public setPaddleTarget(targetX: number) {
    this.paddle.targetX = targetX;
  }

  public step(substeps: number = 6): CollisionEvent[] {
    this.events = [];

    // Smooth paddle interpolation
    const prevPaddleX = this.paddle.x;
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

    if (!this.ball.isActive) {
      this.ball.x = this.paddle.x;
      this.ball.y = this.paddle.y - this.ball.radius - 4;
      return this.events;
    }

    // Sub-step continuous collision resolution
    const subDt = 1 / substeps;
    const subVx = this.ball.vx * subDt;
    const subVy = this.ball.vy * subDt;

    for (let step = 0; step < substeps; step++) {
      this.ball.x += subVx;
      this.ball.y += subVy;

      // 1. Boundary Wall Collisions
      if (this.ball.x - this.ball.radius <= 0) {
        this.ball.x = this.ball.radius;
        this.ball.vx = Math.abs(this.ball.vx);
        this.events.push({
          type: 'wall',
          blockIndex: -1,
          hitX: this.ball.x,
          hitY: this.ball.y,
          combo: this.combo,
        });
      } else if (this.ball.x + this.ball.radius >= this.config.width) {
        this.ball.x = this.config.width - this.ball.radius;
        this.ball.vx = -Math.abs(this.ball.vx);
        this.events.push({
          type: 'wall',
          blockIndex: -1,
          hitX: this.ball.x,
          hitY: this.ball.y,
          combo: this.combo,
        });
      }

      if (this.ball.y - this.ball.radius <= 0) {
        this.ball.y = this.ball.radius;
        this.ball.vy = Math.abs(this.ball.vy);
        this.events.push({
          type: 'wall',
          blockIndex: -1,
          hitX: this.ball.x,
          hitY: this.ball.y,
          combo: this.combo,
        });
      }

      // Ball falls into bottom lava floor
      if (this.ball.y - this.ball.radius >= this.config.height) {
        this.ball.isActive = false;
        this.events.push({
          type: 'ball_lost',
          blockIndex: -1,
          hitX: this.ball.x,
          hitY: this.ball.y,
          combo: this.combo,
        });
        break;
      }

      // 2. Paddle Curvature & Bounce
      const padLeft = this.paddle.x - halfPadW;
      const padRight = this.paddle.x + halfPadW;
      const padTop = this.paddle.y;
      const padBottom = this.paddle.y + this.paddle.height;

      const closestPadX = Math.max(padLeft, Math.min(this.ball.x, padRight));
      const closestPadY = Math.max(padTop, Math.min(this.ball.y, padBottom));
      const padDistSq = (this.ball.x - closestPadX) ** 2 + (this.ball.y - closestPadY) ** 2;

      if (padDistSq <= this.ball.radius ** 2 && this.ball.vy > 0) {
        // Impact offset (-1 to 1)
        const hitOffset = Math.max(-1, Math.min(1, (this.ball.x - this.paddle.x) / halfPadW));
        const maxAngle = (Math.PI / 180) * 62;
        const bounceAngle = hitOffset * maxAngle;

        // Spin transfer from moving paddle
        const spin = this.paddle.vx * 0.25;
        const currentSpeed = this.ball.speed;

        let newVx = currentSpeed * Math.sin(bounceAngle) + spin;
        let newVy = -currentSpeed * Math.cos(bounceAngle);

        // Clamp upward velocity to maintain crisp vertical pacing
        const minVy = -currentSpeed * 0.35;
        if (newVy > minVy) newVy = minVy;

        const newLen = Math.hypot(newVx, newVy);
        if (newLen > 0.001) {
          this.ball.vx = (newVx / newLen) * currentSpeed;
          this.ball.vy = (newVy / newLen) * currentSpeed;
        } else {
          this.ball.vx = 0;
          this.ball.vy = -currentSpeed;
        }

        this.ball.y = padTop - this.ball.radius - 1;
        this.combo = 0; // Reset combo upon touching paddle

        this.events.push({
          type: 'paddle',
          blockIndex: -1,
          hitX: this.ball.x,
          hitY: padTop,
          combo: 0,
        });
        continue;
      }

      // 3. Block Continuous Swept Collision
      for (let b = 0; b < this.blocks.length; b++) {
        const block = this.blocks[b];
        if (block.isDead) continue;

        const bx = block.x;
        const by = block.y;
        const bw = block.w;
        const bh = block.h;

        const closestX = Math.max(bx, Math.min(this.ball.x, bx + bw));
        const closestY = Math.max(by, Math.min(this.ball.y, by + bh));

        const distX = this.ball.x - closestX;
        const distY = this.ball.y - closestY;
        const distSq = distX * distX + distY * distY;

        if (distSq <= this.ball.radius * this.ball.radius) {
          const dist = Math.sqrt(distSq);
          let nx = 0;
          let ny = 0;
          let penetration = this.ball.radius - dist;

          if (dist > 0.0001) {
            nx = distX / dist;
            ny = distY / dist;
          } else {
            nx = this.ball.vx > 0 ? -1 : 1;
            ny = this.ball.vy > 0 ? -1 : 1;
            penetration = this.ball.radius;
          }

          // Vector reflection: v' = v - 2(v . n)n
          const dot = this.ball.vx * nx + this.ball.vy * ny;
          this.ball.vx -= 2 * dot * nx;
          this.ball.vy -= 2 * dot * ny;

          // Push ball outside block
          this.ball.x += nx * (penetration + 0.5);
          this.ball.y += ny * (penetration + 0.5);

          const hitCenterX = bx + bw / 2;
          const hitCenterY = by + bh / 2;

          block.hitAnim = 1.0;

          if (block.health >= 1 && block.health <= 5) {
            block.health--;
            this.combo++;
            if (block.health <= 0) {
              block.isDead = true;
              this.remainingBreakable--;
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
            // Unbreakable block
            this.events.push({
              type: 'wall',
              blockIndex: b,
              hitX: hitCenterX,
              hitY: hitCenterY,
              combo: this.combo,
            });
          }

          break; // One block collision per substep
        }
      }
    }

    // Decay block hit animations
    for (let b = 0; b < this.blocks.length; b++) {
      if (this.blocks[b].hitAnim > 0) {
        this.blocks[b].hitAnim = Math.max(0, this.blocks[b].hitAnim - 0.1);
      }
    }

    return this.events;
  }
}
