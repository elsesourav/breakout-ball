const VERTEX_SHADER_SOURCE = `
attribute vec2 aPosition;   // World coordinates (0 .. canvasWidth, 0 .. canvasHeight)
attribute vec4 aColor;      // RGBA color
attribute float aSize;      // Diameter in physical pixels
uniform vec2 uResolution;   // Canvas width and height
uniform float uDpr;         // Device pixel ratio
varying vec4 vColor;

void main() {
    // 1. Convert pixel coordinates to Normalized Device Coordinates [-1.0 .. 1.0]
    vec2 zeroToOne = aPosition / uResolution;
    vec2 clipSpace = (zeroToOne * 2.0) - 1.0;
    
    // Invert Y axis for standard canvas coordinates (top-left 0,0)
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);
    
    // 2. Scale point sprite footprint by Device Pixel Ratio
    gl_PointSize = max(1.0, aSize * uDpr);
    
    // 3. Pass color to fragment shader
    vColor = aColor;
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
varying vec4 vColor;

void main() {
    // gl_PointCoord gives [0.0 .. 1.0] coordinates inside the point sprite
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // Discard pixels outside circular boundary to create smooth circular particles
    if (dist > 0.5) {
        discard;
    }
    
    // Smooth anti-aliased edge falloff
    float alpha = smoothstep(0.5, 0.38, dist) * vColor.a;
    gl_FragColor = vec4(vColor.rgb, alpha);
}
`;

export class ParticleRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private vertexBuffer: WebGLBuffer;
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uDprLoc: WebGLUniformLocation | null = null;
  private aPositionLoc: number = -1;
  private aColorLoc: number = -1;
  private aSizeLoc: number = -1;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    });

    if (!gl) {
      throw new Error('WebGL context is not supported on this device');
    }
    this.gl = gl;

    // Enable high-fidelity alpha blending
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );

    // Compile and link shaders
    this.program = this.createProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    gl.useProgram(this.program);

    // Extract shader locations
    this.aPositionLoc = gl.getAttribLocation(this.program, 'aPosition');
    this.aColorLoc = gl.getAttribLocation(this.program, 'aColor');
    this.aSizeLoc = gl.getAttribLocation(this.program, 'aSize');
    this.uResolutionLoc = gl.getUniformLocation(this.program, 'uResolution');
    this.uDprLoc = gl.getUniformLocation(this.program, 'uDpr');

    // Create persistent vertex buffer (pre-allocated 2MB buffer for high particle counts)
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create WebGL buffer');
    this.vertexBuffer = buffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 40000 * 7 * 4, gl.DYNAMIC_DRAW);

    // Setup vertex attribute pointers (Stride = 7 * 4 bytes = 28 bytes)
    const stride = 7 * Float32Array.BYTES_PER_ELEMENT;

    // aPosition: 2 floats at offset 0
    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, stride, 0);

    // aColor: 4 floats (r, g, b, a) at offset 2 * 4 = 8 bytes
    gl.enableVertexAttribArray(this.aColorLoc);
    gl.vertexAttribPointer(this.aColorLoc, 4, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

    // aSize: 1 float at offset 6 * 4 = 24 bytes
    gl.enableVertexAttribArray(this.aSizeLoc);
    gl.vertexAttribPointer(this.aSizeLoc, 1, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);
  }

  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${info}`);
    }
    return shader;
  }

  private createProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const gl = this.gl;
    const vert = this.createShader(gl.VERTEX_SHADER, vertSrc);
    const frag = this.createShader(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram();
    if (!prog) throw new Error('Failed to create program');
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error(`Program link error: ${info}`);
    }
    return prog;
  }

  public updateViewport(width: number, height: number, dpr: number): void {
    const gl = this.gl;
    gl.viewport(0, 0, width * dpr, height * dpr);
    gl.useProgram(this.program);
    if (this.uResolutionLoc) {
      gl.uniform2f(this.uResolutionLoc, width, height);
    }
    if (this.uDprLoc) {
      gl.uniform1f(this.uDprLoc, dpr);
    }
  }

  public render(vertexData: Float32Array, count: number): void {
    if (count <= 0) return;
    const gl = this.gl;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    // Direct zero-copy GPU upload from WASM memory view
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertexData);

    // Render all particles in a single draw call
    gl.drawArrays(gl.POINTS, 0, count);
  }

  public destroy(): void {
    const gl = this.gl;
    if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
    if (this.program) gl.deleteProgram(this.program);
  }
}
