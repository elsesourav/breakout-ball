import { ProgramInfo } from './ShaderManager';
import { Star, Particle } from '../types';

export class GLParticleSystem {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private buffer: WebGLBuffer | null = null;
  private vertexData: Float32Array;
  private readonly MAX_POINTS = 2048;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl;
    // 7 floats per particle: x, y, size, r, g, b, a
    this.vertexData = new Float32Array(this.MAX_POINTS * 7);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);
  }

  public renderPoints(
    programInfo: ProgramInfo,
    points: { x: number; y: number; size: number; r: number; g: number; b: number; a: number }[],
    viewW: number,
    viewH: number
  ) {
    if (points.length === 0) return;
    const gl = this.gl;
    const count = Math.min(points.length, this.MAX_POINTS);

    const v = this.vertexData;
    for (let i = 0; i < count; i++) {
      const p = points[i];
      const offset = i * 7;
      v[offset + 0] = p.x;
      v[offset + 1] = p.y;
      v[offset + 2] = p.size;
      v[offset + 3] = p.r;
      v[offset + 4] = p.g;
      v[offset + 5] = p.b;
      v[offset + 6] = p.a;
    }

    gl.useProgram(programInfo.program);
    if (programInfo.uniforms.uResolution) {
      gl.uniform2f(programInfo.uniforms.uResolution, viewW, viewH);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, v.subarray(0, count * 7));

    const stride = 7 * 4;
    const posLoc = programInfo.attribs.aPosition;
    const sizeLoc = programInfo.attribs.aSize;
    const colLoc = programInfo.attribs.aColor;

    if (posLoc !== undefined) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);
    }
    if (sizeLoc !== undefined) {
      gl.enableVertexAttribArray(sizeLoc);
      gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, stride, 2 * 4);
    }
    if (colLoc !== undefined) {
      gl.enableVertexAttribArray(colLoc);
      gl.vertexAttribPointer(colLoc, 4, gl.FLOAT, false, stride, 3 * 4);
    }

    gl.drawArrays(gl.POINTS, 0, count);
  }
}
