import { Particle, Star, FloatingText, DestroyingBlock } from './types';

const STAR_PALETTE = [
  'rgba(255, 255, 255, ALPHA)',
  'rgba(0, 247, 255, ALPHA)',
  'rgba(251, 191, 36, ALPHA)',
  'rgba(192, 132, 252, ALPHA)',
  'rgba(56, 189, 248, ALPHA)',
];

function parseHexColor(hex: string): [number, number, number] {
  if (hex && hex.startsWith('#')) {
    let c = hex.slice(1);
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const num = parseInt(c, 16);
    if (!isNaN(num)) {
      return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
    }
  }
  return [0.0, 0.97, 1.0];
}

export class ParticleSystem {
  public particles: Particle[] = [];
  public stars: Star[] = [];
  public floatingTexts: FloatingText[] = [];
  public destroyingBlocks: DestroyingBlock[] = [];
  private textCounter: number = 0;

  constructor(width: number, height: number, starCount: number = 240) {
    this.initStars(width, height, starCount);
  }

  public initStars(width: number, height: number, count: number = 240) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.6 + 0.8,
        alpha: Math.random() * 0.75 + 0.2,
        speed: Math.random() * 0.55 + 0.15,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        color: STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)],
      });
    }
  }

  /**
   * Spawns a dying brick that collapses inwards ("slowly small, slowly small")
   * and gets sucked downward into the black hole singularity.
   */
  public spawnDestroyingBlock(
    x: number,
    y: number,
    w: number,
    h: number,
    initialHealth: number,
    color: string,
    borderColor: string
  ) {
    this.destroyingBlocks.push({
      x,
      y,
      w,
      h,
      initialHealth,
      color,
      borderColor,
      scale: 1.0,
      alpha: 1.0,
      life: 1.0,
      maxLife: 1.0,
      suctionVx: 0,
      suctionVy: 0,
    });
  }

  /**
   * Spawns block shatter particles. Destroyed particles have extended lifespan
   * and are gravitationally sucked downward into the black hole singularity.
   */
  public spawnBlockExplosion(x: number, y: number, color: string, isDestroy: boolean = true) {
    const count = isDestroy ? 48 : 20;
    const baseSpeed = isDestroy ? 7.0 : 5.0;
    const [r, g, b] = parseHexColor(color);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * baseSpeed + (isDestroy ? 2.0 : 1.0);
      const life = isDestroy ? Math.random() * 0.7 + 1.8 : Math.random() * 0.35 + 0.4;
      const baseSize = Math.random() * (isDestroy ? 5.0 : 3.5) + (isDestroy ? 4.8 : 3.2);

      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isDestroy ? 1.2 : 0),
        size: baseSize,
        baseSize,
        color,
        r,
        g,
        b,
        alpha: 1.0,
        life,
        maxLife: life,
        shape: Math.random() > 0.4 ? 'square' : 'spark',
        isDebris: isDestroy,
      });
    }
  }

  public spawnPaddleBounce(x: number, y: number) {
    const bounceColors = ['#00f7ff', '#38bdf8', '#fbbf24', '#ffffff', '#a855f7'];
    for (let i = 0; i < 24; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 1.6 - 0.8);
      const speed = Math.random() * 9 + 3;
      const chosenColor = bounceColors[Math.floor(Math.random() * bounceColors.length)];
      const [r, g, b] = parseHexColor(chosenColor);
      this.particles.push({
        x: x + (Math.random() * 36 - 18),
        y: y - 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2.5,
        color: chosenColor,
        r,
        g,
        b,
        alpha: 0.95,
        life: 0.45,
        maxLife: 0.45,
        shape: Math.random() > 0.3 ? 'spark' : 'square',
      });
    }
  }

  public spawnLaserMuzzleFlash(x: number, y: number) {
    const muzzleColors = ['#ff0055', '#ff4d79', '#ffffff', '#fbbf24'];
    for (let i = 0; i < 9; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 1.2 - 0.6);
      const speed = Math.random() * 9 + 4;
      const color = muzzleColors[Math.floor(Math.random() * muzzleColors.length)];
      const [r, g, b] = parseHexColor(color);
      this.particles.push({
        x: x + (Math.random() * 6 - 3), y: y - 2,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 2.0, color, r, g, b, alpha: 1.0, life: 0.22, maxLife: 0.22, shape: 'spark',
      });
    }
  }

  public spawnLaserTrail(x: number, y: number) {
    if (this.particles.length > 220 || Math.random() > 0.45) return;
    const color = Math.random() > 0.5 ? '#ff0055' : '#00f7ff';
    const [r, g, b] = parseHexColor(color);
    this.particles.push({
      x: x + (Math.random() * 4 - 2), y: y + 10,
      vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 2 + 1,
      size: Math.random() * 2.2 + 1.2, color, r, g, b, alpha: 0.85, life: 0.14, maxLife: 0.14, shape: 'spark',
    });
  }

  public spawnLaserImpact(x: number, y: number) {
    const impactColors = ['#ff0055', '#ff4d79', '#fbbf24', '#ffffff'];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      const color = impactColors[Math.floor(Math.random() * impactColors.length)];
      const [r, g, b] = parseHexColor(color);
      this.particles.push({
        x: x + (Math.random() * 8 - 4), y: y + (Math.random() * 8 - 4),
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: Math.random() * 4.0 + 2.0, color, r, g, b, alpha: 1.0, life: 0.25, maxLife: 0.25, shape: 'spark',
      });
    }
  }

  public spawnVictoryConfetti(width: number, height: number) {
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth <= 768 || 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0);
    const count = isMobile ? 24 : 42;
    const colors = ['#00f7ff', '#ff0844', '#eeff01', '#04ef00', '#b773ff'];
    for (let i = 0; i < count; i++) {
      const x = width * 0.35 + Math.random() * (width * 0.3);
      const y = height * 0.45 + Math.random() * (height * 0.15);
      const angle = -Math.PI / 2 + (Math.random() * 1.0 - 0.5);
      const speed = Math.random() * 6 + 3;
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      const [r, g, b] = parseHexColor(chosenColor);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: chosenColor,
        r,
        g,
        b,
        alpha: 1.0,
        life: 0.9,
        maxLife: 0.9,
        shape: 'square',
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#00f7ff') {
    this.floatingTexts.push({
      id: ++this.textCounter,
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale: 1.3,
    });
  }

  public update(width: number, height: number) {
    // 1. Living arcade arena atmosphere ambient stream
    if (this.particles.length < 80 && Math.random() < 0.45) {
      const ambientColors = ['#00f7ff', '#38bdf8', '#818cf8', '#c084fc', '#facc15'];
      const chosenColor = ambientColors[Math.floor(Math.random() * ambientColors.length)];
      const [r, g, b] = parseHexColor(chosenColor);
      const startX = Math.random() * width;
      const startY = Math.random() * (height * 0.55);
      const life = Math.random() * 1.8 + 1.2;
      this.particles.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 1.4,
        vy: Math.random() * 0.9 + 0.25,
        size: Math.random() * 3.5 + 1.8,
        color: chosenColor,
        r,
        g,
        b,
        alpha: Math.random() * 0.6 + 0.35,
        life,
        maxLife: life,
        shape: Math.random() > 0.4 ? 'spark' : 'square',
      });
    }

    // 2. Cosmic Black Hole Gravitational Singularity coordinates (bottom center)
    const bhX = width * 0.5;
    const bhY = height - 16;

    // Stars update with Black Hole Gravitational Suction
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.y += s.speed * 0.75;
      if (s.y > height * 0.35) {
        const dx = bhX - s.x;
        const dy = bhY - s.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist > 8) {
          const pullForce = Math.min(5.5, 68000 / (distSq + 16000));
          const dirX = dx / dist;
          const dirY = dy / dist;
          const swirlDir = i % 2 === 0 ? 1 : -1;
          s.x += dirX * pullForce * 1.4 + -dirY * swirlDir * pullForce * 0.6;
          s.y += dirY * pullForce * 1.4 + dirX * swirlDir * pullForce * 0.6;
        }

        if (dist < 55 || s.y > height + 20) {
          s.y = -10 - Math.random() * 30;
          s.x = Math.random() * width;
          s.alpha = Math.random() * 0.65 + 0.25;
        } else {
          s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.01;
          s.alpha = Math.max(0.15, Math.min(0.9, s.alpha));
        }
      } else if (s.y > height) {
        s.y = -10 - Math.random() * 20;
        s.x = Math.random() * width;
      } else {
        s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.01;
        s.alpha = Math.max(0.15, Math.min(0.9, s.alpha));
      }
    }

    // 3. Update Particles with Authentic Black Hole Gravitational Suction & Progressive Shrinking
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.isDebris) {
        // Gravitational suction towards bottom-center singularity
        const dx = bhX - p.x;
        const dy = bhY - p.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Smoothly ramp in suction after initial shatter burst
        const age = p.maxLife - p.life;
        const ramp = Math.min(1.0, age / 0.28);
        const gravForce = Math.min(8.5, 140000 / (distSq + 20000)) * ramp;
        const dirX = dx / Math.max(1, dist);
        const dirY = dy / Math.max(1, dist);

        // Swirl around black hole axis
        const swirlDir = i % 2 === 0 ? 1 : -1;
        const tanX = -dirY * swirlDir * 0.18 * gravForce;

        p.vx += dirX * gravForce * 0.55 + tanX;
        p.vy += 0.28 + dirY * gravForce * 0.85;

        // Dampen velocity to create smooth gravitational fluid motion
        p.vx *= 0.965;
        p.vy *= 0.985;

        p.x += p.vx;
        p.y += p.vy;

        p.life -= 0.018;

        // Size slowly shrinks as it descends towards black hole ("slowly small, slowly small")
        // Retain clear visibility floor for eye perception without sudden pixel collapse
        const distFactor = Math.max(0.42, Math.min(1.0, dist / 260));
        const lifeFactor = Math.max(0.38, p.life / p.maxLife);
        p.size = Math.max(2.8, (p.baseSize || 5) * distFactor * lifeFactor);
        p.alpha = Math.max(0.22, Math.min(1.0, p.life / (p.maxLife * 0.72)));

        // Singularity swallow condition: plunged into black hole event horizon
        if (dist < 32 || p.y > height + 10 || p.life <= 0) {
          this.particles.splice(i, 1);
        }
      } else {
        // Non-debris particles (paddle bounce, ambient)
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.vx *= 0.98;
        p.life -= 0.022;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    // 4. Update Destroying Blocks (Shrinking Inward & Black Hole Suction)
    for (let i = this.destroyingBlocks.length - 1; i >= 0; i--) {
      const db = this.destroyingBlocks[i];
      db.life -= 0.025; // Smooth inward contraction and suction (~40 frames)

      const t = 1.0 - Math.max(0, db.life / db.maxLife);

      // "the bricks are slowly small, slowly small... Not very big, okay?"
      // Smooth inward contraction: holds steady for initial 15%, then scales down to 0
      if (t < 0.15) {
        db.scale = 1.0;
      } else {
        const prog = (t - 0.15) / 0.85;
        db.scale = Math.max(0, 1.0 - Math.pow(prog, 1.35));
      }

      // "and then suction": pull downward and toward black hole center
      const dx = bhX - (db.x + db.w / 2);
      const dy = bhY - (db.y + db.h / 2);
      const dist = Math.max(1, Math.hypot(dx, dy));

      db.suctionVy += 0.32 + (dy / dist) * 0.6;
      db.suctionVx += (dx / dist) * 0.25;
      db.suctionVx *= 0.96;

      db.x += db.suctionVx;
      db.y += db.suctionVy;

      db.alpha = Math.max(0, Math.min(1.0, db.life / (db.maxLife * 0.65)));

      if (db.life <= 0 || db.scale <= 0.01 || db.y > height + 10) {
        this.destroyingBlocks.splice(i, 1);
      }
    }

    // 5. Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 1.8;
      ft.alpha -= 0.025;
      ft.scale = Math.max(1.0, ft.scale - 0.02);

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    // 1. Render Stars
    ctx.save();
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const alphaClamped = Math.max(0.1, Math.min(1.0, s.alpha));
      ctx.fillStyle = s.color ? s.color.replace('ALPHA', alphaClamped.toFixed(2)) : `rgba(255, 255, 255, ${alphaClamped})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.restore();

    // 2. Render Particles
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size / 2, p.y - 1.2, p.size * 1.6, 2.4);
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();

    // 3. Render Destroying Blocks (Canvas 2D)
    if (this.destroyingBlocks.length > 0) {
      ctx.save();
      for (const db of this.destroyingBlocks) {
        const cx = db.x + db.w / 2;
        const cy = db.y + db.h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(db.scale, db.scale);
        ctx.globalAlpha = db.alpha;

        const rw = db.w;
        const rh = db.h;
        ctx.fillStyle = db.color;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(-rw / 2, -rh / 2, rw, rh, 4);
        } else {
          ctx.rect(-rw / 2, -rh / 2, rw, rh);
        }
        ctx.fill();

        ctx.strokeStyle = db.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-rw * 0.3, 0);
        ctx.lineTo(rw * 0.3, 0);
        ctx.stroke();

        ctx.restore();
      }
      ctx.restore();
    }

    // 4. Render Floating Texts
    if (this.floatingTexts.length > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < this.floatingTexts.length; i++) {
        const ft = this.floatingTexts[i];
        ctx.globalAlpha = ft.alpha;
        ctx.font = `900 ${Math.floor(28 * ft.scale)}px 'Orbitron', 'Chakra Petch', monospace`;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.restore();
    }
  }

  public clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.destroyingBlocks = [];
  }
}
