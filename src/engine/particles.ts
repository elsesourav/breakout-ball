import { Particle, Star, FloatingText } from './types';

const STAR_PALETTE = [
  'rgba(255, 255, 255, ALPHA)',
  'rgba(0, 247, 255, ALPHA)',
  'rgba(251, 191, 36, ALPHA)',
  'rgba(192, 132, 252, ALPHA)',
  'rgba(56, 189, 248, ALPHA)',
];

export class ParticleSystem {
  public particles: Particle[] = [];
  public stars: Star[] = [];
  public floatingTexts: FloatingText[] = [];
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

  public spawnBlockExplosion(x: number, y: number, color: string, isDestroy: boolean = true) {
    const count = isDestroy ? 34 : 18;
    const baseSpeed = isDestroy ? 13 : 7;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * baseSpeed + (isDestroy ? 3 : 1);
      const life = Math.random() * 0.45 + (isDestroy ? 0.65 : 0.4);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * (isDestroy ? 8 : 5) + 3,
        color,
        alpha: 1.0,
        life,
        maxLife: life,
        shape: Math.random() > 0.4 ? 'square' : 'spark',
      });
    }
  }

  public spawnPaddleBounce(x: number, y: number) {
    const bounceColors = ['#00f7ff', '#38bdf8', '#fbbf24', '#ffffff', '#a855f7'];
    for (let i = 0; i < 24; i++) {
      const angle = -Math.PI / 2 + (Math.random() * 1.6 - 0.8);
      const speed = Math.random() * 9 + 3;
      this.particles.push({
        x: x + (Math.random() * 36 - 18),
        y: y - 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2.5,
        color: bounceColors[Math.floor(Math.random() * bounceColors.length)],
        alpha: 0.95,
        life: 0.45,
        maxLife: 0.45,
        shape: Math.random() > 0.3 ? 'spark' : 'square',
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
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
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
    // 1. Continuous Steady Ambient Particle Stream (Living arcade arena atmosphere)
    if (this.particles.length < 80 && Math.random() < 0.45) {
      const ambientColors = ['#00f7ff', '#38bdf8', '#818cf8', '#c084fc', '#facc15'];
      const chosenColor = ambientColors[Math.floor(Math.random() * ambientColors.length)];
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
        alpha: Math.random() * 0.6 + 0.35,
        life,
        maxLife: life,
        shape: Math.random() > 0.4 ? 'spark' : 'square',
      });
    }

    // 2. Update stars with Black Hole Gravitational Suction
    const bhX = width * 0.5;
    const bhY = height - 16;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      // Baseline downward drift
      s.y += s.speed * 0.75;

      // Gravitational suction begins in mid-lower arena and accelerates toward singularity
      if (s.y > height * 0.35) {
        const dx = bhX - s.x;
        const dy = bhY - s.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist > 8) {
          // Graceful suction spiral
          const pullForce = Math.min(5.5, 68000 / (distSq + 16000));
          const dirX = dx / dist;
          const dirY = dy / dist;
          const swirlDir = i % 2 === 0 ? 1 : -1;
          const tanX = -dirY * swirlDir;
          const tanY = dirX * swirlDir;

          s.x += dirX * pullForce * 1.4 + tanX * pullForce * 0.6;
          s.y += dirY * pullForce * 1.4 + tanY * pullForce * 0.6;
        }

        // Singularity swallow condition: plunged into black hole event horizon
        if (dist < 55 || s.y > height + 20) {
          s.y = -10 - Math.random() * 30;
          s.x = Math.random() * width;
          s.alpha = Math.random() * 0.65 + 0.25;
        } else {
          s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.01;
          s.alpha = Math.max(0.15, Math.min(0.9, s.alpha));
        }
      } else {
        if (s.y > height) {
          s.y = -10 - Math.random() * 20;
          s.x = Math.random() * width;
        } else {
          s.alpha += Math.sin(Date.now() * s.twinkleSpeed) * 0.01;
          s.alpha = Math.max(0.15, Math.min(0.9, s.alpha));
        }
      }
    }

    // 3. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // Gravity
      p.vx *= 0.98; // Friction
      p.life -= 0.022;
      p.alpha = Math.max(0, p.life / p.maxLife);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 4. Update floating texts
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
    // 1. Render Stars (Crisp, zero-shadow micro-stars for locked 60 FPS)
    ctx.save();
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const alphaClamped = Math.max(0.1, Math.min(1.0, s.alpha));
      ctx.fillStyle = s.color ? s.color.replace('ALPHA', alphaClamped.toFixed(2)) : `rgba(255, 255, 255, ${alphaClamped})`;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.restore();

    // 2. Render Particles (NO heavy shadowBlur for ultra-fast GPU rasterization)
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.fillRect(p.x - p.size / 2, p.y - 1, p.size * 1.6, 2.2);
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    }
    ctx.restore();

    // 3. Render Floating Texts
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
  }
}
