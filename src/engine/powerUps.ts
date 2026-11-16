import { BlockEngineState, PaddleState } from './types';
import { currencyService } from '../services/currency';
import { getActiveDesignConfig } from '../constants/visualPresets';
import { drawPowerUpWithPreset } from './draw/powerUpDrawers';
import {
  PowerUpType,
  PowerUpMeta,
  POWER_UP_CONFIGS,
  PowerUpDrop,
  ActiveBuffs,
  LaserBolt,
  ActiveBuffInfo,
} from './powerUpTypes';

export * from './powerUpTypes';

export class PowerUpManager {
  public drops: PowerUpDrop[] = [];
  public lasers: LaserBolt[] = [];
  public buffs: ActiveBuffs = {
    megaBall: 0,
    laser: 0,
    slowMo: 0,
    expand: 0,
    hasShield: false,
    shield: 0,
    shieldCharges: 0,
  };

  public maxDurations: Record<string, number> = {
    megaball: 5.0,
    laser: 6.0,
    slowmo: 4.0,
    expand: 6.0,
    shield: 8.0,
  };

  private nextId = 1;
  private laserFireTimer = 0;
  private readonly FALL_SPEED = 240;

  public reset() {
    this.drops = [];
    this.lasers = [];
    this.buffs = {
      megaBall: 0,
      laser: 0,
      slowMo: 0,
      expand: 0,
      hasShield: false,
      shield: 0,
      shieldCharges: 0,
    };
    this.laserFireTimer = 0;
  }

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

      if (drop.x >= padL && drop.x <= padR && drop.y >= padT && drop.y <= padB) {
        drop.collected = true;
        this.activateBuff(drop.meta.type);
        collectedTypes.push(drop.meta.type);
        this.drops.splice(i, 1);
        continue;
      }

