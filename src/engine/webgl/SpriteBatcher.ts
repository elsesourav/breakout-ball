import { ProgramInfo } from './ShaderManager';

export class SpriteBatcher {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private maxSprites: number;
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;

  // 8 floats per vertex: x, y, u, v, r, g, b, a
  // 4 vertices per quad = 32 floats per sprite
  private vertexData: Float32Array;
  private spriteCount: number = 0;
  private currentProgram: ProgramInfo | null = null;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, maxSprites = 2048) {
    this.gl = gl;
    this.maxSprites = maxSprites;
    this.vertexData = new Float32Array(maxSprites * 32);

    this.initBuffers();
  }

  private initBuffers() {
    const gl = this.gl;

    // Dynamic vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);

    // Static index buffer: 6 indices per sprite (two triangles)
    const indices = new Uint16Array(this.maxSprites * 6);
    for (let i = 0; i < this.maxSprites; i++) {
      const vOffset = i * 4;
      const iOffset = i * 6;
      indices[iOffset + 0] = vOffset + 0;
      indices[iOffset + 1] = vOffset + 1;
      indices[iOffset + 2] = vOffset + 2;
      indices[iOffset + 3] = vOffset + 0;
      indices[iOffset + 4] = vOffset + 2;
      indices[iOffset + 5] = vOffset + 3;
    }

    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  public begin(
    programInfo: ProgramInfo,
    texture: WebGLTexture,
    viewW: number,
    viewH: number
  ) {
    this.currentProgram = programInfo;
    this.spriteCount = 0;

    const gl = this.gl;
    gl.useProgram(programInfo.program);

    if (programInfo.uniforms.uResolution) {
      gl.uniform2f(programInfo.uniforms.uResolution, viewW, viewH);
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (programInfo.uniforms.uTexture) {
      gl.uniform1i(programInfo.uniforms.uTexture, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    const stride = 8 * 4; // 8 floats * 4 bytes = 32 bytes
    const posLoc = programInfo.attribs.aPosition;
    const uvLoc = programInfo.attribs.aTexCoord;
    const colLoc = programInfo.attribs.aColor;

    if (posLoc !== undefined) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);
    }
    if (uvLoc !== undefined) {
      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 2 * 4);
    }
    if (colLoc !== undefined) {
      gl.enableVertexAttribArray(colLoc);
      gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, stride, 4 * 4);
    }
  }

  public pushSprite(
    x: number,
    y: number,
    w: number,
    h: number,
    u0: number,
    v0: number,
    u1: number,
    v1: number,
    r = 1.0,
    g = 1.0,
    b = 1.0,
    a = 1.0,
    angle = 0
  ) {
    if (this.spriteCount >= this.maxSprites) {
      this.flush();
    }

    let x0 = x;
    let y0 = y;
    let x1 = x + w;
    let y1 = y;
    let x2 = x + w;
    let y2 = y + h;
    let x3 = x;
    let y3 = y + h;

    if (angle !== 0) {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const rotate = (px: number, py: number) => {
        const dx = px - cx;
        const dy = py - cy;
        return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
      };

      [x0, y0] = rotate(x0, y0);
      [x1, y1] = rotate(x1, y1);
      [x2, y2] = rotate(x2, y2);
      [x3, y3] = rotate(x3, y3);
    }

    const offset = this.spriteCount * 32;
    const v = this.vertexData;

    // V0: Top-Left
    v[offset + 0] = x0; v[offset + 1] = y0;
    v[offset + 2] = u0; v[offset + 3] = v0;
    v[offset + 4] = r; v[offset + 5] = g; v[offset + 6] = b; v[offset + 7] = a;

    // V1: Top-Right
    v[offset + 8] = x1; v[offset + 9] = y1;
    v[offset + 10] = u1; v[offset + 11] = v0;
    v[offset + 12] = r; v[offset + 13] = g; v[offset + 14] = b; v[offset + 15] = a;

    // V2: Bottom-Right
    v[offset + 16] = x2; v[offset + 17] = y2;
    v[offset + 18] = u1; v[offset + 19] = v1;
    v[offset + 20] = r; v[offset + 21] = g; v[offset + 22] = b; v[offset + 23] = a;

    // V3: Bottom-Left
    v[offset + 24] = x3; v[offset + 25] = y3;
    v[offset + 26] = u0; v[offset + 27] = v1;
    v[offset + 28] = r; v[offset + 29] = g; v[offset + 30] = b; v[offset + 31] = a;

    this.spriteCount++;
  }

  public flush() {
    if (this.spriteCount === 0) return;
    const gl = this.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      this.vertexData.subarray(0, this.spriteCount * 32)
    );

    gl.drawElements(gl.TRIANGLES, this.spriteCount * 6, gl.UNSIGNED_SHORT, 0);
    this.spriteCount = 0;
  }
}
