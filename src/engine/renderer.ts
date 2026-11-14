import { BallState, PaddleState, BlockEngineState } from './types';
import { ParticleSystem } from './particles';
import { BLOCK_COLORS } from '../constants/game';
import { PowerUpManager } from './powerUps';

const BALL_SKIN_PALETTES: Record<string, { c1: string; c2: string; c3: string; glow: string }> = {
  cyan: { c1: '#ffffff', c2: '#7df9ff', c3: '#00f7ff', glow: '#00f7ff' },
  fire: { c1: '#ffffff', c2: '#ff9900', c3: '#ff0055', glow: '#ff5500' },
  void: { c1: '#ffffff', c2: '#e879f9', c3: '#7c3aed', glow: '#c084fc' },
  matrix: { c1: '#ffffff', c2: '#6ee7b7', c3: '#059669', glow: '#10b981' },
  gold: { c1: '#ffffff', c2: '#fef08a', c3: '#eab308', glow: '#ffd700' },
};

export class GameRenderer {
  private width: number;
  private height: number;
  private animTick = 0;
  private shakeIntensity = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public triggerShake(intensity: number) {
    this.shakeIntensity = Math.min(22, this.shakeIntensity + intensity);
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
    powerUps?: PowerUpManager,
    ballSkin: string = 'cyan'
  ) {
    const w = this.width;
    const h = this.height;
    this.animTick += 0.05;

    const ballList = Array.isArray(balls) ? balls : [balls];

    // 1. Clear & Cyber Radial Backdrop
    ctx.clearRect(0, 0, w, h);

    // Screen Shake Camera Translation
    ctx.save();
    if (this.shakeIntensity > 0.1) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
      this.shakeIntensity *= 0.88;
      if (this.shakeIntensity < 0.1) this.shakeIntensity = 0;
    }

    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, h);
    bgGrad.addColorStop(0, '#0a0d2c');
    bgGrad.addColorStop(0.6, '#040616');
    bgGrad.addColorStop(1, '#01020a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Perspective cyber grid lines
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

    // 5. 3D Tactile Blocks Rendering
    const padding = 3;
    blocks.forEach((block) => {
      if (block.isDead || block.health <= 0) return;
      const config = BLOCK_COLORS[block.health] || BLOCK_COLORS[1];

      const bx = block.x + padding;
      const by = block.y + padding;
      const bw = block.w - padding * 2;
      const bh = block.h - padding * 2;
      const depth = Math.max(4, Math.round(bh * 0.14)); // 3D extrusion thickness
      const topFaceH = bh - depth;
      const r = Math.min(bw, topFaceH) * 0.22;

      ctx.save();

      // Hit animation white flash
      if (block.hitAnim > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + block.hitAnim * 0.5})`;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, r);
        else ctx.rect(bx, by, bw, bh);
        ctx.fill();
        ctx.restore();
        return;
      }

      // 3D Drop Shadow on Floor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx + 2, by + depth + 2, bw, topFaceH, r);
      else ctx.rect(bx + 2, by + depth + 2, bw, topFaceH);
      ctx.fill();

      // 3D Extruded Lower Base & Flanks (Thickness)
      const baseGrad = ctx.createLinearGradient(bx, by + topFaceH, bx, by + bh);
      baseGrad.addColorStop(0, '#0a0d18');
      baseGrad.addColorStop(1, '#020308');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by + depth * 0.6, bw, topFaceH + depth * 0.4, r);
      else ctx.rect(bx, by + depth * 0.6, bw, topFaceH + depth * 0.4);
      ctx.fill();

      // Extruded side shadow bevel
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(bx + bw - 4, by + depth, 4, topFaceH);

      // Main 3D Front Face
      if (block.health === 6) {
        // TYPE 6: 3D Heavy Titanium Ingot with Steel Screws
        const steelGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
        steelGrad.addColorStop(0, '#e2e8f0');
        steelGrad.addColorStop(0.35, '#94a3b8');
        steelGrad.addColorStop(0.7, '#475569');
        steelGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = steelGrad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
        else ctx.rect(bx, by, bw, topFaceH);
        ctx.fill();

        // 4 Corner 3D Rivets/Bolts
        const boltOffset = 7;
        const boltR = 2.5;
        const bolts = [
          [bx + boltOffset, by + boltOffset],
          [bx + bw - boltOffset, by + boltOffset],
          [bx + boltOffset, by + topFaceH - boltOffset],
          [bx + bw - boltOffset, by + topFaceH - boltOffset],
        ];
        bolts.forEach(([cx, cy]) => {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(cx, cy, boltR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx - 0.7, cy - 0.7, boltR * 0.4, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (block.health === 7) {
        // TYPE 7: 3D Sunken Quantum Portal
        const portalChassis = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
        portalChassis.addColorStop(0, '#2e0854');
        portalChassis.addColorStop(0.5, '#120224');
        portalChassis.addColorStop(1, '#05000a');
        ctx.fillStyle = portalChassis;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
        else ctx.rect(bx, by, bw, topFaceH);
        ctx.fill();

        // Swirling vortex inside
        const pCenterX = bx + bw / 2;
        const pCenterY = by + topFaceH / 2;
        const pRadius = Math.min(bw, topFaceH) * 0.4;
        const vortexGrad = ctx.createRadialGradient(pCenterX, pCenterY, 2, pCenterX, pCenterY, pRadius);
        vortexGrad.addColorStop(0, '#00f7ff');
        vortexGrad.addColorStop(0.4, '#7928ca');
        vortexGrad.addColorStop(1, 'rgba(255, 0, 128, 0.2)');
        ctx.fillStyle = vortexGrad;
        ctx.beginPath();
        ctx.arc(pCenterX, pCenterY, pRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (block.health === 8) {
        // TYPE 8: 3D Pulsing Hazard EMP Reactor
        const pulse = Math.sin(this.animTick * 4) * 0.25 + 0.75;
        const empGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
        empGrad.addColorStop(0, '#ff7700');
        empGrad.addColorStop(0.5, `rgba(255, 50, 0, ${pulse})`);
        empGrad.addColorStop(1, '#4a0800');
        ctx.fillStyle = empGrad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
        else ctx.rect(bx, by, bw, topFaceH);
        ctx.fill();

        // Angled Caution Hazard Stripes
        ctx.save();
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
        else ctx.rect(bx, by, bw, topFaceH);
        ctx.clip();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.lineWidth = Math.max(2.5, bw * 0.08);
        const step = Math.max(6, topFaceH * 0.55);
        for (let sx = -topFaceH; sx < bw + topFaceH; sx += step) {
          ctx.beginPath();
          ctx.moveTo(bx + sx, by + topFaceH);
          ctx.lineTo(bx + sx + topFaceH, by);
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // STANDARD 1-5 HP BLOCKS: 3D High-Gloss Cyber Crystal
        const faceGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH);
        faceGrad.addColorStop(0, config.bg[0]);
        faceGrad.addColorStop(0.55, config.bg[1]);
        faceGrad.addColorStop(1, '#050c18');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
        else ctx.rect(bx, by, bw, topFaceH);
        ctx.fill();
      }

      // 3D Damage Fracture Cracks on Wounded Blocks
      if (block.health < block.initialHealth && block.initialHealth > 1) {
        const damageRatio = (block.initialHealth - block.health) / block.initialHealth;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.22, by + 2);
        ctx.lineTo(bx + bw * 0.38, by + topFaceH * 0.45);
        ctx.lineTo(bx + bw * 0.55, by + topFaceH * 0.52);
        ctx.lineTo(bx + bw * 0.76, by + topFaceH - 2);
        ctx.stroke();

        if (damageRatio > 0.4) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.moveTo(bx + bw * 0.38, by + topFaceH * 0.45);
          ctx.lineTo(bx + bw * 0.16, by + topFaceH * 0.8);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(bx + bw * 0.55, by + topFaceH * 0.52);
          ctx.lineTo(bx + bw * 0.84, by + topFaceH * 0.28);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3D Top Bevel Specular Sheen (Curved highlight reflecting overhead lights)
      const sheenGrad = ctx.createLinearGradient(bx, by, bx, by + topFaceH * 0.45);
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      sheenGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.2)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = sheenGrad;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(bx + 3, by + 2, bw - 6, topFaceH * 0.4, r * 0.6);
      } else {
        ctx.rect(bx + 3, by + 2, bw - 6, topFaceH * 0.4);
      }
      ctx.fill();

      // 3D Inner Bevel Highlight & Shadow Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bx + r, by + 1.5);
      ctx.lineTo(bx + bw - r, by + 1.5);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.moveTo(bx + 2, by + topFaceH - 1);
      ctx.lineTo(bx + bw - 2, by + topFaceH - 1);
      ctx.stroke();

      // Outer Glowing Cyber Rim
      ctx.strokeStyle = config.border;
      ctx.shadowColor = config.border;
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, topFaceH, r);
      else ctx.rect(bx, by, bw, topFaceH);
      ctx.stroke();

      // 3D Embossed Label / Number
      const cx = bx + bw / 2;
      const cy = by + topFaceH / 2;
      ctx.shadowBlur = 0;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let labelText = String(block.health);
      if (block.health === 6) labelText = '∞';
      else if (block.health === 7) labelText = '🌀';
      else if (block.health === 8) {
        const count = block.counter !== undefined ? block.counter : 3;
        labelText = `[${count}]`;
      }

      ctx.font =
        block.health === 7
          ? `${Math.floor(topFaceH * 0.52)}px sans-serif`
          : block.health === 8
          ? `900 ${Math.floor(topFaceH * 0.48)}px 'Orbitron', monospace`
          : `900 ${Math.floor(topFaceH * 0.54)}px 'Orbitron', 'Chakra Petch', monospace`;

      // 3D Drop shadow for stamped text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(labelText, cx, cy + 2);

      // 3D Top specular highlight for stamped text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(labelText, cx, cy - 1);

      // Main Text Fill
      ctx.fillStyle = block.health === 8 && block.counter === 1 ? '#ff0055' : config.text;
      ctx.fillText(labelText, cx, cy);

      ctx.restore();
    });

    // 6. 3D Paddle Rendering
    const px = paddle.x - paddle.width / 2;
    const py = paddle.y;
    const pw = paddle.width;
    const ph = paddle.height;
    const pr = ph / 2;

    ctx.save();
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 20;

    // 3D Paddle Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py + 6, pw, ph, pr);
    else ctx.rect(px, py + 6, pw, ph);
    ctx.fill();

    // Base paddle body with 3D cylindrical gradient
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px, py, pw, ph, pr);
    else ctx.rect(px, py, pw, ph);

    const padGrad = ctx.createLinearGradient(px, py, px, py + ph);
    padGrad.addColorStop(0, '#59f7ff');
    padGrad.addColorStop(0.3, '#0055ff');
    padGrad.addColorStop(0.7, '#6700ff');
    padGrad.addColorStop(1, '#001a40');
    ctx.fillStyle = padGrad;
    ctx.fill();

    // High-contrast 3D border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Top Specular Light Bar
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(px + 12, py + 3, pw - 24, ph * 0.35, pr / 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Glowing core reactor slot
    const coreW = pw * 0.35;
    const coreX = paddle.x - coreW / 2;
    const coreH = ph * 0.3;
    const coreY = py + ph * 0.45;
    ctx.fillStyle = '#00f7ff';
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 14;
    ctx.fillRect(coreX, coreY, coreW, coreH);
    ctx.restore();

    // 7. Render All Active Balls with 3D Shading
    const palette = BALL_SKIN_PALETTES[ballSkin] || BALL_SKIN_PALETTES.cyan;
    for (const b of ballList) {
      if (b.isActive && b.trail && b.trail.length > 0) {
        ctx.save();
        for (let i = 0; i < b.trail.length; i++) {
          const t = b.trail[i];
          ctx.globalAlpha = t.alpha * 0.45;
          ctx.fillStyle = b.isMega ? '#ffd700' : palette.glow;
          ctx.shadowColor = b.isMega ? '#ff0055' : palette.glow;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      const bx = b.x;
      const by = b.y;
      const br = b.radius;

      ctx.save();
      ctx.shadowColor = b.isMega ? '#ffd700' : palette.glow;
      ctx.shadowBlur = b.isMega ? 32 : 24;

      const ballGrad = ctx.createRadialGradient(
        bx - br * 0.38,
        by - br * 0.38,
        br * 0.08,
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
        ballGrad.addColorStop(0, palette.c1);
        ballGrad.addColorStop(0.35, palette.c2);
        ballGrad.addColorStop(1, palette.c3);
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
    ctx.restore();
  }
}
