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
} from './powerUpTypes';

export interface ActiveBuffInfo {
  type: PowerUpType;
  name: string;
  current: number;
  max: number;
  color: string;
  glow: string;
  isShield?: boolean;
}

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
    shieldCharges: 0,
  };

  public maxDurations: Record<string, number> = {
    megaball: 5.0,
    laser: 6.0,
    slowmo: 4.0,
    expand: 6.0,
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
        this.buffs.hasShield = true;
        this.buffs.shieldCharges = Math.min(3, (this.buffs.shieldCharges || 0) + shieldLvl);
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
      return true;
    }
    return false;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    paddle: PaddleState,
    canvasWidth: number,
    canvasHeight: number
  ) {
    // 1. Bottom Forcefield Laser Barrier
    if (this.buffs.hasShield || this.buffs.shieldCharges > 0) {
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
    if (this.buffs.shieldCharges > 0) {
      list.push({
        type: 'shield',
        name: 'SHIELD',
        current: this.buffs.shieldCharges,
        max: 3,
        color: POWER_UP_CONFIGS.shield.color,
        glow: POWER_UP_CONFIGS.shield.glow,
        isShield: true,
      });
    }

    return list;
  }

  private renderActiveBuffRings(
    ctx: CanvasRenderingContext2D,
    paddle: PaddleState,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const activeItems: {
      type: PowerUpType;
      current: number;
      max: number;
      meta: PowerUpMeta;
      isShield?: boolean;
    }[] = [];

    if (this.buffs.laser > 0) {
      activeItems.push({
        type: 'laser',
        current: this.buffs.laser,
        max: this.maxDurations.laser || 6.0,
        meta: POWER_UP_CONFIGS.laser,
      });
    }
    if (this.buffs.megaBall > 0) {
      activeItems.push({
        type: 'megaball',
        current: this.buffs.megaBall,
        max: this.maxDurations.megaball || 5.0,
        meta: POWER_UP_CONFIGS.megaball,
      });
    }
    if (this.buffs.slowMo > 0) {
      activeItems.push({
        type: 'slowmo',
        current: this.buffs.slowMo,
        max: this.maxDurations.slowmo || 4.0,
        meta: POWER_UP_CONFIGS.slowmo,
      });
    }
    if (this.buffs.expand > 0) {
      activeItems.push({
        type: 'expand',
        current: this.buffs.expand,
        max: this.maxDurations.expand || 6.0,
        meta: POWER_UP_CONFIGS.expand,
      });
    }
    if (this.buffs.shieldCharges > 0) {
      activeItems.push({
        type: 'shield',
        current: this.buffs.shieldCharges,
        max: 3,
        meta: POWER_UP_CONFIGS.shield,
        isShield: true,
      });
    }

    if (activeItems.length === 0) return;

    const ringRadius = 34;
    const ringSpacing = 86;
    const totalWidth = (activeItems.length - 1) * ringSpacing;

    // Smoothly tracks paddle horizontally with screen edge bounds
    const rawStartX = paddle.x - totalWidth / 2;
    const minX = ringRadius + 28;
    const maxX = canvasWidth - ringRadius - 28;
    const startX = Math.max(minX, Math.min(maxX - totalWidth, rawStartX));

    // Anchored directly above paddle with a comfortable 24px gap
    const ringY = paddle.y - 78;

    ctx.save();

    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i];
      const cx = startX + i * ringSpacing;
      const cy = ringY;
      const ratio = item.isShield ? item.current / item.max : Math.max(0, item.current / item.max);

      // Urgency pulse if remaining time <= 2.0s
      let alpha = 1.0;
      if (!item.isShield && item.current <= 2.0) {
        alpha = 0.45 + 0.55 * Math.abs(Math.sin(Date.now() * 0.015));
      }
      ctx.globalAlpha = alpha;

      // Dark cyber circular backing with neon aura
      ctx.fillStyle = 'rgba(5, 9, 28, 0.92)';
      ctx.shadowColor = item.meta.glow;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius + 5, 0, Math.PI * 2);
      ctx.fill();

      // Outer bezel border
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Background Progress Track
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Depleting Progress Ring (clockwise from top -Math.PI / 2)
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = item.meta.color;
      ctx.shadowColor = item.meta.glow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, -Math.PI / 2, -Math.PI / 2 + ratio * Math.PI * 2, false);
      ctx.stroke();

      // Center Glyph / Symbol (Crisp, proportional font)
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px "Chakra Petch", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.meta.symbol, cx, cy - 1);

      // Timer Pill Badge below ring (Clear, highly legible, 0px overlap with paddle)
      const labelText = item.isShield ? `${item.current}x` : `${item.current.toFixed(1)}s`;
      const pillY = cy + ringRadius + 18;

      ctx.fillStyle = 'rgba(4, 7, 22, 0.92)';
      ctx.strokeStyle = item.meta.color;
      ctx.lineWidth = 1.0;
      ctx.shadowColor = item.meta.glow;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(cx - 26, pillY - 10, 52, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 4;
      ctx.fillStyle = item.meta.color;
      ctx.font = 'bold 14px "Orbitron", monospace';
      ctx.fillText(labelText, cx, pillY);
    }

    ctx.restore();
  }
}
