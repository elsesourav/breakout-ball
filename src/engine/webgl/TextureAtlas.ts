import { BLOCK_WIDTH, BLOCK_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS } from '../../constants/game';
import { drawBlockWithPreset } from '../draw/blockDrawers';
import { drawPaddleWithPreset } from '../draw/paddleDrawers';
import { drawBallWithPreset } from '../draw/ballDrawers';
import { renderCustomPowerUpIcon } from '../draw/powerUpIconDrawers';
import { PowerUpType } from '../powerUpTypes';

export interface UVRect {
  u0: number;
  v0: number;
  u1: number;
  v1: number;
  pixelW: number;
  pixelH: number;
}

export class TextureAtlas {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  public texture: WebGLTexture | null = null;
  private uvs: Map<string, UVRect> = new Map();
  public readonly ATLAS_WIDTH = 1024;
  public readonly ATLAS_HEIGHT = 1024;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl;
    this.buildAtlas();
  }

  private buildAtlas() {
    const gl = this.gl;
    const canvas = document.createElement('canvas');
    canvas.width = this.ATLAS_WIDTH;
    canvas.height = this.ATLAS_HEIGHT;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Failed to create atlas 2d context');

    ctx.clearRect(0, 0, this.ATLAS_WIDTH, this.ATLAS_HEIGHT);

    let curX = 4;
    let curY = 4;
    let rowMaxH = 0;

    const placeItem = (
      name: string,
      width: number,
      height: number,
      drawFn: (ctx: CanvasRenderingContext2D, x: number, y: number) => void
    ) => {
      const pad = 4;
      if (curX + width + pad > this.ATLAS_WIDTH) {
        curX = 4;
        curY += rowMaxH + pad;
        rowMaxH = 0;
      }
      if (curY + height + pad > this.ATLAS_HEIGHT) {
        console.warn(`TextureAtlas overflow placing ${name}`);
        return;
      }

      ctx.save();
      drawFn(ctx, curX, curY);
      ctx.restore();

      const u0 = curX / this.ATLAS_WIDTH;
      const v0 = curY / this.ATLAS_HEIGHT;
      const u1 = (curX + width) / this.ATLAS_WIDTH;
      const v1 = (curY + height) / this.ATLAS_HEIGHT;

      this.uvs.set(name, {
        u0,
        v0,
        u1,
        v1,
        pixelW: width,
        pixelH: height,
      });

      curX += width + pad;
      rowMaxH = Math.max(rowMaxH, height);
    };

    // 1. Bake Blocks (HP 1-5, Titanium 6, EMP 8, and Portals 7 with Pair Themes 1-4)
    const standardBlockTypes = [1, 2, 3, 4, 5, 6, 8];
    for (const hp of standardBlockTypes) {
      placeItem(`block_${hp}`, BLOCK_WIDTH, BLOCK_HEIGHT, (c, x, y) => {
        c.save();
        c.translate(x, y);
        drawBlockWithPreset(
          c,
          {
            index: 0,
            col: 0,
            row: 0,
            x: 0,
            y: 0,
            w: BLOCK_WIDTH,
            h: BLOCK_HEIGHT,
            health: hp,
            initialHealth: hp,
            isDead: false,
            hitAnim: 0,
          },
          1
        );
        c.restore();
      });
    }

    // Bake all 4 Quantum Portal Pair Themes (1: Cyan, 2: Magenta, 3: Amber, 4: Emerald)
    for (let pairId = 1; pairId <= 4; pairId++) {
      placeItem(`block_7_p${pairId}`, BLOCK_WIDTH, BLOCK_HEIGHT, (c, x, y) => {
        c.save();
        c.translate(x, y);
        drawBlockWithPreset(
          c,
          {
            index: 0,
            col: 0,
            row: 0,
            x: 0,
            y: 0,
            w: BLOCK_WIDTH,
            h: BLOCK_HEIGHT,
            health: 7,
            initialHealth: 7,
            isDead: false,
            hitAnim: 0,
            portalPairId: pairId,
          },
          1
        );
        c.restore();
      });
    }
    // Also place default block_7 as alias
    placeItem(`block_7`, BLOCK_WIDTH, BLOCK_HEIGHT, (c, x, y) => {
      c.save();
      c.translate(x, y);
      drawBlockWithPreset(
        c,
        {
          index: 0,
          col: 0,
          row: 0,
          x: 0,
          y: 0,
          w: BLOCK_WIDTH,
          h: BLOCK_HEIGHT,
          health: 7,
          initialHealth: 7,
          isDead: false,
          hitAnim: 0,
          portalPairId: 1,
        },
        1
      );
      c.restore();
    });

    // 2. Bake Paddle Tiers (1, 2, 3)
    const paddleTiers = [1, 2, 3] as const;
    const padMargin = 16;
    const padSlotW = PADDLE_WIDTH + padMargin * 2;
    const padSlotH = PADDLE_HEIGHT + padMargin * 2;
    for (const tier of paddleTiers) {
      placeItem(`paddle_t${tier}`, padSlotW, padSlotH, (c, x, y) => {
        c.save();
        c.translate(x + padMargin, y + padMargin);
        drawPaddleWithPreset(
          c,
          {
            x: PADDLE_WIDTH / 2,
            y: 0,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            vx: 0,
            targetX: PADDLE_WIDTH / 2,
          },
          1,
          { tier }
        );
        c.restore();
      });
    }

    // 3. Bake Balls (cyan, fire, void, matrix, gold, mega)
    const ballSkins = ['cyan', 'fire', 'void', 'matrix', 'gold'];
    const ballMargin = 12;
    const ballSlotSize = Math.ceil(BALL_RADIUS * 2 + ballMargin * 2);
    for (const skin of ballSkins) {
      placeItem(`ball_${skin}`, ballSlotSize, ballSlotSize, (c, x, y) => {
        c.save();
        c.translate(x + ballSlotSize / 2, y + ballSlotSize / 2);
        drawBallWithPreset(
          c,
          {
            x: 0,
            y: 0,
            radius: BALL_RADIUS,
            isMega: false,
          },
          1
        );
        c.restore();
      });
    }
    // Mega Ball
    placeItem('ball_mega', ballSlotSize, ballSlotSize, (c, x, y) => {
      c.save();
      c.translate(x + ballSlotSize / 2, y + ballSlotSize / 2);
      drawBallWithPreset(
        c,
        {
          x: 0,
          y: 0,
          radius: BALL_RADIUS * 1.3,
          isMega: true,
        },
        1,
        { isMega: true }
      );
      c.restore();
    });

    // 4. Bake Power-Up Drop Icons
    const puTypes: PowerUpType[] = ['multiball', 'megaball', 'laser', 'slowmo', 'shield', 'expand'];
    for (const pt of puTypes) {
      placeItem(`pu_${pt}`, 32, 32, (c, x, y) => {
        c.save();
        c.translate(x + 16, y + 16);
        renderCustomPowerUpIcon(c, pt, 14, '#ffffff');
        c.restore();
      });
    }

    // 5. White rectangular patch for solid geometry (laser bolts, forcefield lines, chunks)
    placeItem('white_rect', 16, 16, (c, x, y) => {
      c.fillStyle = '#ffffff';
      c.fillRect(x, y, 16, 16);
    });

    // 6. Shockwave ring patch
    placeItem('shockwave_ring', 64, 64, (c, x, y) => {
      c.strokeStyle = '#ffffff';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(x + 32, y + 32, 28, 0, Math.PI * 2);
      c.stroke();
    });

    // 7. Trajectory Matrix Guideline Sprites (8-Ball Pool Style)
    // 7.1. Antialiased glowing guideline dot
    placeItem('guideline_dot', 16, 16, (c, x, y) => {
      const grad = c.createRadialGradient(x + 8, y + 8, 1, x + 8, y + 8, 7);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      c.fillStyle = grad;
      c.beginPath();
      c.arc(x + 8, y + 8, 7, 0, Math.PI * 2);
      c.fill();
    });

    // 7.2. Impact target reticle ring on paddle (Concentric high-contrast landing marker)
    placeItem('guideline_reticle', 32, 32, (c, x, y) => {
      // Outer targeting ring
      c.strokeStyle = '#ffffff';
      c.lineWidth = 2.0;
      c.beginPath();
      c.arc(x + 16, y + 16, 12, 0, Math.PI * 2);
      c.stroke();

      // Middle inner ring
      c.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(x + 16, y + 16, 6, 0, Math.PI * 2);
      c.stroke();

      // Center bullseye landing dot
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(x + 16, y + 16, 3, 0, Math.PI * 2);
      c.fill();
    });

    // 7.3. Directional arrow pointer for outgoing deflection
    placeItem('guideline_arrow', 24, 24, (c, x, y) => {
      c.save();
      c.translate(x + 12, y + 12);
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.moveTo(0, -9);
      c.lineTo(7, 6);
      c.lineTo(0, 3);
      c.lineTo(-7, 6);
      c.closePath();
      c.fill();
      c.restore();
    });

    // 5. Upload atlas canvas to GPU WebGL Texture
    const tex = gl.createTexture();
    if (!tex) throw new Error('Failed to create WebGL atlas texture');
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.texture = tex;
    console.log(`⚡ GPU Texture Atlas generated (${this.ATLAS_WIDTH}x${this.ATLAS_HEIGHT}). Sprites baked: ${this.uvs.size}`);
  }

  public getUV(name: string): UVRect {
    const uv = this.uvs.get(name);
    if (!uv) {
      // Fallback to block_1
      return this.uvs.get('block_1') || { u0: 0, v0: 0, u1: 1, v1: 1, pixelW: 48, pixelH: 20 };
    }
    return uv;
  }
}
