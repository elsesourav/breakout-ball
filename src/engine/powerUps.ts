import { BlockEngineState, PaddleState } from './types';

export type PowerUpType = 'multiball' | 'megaball' | 'laser' | 'slowmo' | 'shield' | 'expand';

export interface PowerUpMeta {
  type: PowerUpType;
  label: string;
  symbol: string;
  color: string;
  glow: string;
  duration: number; // in seconds (0 = instant)
}

export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpMeta> = {
  multiball: {
    type: 'multiball',
    label: 'MULTI-BALL',
    symbol: '●●',
    color: '#00f7ff',
    glow: 'rgba(0, 247, 255, 0.8)',
    duration: 0,
  },
  megaball: {
    type: 'megaball',
    label: 'MEGA CORE',
    symbol: '✹',
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.85)',
    duration: 7.0,
  },
  laser: {
    type: 'laser',
    label: 'PLASMA CANNON',
    symbol: '▲',
    color: '#ff0055',
    glow: 'rgba(255, 0, 85, 0.85)',
    duration: 8.0,
  },
  slowmo: {
    type: 'slowmo',
    label: 'CHRONOS WARP',
    symbol: '⏱',
    color: '#b773ff',
    glow: 'rgba(183, 115, 255, 0.85)',
    duration: 5.5,
  },
  shield: {
    type: 'shield',
    label: 'FORCEFIELD',
    symbol: '🛡',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.85)',
    duration: 0,
  },
  expand: {
    type: 'expand',
    label: 'TITAN PADDLE',
    symbol: '◀▶',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.85)',
    duration: 8.0,
  },
};

export interface PowerUpDrop {
  id: number;
  x: number;
  y: number;
  vy: number; // px/sec
  meta: PowerUpMeta;
  collected: boolean;
  angle: number;
}

export interface ActiveBuffs {
  megaBall: number;
  laser: number;
  slowMo: number;
  expand: number;
  hasShield: boolean;
}

export interface LaserBolt {
  id: number;
  x: number;
  y: number;
  vy: number;
}

export class PowerUpManager {
  public drops: PowerUpDrop[] = [];
  public lasers: LaserBolt[] = [];
  public buffs: ActiveBuffs = {
    megaBall: 0,
    laser: 0,
    slowMo: 0,
    expand: 0,
    hasShield: false,
  };

  private nextId = 1;
  private laserFireTimer = 0;
  private readonly LASER_INTERVAL = 0.35; // fire every 350ms
  private readonly FALL_SPEED = 240; // px/sec device-independent

  public reset() {
    this.drops = [];
    this.lasers = [];
    this.buffs = {
      megaBall: 0,
      laser: 0,
      slowMo: 0,
      expand: 0,
      hasShield: false,
    };
    this.laserFireTimer = 0;
  }

  /**
   * Spawns a power shard at the block destruction coords (35% probability)
   */
  public spawnDrop(x: number, y: number, probability = 0.35): PowerUpDrop | null {
    if (Math.random() > probability) return null;

    const types: PowerUpType[] = ['multiball', 'megaball', 'laser', 'slowmo', 'shield', 'expand'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const meta = POWER_UP_CONFIGS[chosenType];

    const drop: PowerUpDrop = {
      id: this.nextId++,
      x,
      y,
      vy: this.FALL_SPEED,
      meta,
      collected: false,
      angle: 0,
    };

    this.drops.push(drop);
    return drop;
  }

  /**
   * Device-independent tick update
   */
  public update(
    paddle: PaddleState,
    dt: number,
    blocks: BlockEngineState[]
  ): {
    collected: PowerUpType[];
    laserHits: { blockIndex: number; x: number; y: number }[];
  } {
    const collectedTypes: PowerUpType[] = [];
    const laserHits: { blockIndex: number; x: number; y: number }[] = [];

    // 1. Update active power-up shard drops
    const halfPadW = paddle.width / 2;
    const padL = paddle.x - halfPadW - 10;
    const padR = paddle.x + halfPadW + 10;
    const padT = paddle.y - 12;
    const padB = paddle.y + paddle.height + 15;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.y += drop.vy * dt;
      drop.angle += dt * 2.5;

      // Check paddle catch
      if (drop.x >= padL && drop.x <= padR && drop.y >= padT && drop.y <= padB) {
        drop.collected = true;
        this.activateBuff(drop.meta.type);
        collectedTypes.push(drop.meta.type);
        this.drops.splice(i, 1);
        continue;
      }

      // Check screen bottom out
      if (drop.y > paddle.y + 250) {
        this.drops.splice(i, 1);
      }
    }

    // 2. Decrement active buff timers
    if (this.buffs.megaBall > 0) this.buffs.megaBall = Math.max(0, this.buffs.megaBall - dt);
    if (this.buffs.slowMo > 0) this.buffs.slowMo = Math.max(0, this.buffs.slowMo - dt);
    if (this.buffs.expand > 0) this.buffs.expand = Math.max(0, this.buffs.expand - dt);

    // 3. Laser cannons handling
    if (this.buffs.laser > 0) {
      this.buffs.laser = Math.max(0, this.buffs.laser - dt);
      this.laserFireTimer += dt;
      if (this.laserFireTimer >= this.LASER_INTERVAL) {
        this.laserFireTimer = 0;
        // Twin cannons
        const cannonOffset = halfPadW * 0.75;
        this.lasers.push(
          { id: this.nextId++, x: paddle.x - cannonOffset, y: paddle.y - 5, vy: -950 },
          { id: this.nextId++, x: paddle.x + cannonOffset, y: paddle.y - 5, vy: -950 }
        );
      }
    }

    // 4. Update laser bolts & block collisions
    for (let l = this.lasers.length - 1; l >= 0; l--) {
      const bolt = this.lasers[l];
      bolt.y += bolt.vy * dt;

      if (bolt.y < 0) {
        this.lasers.splice(l, 1);
        continue;
      }

      // Hit test against active blocks
      let hit = false;
      for (let b = 0; b < blocks.length; b++) {
        const block = blocks[b];
        if (block.isDead) continue;
        if (
          bolt.x >= block.x &&
          bolt.x <= block.x + block.w &&
          bolt.y >= block.y &&
          bolt.y <= block.y + block.h
        ) {
          hit = true;
          laserHits.push({ blockIndex: b, x: bolt.x, y: bolt.y });
          break;
        }
      }

      if (hit) {
        this.lasers.splice(l, 1);
      }
    }

    return { collected: collectedTypes, laserHits };
  }