      if (drop.y > paddle.y + 250) {
        this.drops.splice(i, 1);
      }
    }

    // 2. Decrement active buff timers
    if (this.buffs.megaBall > 0) this.buffs.megaBall = Math.max(0, this.buffs.megaBall - dt);
    if (this.buffs.slowMo > 0) this.buffs.slowMo = Math.max(0, this.buffs.slowMo - dt);
    if (this.buffs.expand > 0) this.buffs.expand = Math.max(0, this.buffs.expand - dt);
    if (this.buffs.shield > 0) {
      this.buffs.shield = Math.max(0, this.buffs.shield - dt);
      if (this.buffs.shield <= 0) {
        this.buffs.hasShield = false;
        this.buffs.shieldCharges = 0;
      }
    }

    // 3. Laser cannons handling (scales with upgrade level)
    if (this.buffs.laser > 0) {
      this.buffs.laser = Math.max(0, this.buffs.laser - dt);
      this.laserFireTimer += dt;

      const laserLvl = currencyService.getUpgradeLevel('laser_power');
      const fireInterval = laserLvl >= 5 ? 0.30 : 0.38;
      const boltW = laserLvl >= 4 ? 6 : 4;
      const boltH = laserLvl >= 4 ? 26 : 18;

      if (this.laserFireTimer >= fireInterval) {
        this.laserFireTimer = 0;
        if (laserLvl <= 2) {
          // Single central blaster
          this.lasers.push({
            id: this.nextId++,
            x: paddle.x,
            y: paddle.y - 6,
            vy: -950,
            w: boltW,
            h: boltH,
          });
        } else {
          // Twin plasma cannons
          const cannonOffset = halfPadW * 0.75;
          this.lasers.push(
            { id: this.nextId++, x: paddle.x - cannonOffset, y: paddle.y - 6, vy: -950, w: boltW, h: boltH },
            { id: this.nextId++, x: paddle.x + cannonOffset, y: paddle.y - 6, vy: -950, w: boltW, h: boltH }
          );
        }
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
    const laserLvl = currencyService.getUpgradeLevel('laser_power');
    const megaLvl = currencyService.getUpgradeLevel('mega_power');
    const slowmoLvl = currencyService.getUpgradeLevel('slowmo_power');
    const expandLvl = currencyService.getUpgradeLevel('expand_power');
    const shieldLvl = currencyService.getUpgradeLevel('shield_power');

    switch (type) {
      case 'megaball': {
        const dur = 5.0 + (megaLvl - 1) * 1.2;
        this.maxDurations.megaball = dur;
        this.buffs.megaBall = dur; // Reset to full duration
        break;
      }
      case 'laser': {
        const dur = 5.0 + (laserLvl - 1) * 1.0;
        this.maxDurations.laser = dur;
        this.buffs.laser = dur; // Reset to full duration
        break;
      }
      case 'slowmo': {
        const dur = 4.0 + (slowmoLvl - 1) * 0.75;
        this.maxDurations.slowmo = dur;
        this.buffs.slowMo = dur; // Reset to full duration
        break;
      }
      case 'expand': {
        const dur = 6.0 + (expandLvl - 1) * 0.8;
        this.maxDurations.expand = dur;
        this.buffs.expand = dur; // Reset to full duration
        break;
      }
      case 'shield': {
        const dur = 8.0 + (shieldLvl - 1) * 2.5;
        this.maxDurations.shield = dur;
        this.buffs.shield = dur;
        this.buffs.hasShield = true;
        this.buffs.shieldCharges = Math.min(6, (this.buffs.shieldCharges || 0) + shieldLvl);
        break;
      }
      case 'multiball':
        break;
    }
  }

  public consumeShield(): boolean {
    if (this.buffs.shieldCharges > 1) {
      this.buffs.shieldCharges--;
      return true;
    }
    if (this.buffs.hasShield || this.buffs.shieldCharges === 1) {
      this.buffs.hasShield = false;
      this.buffs.shieldCharges = 0;
      this.buffs.shield = 0;
      return true;
    }
    return false;
  }

  public hasActiveShield(): boolean {
    return this.buffs.hasShield && this.buffs.shield > 0 && this.buffs.shieldCharges > 0;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    paddle: PaddleState,
    canvasWidth: number,
    canvasHeight: number
  ) {
    // 1. Bottom Forcefield Laser Barrier (Zero shadowBlur for locked 60fps)
    if (this.hasActiveShield()) {
      const shieldY = canvasHeight - 35;
      ctx.save();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, shieldY);
      ctx.lineTo(canvasWidth, shieldY);
      ctx.stroke();

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

    // 2. Falling Power-Up Shards (Dynamic Presets with 3D Orbiting Satellites & Bigger Size)
    const designConfig = getActiveDesignConfig();
    for (const drop of this.drops) {
      drawPowerUpWithPreset(ctx, drop, designConfig.powerUpPreset, {
        animTick: drop.angle,
        scale: designConfig.powerUpScale || 1.35,
      });
    }

    // 3. Laser Bolts
    for (const bolt of this.lasers) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bolt.x - bolt.w / 2, bolt.y - bolt.h / 2, bolt.w, bolt.h);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(bolt.x - bolt.w / 4, bolt.y - bolt.h / 2 + 2, bolt.w / 2, bolt.h - 4);
      ctx.restore();
    }

    // Power timers are now cleanly displayed in HUD Line 2 at the top instead of hovering over the paddle/barrel!
  }

  public getActiveBuffs(): ActiveBuffInfo[] {
    const list: ActiveBuffInfo[] = [];

    if (this.buffs.laser > 0) {
      list.push({
        type: 'laser',
        name: 'LASER',
        current: Math.round(this.buffs.laser * 10) / 10,
        max: this.maxDurations.laser || 6.0,
        color: POWER_UP_CONFIGS.laser.color,
        glow: POWER_UP_CONFIGS.laser.glow,
      });
    }
    if (this.buffs.megaBall > 0) {
      list.push({
        type: 'megaball',
        name: 'MEGA',
        current: Math.round(this.buffs.megaBall * 10) / 10,
        max: this.maxDurations.megaball || 5.0,
        color: POWER_UP_CONFIGS.megaball.color,
        glow: POWER_UP_CONFIGS.megaball.glow,
      });
    }
    if (this.buffs.slowMo > 0) {
      list.push({
        type: 'slowmo',
        name: 'CHRONO',
        current: Math.round(this.buffs.slowMo * 10) / 10,
        max: this.maxDurations.slowmo || 4.0,
        color: POWER_UP_CONFIGS.slowmo.color,
        glow: POWER_UP_CONFIGS.slowmo.glow,
      });
    }
    if (this.buffs.expand > 0) {
      list.push({
        type: 'expand',
        name: 'EXPAND',
        current: Math.round(this.buffs.expand * 10) / 10,
        max: this.maxDurations.expand || 6.0,
        color: POWER_UP_CONFIGS.expand.color,
        glow: POWER_UP_CONFIGS.expand.glow,
      });
    }
    if (this.hasActiveShield()) {
      list.push({
        type: 'shield',
        name: this.buffs.shieldCharges > 1 ? `SHIELD (${this.buffs.shieldCharges}x)` : 'SHIELD',
        current: Math.round(this.buffs.shield * 10) / 10,
        max: this.maxDurations.shield || 8.0,
        color: POWER_UP_CONFIGS.shield.color,
        glow: POWER_UP_CONFIGS.shield.glow,
      });
    }

    return list;
  }
}
