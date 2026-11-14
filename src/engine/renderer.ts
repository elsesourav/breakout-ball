import { BallState, PaddleState, BlockEngineState } from './types';
import { ParticleSystem } from './particles';
import { BLOCK_COLORS } from '../constants/game';
import { PowerUpManager } from './powerUps';

export class GameRenderer {
  private width: number;
  private height: number;
  private animTick = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    balls: BallState[] | BallState,
    paddle: PaddleState,
    blocks: BlockEngineState[],
    particles: ParticleSystem,
    powerUps?: PowerUpManager
  ) {
    const w = this.width;
    const h = this.height;
    this.animTick += 0.05;

    const ballList = Array.isArray(balls) ? balls : [balls];

    // 1. Clear & Cyber Radial Backdrop
    ctx.clearRect(0, 0, w, h);

    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, h);
    bgGrad.addColorStop(0, '#0a0d2c');
    bgGrad.addColorStop(0.6, '#040616');
    bgGrad.addColorStop(1, '#01020a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle perspective cyber grid lines
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 80;
    for (let x = 0; x <= w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Background Stars
    particles.render(ctx);

    // 3. Danger Floor (Lava / Void Laser)
    ctx.save();
    const lavaHeight = 44;
    const lavaGrad = ctx.createLinearGradient(0, h - lavaHeight, 0, h);
    lavaGrad.addColorStop(0, 'rgba(255, 8, 68, 0.0)');
    lavaGrad.addColorStop(0.5, 'rgba(255, 8, 68, 0.35)');
    lavaGrad.addColorStop(1, 'rgba(255, 8, 68, 0.9)');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, h - lavaHeight, w, lavaHeight);

    // Top laser edge
    ctx.strokeStyle = '#ff0844';
    ctx.shadowColor = '#ff0844';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, h - lavaHeight);
    ctx.lineTo(w, h - lavaHeight);
    ctx.stroke();
    ctx.restore();

    // 4. Power-Up Shards & Shield Barrier
    if (powerUps) {
      powerUps.render(ctx, paddle, w, h);
    }

    // 5. Blocks Rendering
    const padding = 3;
    blocks.forEach((block) => {
      if (block.isDead || block.health <= 0) return;
      const config = BLOCK_COLORS[block.health] || BLOCK_COLORS[1];

      const bx = block.x + padding;
      const by = block.y + padding;
      const bw = block.w - padding * 2;
      const bh = block.h - padding * 2;
      const r = Math.min(bw, bh) * 0.22;

      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, bw, bh, r);
      } else {
        ctx.rect(bx, by, bw, bh);
      }

      // Hit animation white flash
      if (block.hitAnim > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + block.hitAnim * 0.5})`;
        ctx.fill();
      } else if (block.health === 7) {
        // Quantum Portal (Swirling neon violet vortex)
        const vortexGrad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
        vortexGrad.addColorStop(0, '#7928ca');
        vortexGrad.addColorStop(0.5, '#00f7ff');
        vortexGrad.addColorStop(1, '#ff007a');
        ctx.fillStyle = vortexGrad;
        ctx.fill();
      } else if (block.health === 8) {
        // EMP Reactor (Pulsing amber reactor)
        const pulse = Math.sin(this.animTick * 4) * 0.2 + 0.8;
        const empGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        empGrad.addColorStop(0, '#ff3b00');
        empGrad.addColorStop(1, `rgba(255, 150, 0, ${pulse})`);
        ctx.fillStyle = empGrad;
        ctx.fill();
      } else {
        const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
        grad.addColorStop(0, config.bg[0]);
        grad.addColorStop(1, config.bg[1]);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Neon cyber border
      ctx.strokeStyle = config.border;
      ctx.shadowColor = config.border;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Top specular highlight
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx + 4, by + 3, bw - 8, bh * 0.3, r / 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
      }

      // Label & Badges
      ctx.shadowBlur = 0;
      ctx.fillStyle = config.text;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (block.health === 7) {
        // Quantum Portal Icon
        ctx.font = `${Math.floor(bh * 0.55)}px sans-serif`;
        ctx.fillText('🌀', bx + bw / 2, by + bh / 2 + 1);
      } else if (block.health === 8) {
        // Dynamic EMP countdown badge
        const count = block.counter !== undefined ? block.counter : 3;
        ctx.font = `900 ${Math.floor(bh * 0.48)}px 'Orbitron', monospace`;
        ctx.fillStyle = count === 1 ? '#ff0055' : '#ffffff';
        ctx.fillText(`[${count}]`, bx + bw / 2, by + bh / 2 + 1);
      } else {
        ctx.font = `900 ${Math.floor(bh * 0.52)}px 'Orbitron', 'Chakra Petch', monospace`;
        ctx.fillText(block.initialHealth === 6 ? '∞' : String(block.health), bx + bw / 2, by + bh / 2 + 1);
      }

      ctx.restore();
    });

    // 6. Paddle Rendering
    const px = paddle.x - paddle.width / 2;
    const py = paddle.y;
    const pw = paddle.width;
    const ph = paddle.height;
    const pr = ph / 2;

    ctx.save();
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 20;

    // Base paddle body
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(px, py, pw, ph, pr);
    } else {
      ctx.rect(px, py, pw, ph);
    }

    const padGrad = ctx.createLinearGradient(px, py, px, py + ph);
    padGrad.addColorStop(0, '#59f7ff');
    padGrad.addColorStop(0.3, '#0055ff');
    padGrad.addColorStop(0.7, '#6700ff');
    padGrad.addColorStop(1, '#00f7ff');
    ctx.fillStyle = padGrad;
    ctx.fill();

    // High-contrast cyber border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Top Specular Light Bar
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(px + 12, py + 3, pw - 24, ph * 0.35, pr / 2);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fill();

    // Glowing core reactor slot
    const coreW = pw * 0.35;
    const coreX = paddle.x - coreW / 2;
    const coreH = ph * 0.3;
    const coreY = py + ph * 0.45;
    ctx.fillStyle = '#00f7ff';
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 12;
    ctx.fillRect(coreX, coreY, coreW, coreH);

    ctx.restore();

    // 7. Render All Active Balls
    for (const b of ballList) {
      // Ball Motion Trail
      if (b.isActive && b.trail && b.trail.length > 0) {
        ctx.save();
        for (let i = 0; i < b.trail.length; i++) {
          const t = b.trail[i];
          ctx.globalAlpha = t.alpha * 0.45;
          ctx.fillStyle = b.isMega ? '#ffd700' : '#00f7ff';
          ctx.shadowColor = b.isMega ? '#ff0055' : '#00f7ff';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Ball Core
      const bx = b.x;
      const by = b.y;
      const br = b.radius;

      ctx.save();
      ctx.shadowColor = b.isMega ? '#ffd700' : '#00f7ff';
      ctx.shadowBlur = b.isMega ? 32 : 24;

      const ballGrad = ctx.createRadialGradient(
        bx - br * 0.35,
        by - br * 0.35,
        br * 0.1,
        bx,
        by,
        br
      );

      if (b.isMega) {
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.3, '#fff275');
        ballGrad.addColorStop(0.7, '#ff5500');
        ballGrad.addColorStop(1, '#ff0055');
      } else {
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.25, '#7df9ff');
        ballGrad.addColorStop(0.7, '#0048ff');
        ballGrad.addColorStop(1, '#00f7ff');
      }

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow rim
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.restore();
    }
  }
}
