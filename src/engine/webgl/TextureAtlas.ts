import { BLOCK_WIDTH, BLOCK_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, BALL_RADIUS } from '../../constants/game';
import { drawBlockWithPreset } from '../draw/blockDrawers';
import { drawPaddleWithPreset } from '../draw/paddleDrawers';
import { drawBallWithPreset } from '../draw/ballDrawers';
import { renderCustomPowerUpIcon } from '../draw/powerUpIconDrawers';
import { drawBlackHoleFloor } from '../draw/blackHoleDrawers';
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

    // 1. Bake Blocks (HP 1-5, Titanium 6, Portals 7, EMP 8)
    const blockTypes = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const hp of blockTypes) {
      placeItem(`block_${hp}`, BLOCK_WIDTH, BLOCK_HEIGHT, (c, x, y) => {
        drawBlockWithPreset(
          c,
          {
            index: 0,
            col: 0,
            row: 0,
            x,
            y,
            w: BLOCK_WIDTH,
            h: BLOCK_HEIGHT,
            health: hp,
            initialHealth: hp,
            isDead: false,
            hitAnim: 0,
          },
          1
        );
      });
    }

    // 2. Bake Paddle Tiers (1, 2, 3)
    const paddleTiers = [1, 2, 3] as const;
    for (const tier of paddleTiers) {
      placeItem(`paddle_t${tier}`, PADDLE_WIDTH, PADDLE_HEIGHT, (c, x, y) => {
        drawPaddleWithPreset(
          c,
          {
            x: x + PADDLE_WIDTH / 2,
            y,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            vx: 0,
            targetX: x + PADDLE_WIDTH / 2,
          },
          1,
          { tier }
        );
      });
    }

    // 3. Bake Balls (cyan, fire, void, matrix, gold, mega)
    const ballSkins = ['cyan', 'fire', 'void', 'matrix', 'gold'];
    const ballDiam = Math.ceil(BALL_RADIUS * 2.4);
    for (const skin of ballSkins) {
      placeItem(`ball_${skin}`, ballDiam, ballDiam, (c, x, y) => {
        drawBallWithPreset(
          c,
          {
            x: x + ballDiam / 2,
            y: y + ballDiam / 2,
            radius: BALL_RADIUS,
            isMega: false,
          },
          1
        );
      });
    }
    // Mega Ball
    placeItem('ball_mega', ballDiam, ballDiam, (c, x, y) => {
      drawBallWithPreset(
        c,
        {
          x: x + ballDiam / 2,
          y: y + ballDiam / 2,
          radius: BALL_RADIUS * 1.3,
          isMega: true,
        },
        1,
        { isMega: true }
      );
    });

    // 4. Bake Power-Up Drop Icons
    const puTypes: PowerUpType[] = ['multiball', 'megaball', 'laser', 'slowmo', 'shield', 'expand'];
    for (const pt of puTypes) {
      placeItem(`pu_${pt}`, 32, 32, (c, x, y) => {
        c.translate(x + 16, y + 16);
        renderCustomPowerUpIcon(c, pt, 14, '#ffffff');
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

    // 7. Cosmic Black Hole Singularity Floor
    placeItem('blackhole_floor', 256, 48, (c, x, y) => {
      drawBlackHoleFloor(c, 256, 48, 0);
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