  public activateBuff(type: PowerUpType) {
    const meta = POWER_UP_CONFIGS[type];
    switch (type) {
      case 'megaball':
        this.buffs.megaBall = meta.duration;
        break;
      case 'laser':
        this.buffs.laser = meta.duration;
        break;
      case 'slowmo':
        this.buffs.slowMo = meta.duration;
        break;
      case 'expand':
        this.buffs.expand = meta.duration;
        break;
      case 'shield':
        this.buffs.hasShield = true;
        break;
      case 'multiball':
        // Handled directly by physics / gameEngine
        break;
    }
  }

  public consumeShield(): boolean {
    if (this.buffs.hasShield) {
      this.buffs.hasShield = false;
      return true;
    }
    return false;
  }

  /**
   * Renders all active power-up visual elements
   */
  public render(
    ctx: CanvasRenderingContext2D,
    paddle: PaddleState,
    canvasWidth: number,
    canvasHeight: number
  ) {
    // 1. Bottom Forcefield Laser Barrier
    if (this.buffs.hasShield) {
      const shieldY = canvasHeight - 35;
      ctx.save();
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, shieldY);
      ctx.lineTo(canvasWidth, shieldY);
      ctx.stroke();

      // Cyber hazard hash marks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let x = 10; x < canvasWidth; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, shieldY - 5);
        ctx.lineTo(x + 12, shieldY + 5);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Falling Power-Up Shards
    for (const drop of this.drops) {
      const size = 26;
      ctx.save();
      ctx.translate(drop.x, drop.y);
      ctx.rotate(drop.angle);

      // Glow & Shard Diamond
      ctx.shadowColor = drop.meta.glow;
      ctx.shadowBlur = 14;
      ctx.fillStyle = drop.meta.color;

      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.7, 0);
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.7, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.7, 0);
      ctx.closePath();
      ctx.fill();

      // Inner Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Symbol
      ctx.rotate(-drop.angle);
      ctx.fillStyle = '#050716';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(drop.meta.symbol, 0, 1);

      ctx.restore();
    }

    // 3. Laser Blasters on Paddle & Bolts
    if (this.buffs.laser > 0) {
      const halfPadW = paddle.width / 2;
      const cannonOffset = halfPadW * 0.75;
      ctx.save();
      ctx.fillStyle = '#ff0055';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 12;

      // Left & right blaster turrets
      ctx.fillRect(paddle.x - cannonOffset - 4, paddle.y - 10, 8, 12);
      ctx.fillRect(paddle.x + cannonOffset - 4, paddle.y - 10, 8, 12);
      ctx.restore();
    }

    // Active Laser Bolts
    for (const bolt of this.lasers) {
      ctx.save();
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bolt.x - 3, bolt.y - 14, 6, 28);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(bolt.x - 1.5, bolt.y - 12, 3, 24);
      ctx.restore();
    }
  }
}
