/**
 * Explode Block Animation System
 * Arcade-grade explosion & shockwave system for EMP Detonator blocks.
 */

export interface BlastWave {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  life: number;
  maxLife: number;
  color: string;
  secondaryColor: string;
  tendrilAngles: number[];
}

export interface ShatterChunk {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  angle: number;
  rotSpeed: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  delay: number; // Staggered explosion delay based on distance from epicenter
  hasEmpArc: boolean;
}

export interface ExplodeShard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'spark' | 'diamond' | 'shard';
  angle: number;
  rotSpeed: number;
}

export interface ElectricArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export class ExplosionSystem {
  public blastWaves: BlastWave[] = [];
  public shatterChunks: ShatterChunk[] = [];
  public shards: ExplodeShard[] = [];
  public electricArcs: ElectricArc[] = [];
  private nextId = 0;

  /**
   * Spawns an EMP Detonator explosion at (x, y) with shockwave and debris.
   */
  public spawnExplosion(x: number, y: number, maxRadius: number = 270): void {
    // 1. Dual-phase Shockwave Ring
    const tendrilCount = 8;
    const tendrilAngles: number[] = [];
    for (let i = 0; i < tendrilCount; i++) {
      tendrilAngles.push((i * Math.PI * 2) / tendrilCount + (Math.random() - 0.5) * 0.4);
    }

    this.blastWaves.push({
      id: ++this.nextId,
      x,
      y,
      radius: 12,
      maxRadius,
      speed: 16.5,
      life: 1.0,
      maxLife: 1.0,
      color: '#00f7ff',
      secondaryColor: '#ff9900',
      tendrilAngles,
    });

    // 2. High-energy Epicenter Shards & Fireballs
    const shardCount = 42;
    const shardColors = ['#ffffff', '#ffeedd', '#ff9900', '#ff3b00', '#00f7ff', '#38bdf8', '#fbbf24'];

    for (let i = 0; i < shardCount; i++) {
      const angle = (i * Math.PI * 2) / shardCount + (Math.random() - 0.5) * 0.35;
      const speed = Math.random() * 16 + 6;
      const life = Math.random() * 0.4 + 0.45;
      const shapeRand = Math.random();
      const shape: 'spark' | 'diamond' | 'shard' =
        shapeRand < 0.4 ? 'shard' : shapeRand < 0.7 ? 'spark' : 'diamond';

      this.shards.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 9 + 4,
        color: shardColors[Math.floor(Math.random() * shardColors.length)],
        alpha: 1.0,
        life,
        maxLife: life,
        shape,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.35,
      });
    }

    // 3. Lightning Flash Arcs
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const len = Math.random() * 70 + 35;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      const perpAngle = angle + Math.PI / 2;
      const jitter = (Math.random() - 0.5) * 24;
      const midX = (x + x2) / 2 + Math.cos(perpAngle) * jitter;
      const midY = (y + y2) / 2 + Math.sin(perpAngle) * jitter;

      this.electricArcs.push({
        x1: x,
        y1: y,
        x2,
        y2,
        midX,
        midY,
        color: i % 2 === 0 ? '#00f7ff' : '#ffffff',
        alpha: 1.0,
        life: 0.25,
        maxLife: 0.25,
      });
    }
  }

  /**
   * Spawns directional shatter chunks for near blocks destroyed by the explosion blast.
   * Chunks are dynamically propelled AWAY from the explosion epicenter.
   */
  public spawnNearBlockShatter(
    blockX: number,
    blockY: number,
    blockW: number,
    blockH: number,
    color: string,
    epicenterX: number,
    epicenterY: number
  ): void {
    const blockCenterX = blockX + blockW / 2;
    const blockCenterY = blockY + blockH / 2;

    const dx = blockCenterX - epicenterX;
    const dy = blockCenterY - epicenterY;
    const dist = Math.hypot(dx, dy) || 1;
    const outwardAngle = Math.atan2(dy, dx);

    // Stagger delay based on shockwave travel time
    const delay = Math.max(0, Math.min(8, Math.floor(dist / 38)));

    // Shatter into 12-16 authentic geometric block fragments
    const cols = 4;
    const rows = 3;
    const chunkW = blockW / cols;
    const chunkH = blockH / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = blockX + c * chunkW + chunkW / 2;
        const cy = blockY + r * chunkH + chunkH / 2;

        // Individual shard impulse: directional away from epicenter + chaotic blast spread
        const pieceDx = cx - epicenterX;
        const pieceDy = cy - epicenterY;
        const pieceAngle = Math.atan2(pieceDy, pieceDx) + (Math.random() - 0.5) * 0.6;
        const blastImpulse = Math.random() * 12 + 8;
        const life = Math.random() * 0.35 + 0.45;

        this.shatterChunks.push({
          x: cx,
          y: cy,
          vx: Math.cos(pieceAngle) * blastImpulse,
          vy: Math.sin(pieceAngle) * blastImpulse,
          w: chunkW * (0.8 + Math.random() * 0.4),
          h: chunkH * (0.8 + Math.random() * 0.4),
          angle: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.4,
          color,
          alpha: 1.0,
          life,
          maxLife: life,
          delay,
          hasEmpArc: Math.random() < 0.5,
        });
      }
    }

    // Directional EMP sizzle sparks
    for (let i = 0; i < 12; i++) {
      const speed = Math.random() * 14 + 5;
      const spkAngle = outwardAngle + (Math.random() - 0.5) * 1.2;
      const life = Math.random() * 0.3 + 0.25;

      this.shards.push({
        x: blockCenterX + (Math.random() - 0.5) * blockW * 0.6,
        y: blockCenterY + (Math.random() - 0.5) * blockH * 0.6,
        vx: Math.cos(spkAngle) * speed,
        vy: Math.sin(spkAngle) * speed,
        size: Math.random() * 5 + 2,
        color: Math.random() < 0.5 ? '#00f7ff' : '#ffea00',
        alpha: 1.0,
        life,
        maxLife: life,
        shape: 'spark',
        angle: spkAngle,
        rotSpeed: 0,
      });
    }
  }

  /**
   * Spawns crackling electric arcs on blocks damaged (but not destroyed) by the blast wave.
   */
  public spawnNearBlockDamage(
    blockX: number,
    blockY: number,
    blockW: number,
    blockH: number,
    color: string
  ): void {
    const corners = [
      { x: blockX, y: blockY },
      { x: blockX + blockW, y: blockY },
      { x: blockX + blockW, y: blockY + blockH },
      { x: blockX, y: blockY + blockH },
    ];

    for (let i = 0; i < 3; i++) {
      const idxA = Math.floor(Math.random() * 4);
      const idxB = (idxA + 1 + Math.floor(Math.random() * 2)) % 4;
      const p1 = corners[idxA];
      const p2 = corners[idxB];
      const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 16;
      const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 16;

      this.electricArcs.push({
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        midX,
        midY,
        color: '#00f7ff',
        alpha: 0.95,
        life: 0.28,
        maxLife: 0.28,
      });
    }
  }

  /**
   * Updates all active blast waves, shatter chunks, and debris.
   */
  public update(): void {
    // 1. Update Blast Waves
    for (let i = this.blastWaves.length - 1; i >= 0; i--) {
      const bw = this.blastWaves[i];
      bw.radius += bw.speed;
      bw.speed *= 0.93; // Explosive deceleration
      bw.life -= 0.038;

      if (bw.life <= 0 || bw.radius >= bw.maxRadius * 1.15) {
        this.blastWaves.splice(i, 1);
      }
    }

    // 2. Update Shatter Chunks
    for (let i = this.shatterChunks.length - 1; i >= 0; i--) {
      const sc = this.shatterChunks[i];
      if (sc.delay > 0) {
        sc.delay--;
        continue;
      }

      sc.x += sc.vx;
      sc.y += sc.vy;
      sc.vx *= 0.94; // Air resistance
      sc.vy += 0.22; // Gravity
      sc.angle += sc.rotSpeed;
      sc.life -= 0.026;
      sc.alpha = Math.max(0, sc.life / sc.maxLife);

      if (sc.life <= 0) {
        this.shatterChunks.splice(i, 1);
      }
    }

    // 3. Update Shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const sh = this.shards[i];
      sh.x += sh.vx;
      sh.y += sh.vy;
      sh.vx *= 0.94;
      sh.vy += 0.18;
      sh.angle += sh.rotSpeed;
      sh.life -= 0.032;
      sh.alpha = Math.max(0, sh.life / sh.maxLife);

      if (sh.life <= 0) {
        this.shards.splice(i, 1);
      }
    }

    // 4. Update Electric Arcs
    for (let i = this.electricArcs.length - 1; i >= 0; i--) {
      const ea = this.electricArcs[i];
      ea.life -= 0.045;
      ea.alpha = Math.max(0, ea.life / ea.maxLife);

      if (ea.life <= 0) {
        this.electricArcs.splice(i, 1);
      }
    }
  }

  /**
   * Renders active explosions, shockwaves, and shattering near blocks.
   * Rendered above the blocks layer for maximum visual clarity and arcade punch.
   */
  public render(ctx: CanvasRenderingContext2D): void {
    if (
      this.blastWaves.length === 0 &&
      this.shatterChunks.length === 0 &&
      this.shards.length === 0 &&
      this.electricArcs.length === 0
    ) {
      return;
    }

    ctx.save();

    // 1. Render Blast Waves & Expanding Shockwave Rings
    for (let i = 0; i < this.blastWaves.length; i++) {
      const bw = this.blastWaves[i];
      const progress = Math.min(1.0, bw.radius / bw.maxRadius);
      const alpha = Math.max(0, bw.life / bw.maxLife);

      // Primary Luminous Shockwave Ring
      ctx.save();
      ctx.globalAlpha = alpha * 0.9;
      ctx.strokeStyle = bw.color;
      ctx.lineWidth = Math.max(1.8, 5.5 * (1 - progress));
      ctx.beginPath();
      ctx.arc(bw.x, bw.y, bw.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary Trailing Compression Ring
      if (bw.radius > 24) {
        ctx.globalAlpha = alpha * 0.45;
        ctx.strokeStyle = bw.secondaryColor;
        ctx.lineWidth = Math.max(1.2, 3.2 * (1 - progress));
        ctx.beginPath();
        ctx.arc(bw.x, bw.y, bw.radius * 0.82, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Epicenter Plasma Fireball (Fast expanding, rapid fadeout)
      if (progress < 0.65) {
        const coreAlpha = alpha * (1 - progress / 0.65) * 0.7;
        const coreR = Math.max(14, bw.radius * 0.55);
        const grad = ctx.createRadialGradient(bw.x, bw.y, 2, bw.x, bw.y, coreR);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.35, 'rgba(255, 170, 0, 0.65)');
        grad.addColorStop(0.7, 'rgba(0, 247, 255, 0.35)');
        grad.addColorStop(1, 'rgba(0, 247, 255, 0)');

        ctx.globalAlpha = coreAlpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bw.x, bw.y, coreR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Radiating EMP Tendril Bolts along the wavefront
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      for (const tAngle of bw.tendrilAngles) {
        const innerR = bw.radius * 0.75;
        const outerR = bw.radius * 1.08;
        const x1 = bw.x + Math.cos(tAngle) * innerR;
        const y1 = bw.y + Math.sin(tAngle) * innerR;
        const x2 = bw.x + Math.cos(tAngle + 0.08) * outerR;
        const y2 = bw.y + Math.sin(tAngle + 0.08) * outerR;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Render Shatter Chunks of Destroyed Near Blocks
    for (let i = 0; i < this.shatterChunks.length; i++) {
      const sc = this.shatterChunks[i];
      if (sc.delay > 0) continue;

      ctx.save();
      ctx.globalAlpha = sc.alpha;
      ctx.translate(sc.x, sc.y);
      ctx.rotate(sc.angle);

      // Block fragment core
      ctx.fillStyle = sc.color;
      ctx.fillRect(-sc.w / 2, -sc.h / 2, sc.w, sc.h);

      // Super-heated glowing edge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(-sc.w / 2, -sc.h / 2, sc.w, sc.h);

      // Electric sizzle on fragment
      if (sc.hasEmpArc && sc.alpha > 0.4) {
        ctx.strokeStyle = '#00f7ff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-sc.w / 2, 0);
        ctx.lineTo(sc.w / 2, (Math.random() - 0.5) * sc.h);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 3. Render High-Speed Blast Shards & Sparks
    for (let i = 0; i < this.shards.length; i++) {
      const sh = this.shards[i];
      ctx.save();
      ctx.globalAlpha = sh.alpha;
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.angle);
      ctx.fillStyle = sh.color;

      if (sh.shape === 'spark') {
        ctx.fillRect(-sh.size, -1, sh.size * 2, 2.4);
      } else if (sh.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(0, -sh.size);
        ctx.lineTo(sh.size * 0.7, 0);
        ctx.lineTo(0, sh.size);
        ctx.lineTo(-sh.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-sh.size / 2, -sh.size / 2, sh.size, sh.size);
      }
      ctx.restore();
    }

    // 4. Render Electric Arcs
    for (let i = 0; i < this.electricArcs.length; i++) {
      const ea = this.electricArcs[i];
      ctx.save();
      ctx.globalAlpha = ea.alpha;
      ctx.strokeStyle = ea.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ea.x1, ea.y1);
      ctx.lineTo(ea.midX, ea.midY);
      ctx.lineTo(ea.x2, ea.y2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  public clear(): void {
    this.blastWaves = [];
    this.shatterChunks = [];
    this.shards = [];
    this.electricArcs = [];
  }
}
