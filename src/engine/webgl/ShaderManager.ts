export interface ProgramInfo {
  program: WebGLProgram;
  attribs: Record<string, number>;
  uniforms: Record<string, WebGLUniformLocation>;
}

export class ShaderManager {
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private programs: Map<string, ProgramInfo> = new Map();

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    this.gl = gl;
    this.initDefaultShaders();
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create WebGL shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${info}\nSource:\n${source}`);
    }
    return shader;
  }

  public createProgram(name: string, vsSource: string, fsSource: string): ProgramInfo {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create WebGL program');

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Program link error: ${info}`);
    }

    // Cache active attributes
    const attribs: Record<string, number> = {};
    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; i++) {
      const info = gl.getActiveAttrib(program, i);
      if (info) attribs[info.name] = gl.getAttribLocation(program, info.name);
    }

    // Cache active uniforms
    const uniforms: Record<string, WebGLUniformLocation> = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(program, i);
      if (info) {
        const loc = gl.getUniformLocation(program, info.name);
        if (loc) uniforms[info.name] = loc;
      }
    }

    const pInfo: ProgramInfo = { program, attribs, uniforms };
    this.programs.set(name, pInfo);
    return pInfo;
  }

  public getProgram(name: string): ProgramInfo {
    const p = this.programs.get(name);
    if (!p) throw new Error(`Shader program '${name}' not found`);
    return p;
  }

  private initDefaultShaders() {
    // 1. Batched Textured Sprites (Blocks, Paddle, Ball, Power-Ups)
    const spriteVS = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      attribute vec4 aColor;
      uniform vec2 uResolution;
      varying vec2 vTexCoord;
      varying vec4 vColor;
      void main() {
        vec2 zeroToOne = aPosition / uResolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        vTexCoord = aTexCoord;
        vColor = aColor;
      }
    `;
    const spriteFS = `
      precision mediump float;
      varying vec2 vTexCoord;
      varying vec4 vColor;
      uniform sampler2D uTexture;
      void main() {
        vec4 tex = texture2D(uTexture, vTexCoord);
        gl_FragColor = tex * vColor;
      }
    `;
    this.createProgram('sprite', spriteVS, spriteFS);

    // 2. High-Performance GPU Point Particles (Stars, Sparks, Trails)
    const particleVS = `
      attribute vec2 aPosition;
      attribute float aSize;
      attribute vec4 aColor;
      uniform vec2 uResolution;
      varying vec4 vColor;
      void main() {
        vec2 zeroToOne = aPosition / uResolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
        gl_PointSize = aSize;
        vColor = aColor;
      }
    `;
    const particleFS = `
      precision mediump float;
      varying vec4 vColor;
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, dist) * vColor.a;
        gl_FragColor = vec4(vColor.rgb, alpha);
      }
    `;
    this.createProgram('particle', particleVS, particleFS);

    // 3. Cyber Backdrop Quad (Zero-lag procedural gradients)
    const backdropVS = `
      attribute vec2 aPosition;
      varying vec2 vUV;
      void main() {
        vUV = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const backdropFS = `
      precision mediump float;
      varying vec2 vUV;
      void main() {
        vec3 base = vec3(3.0 / 255.0, 4.0 / 255.0, 12.0 / 255.0);
        float dTop = length(vUV - vec2(0.5, 1.0));
        float gTop = max(0.0, 1.0 - dTop / 0.55) * 0.08;
        vec3 cTop = vec3(1.0, 215.0 / 255.0, 0.0) * gTop;

        float dMid = length(vUV - vec2(0.5, 0.55));
        float gMid = max(0.0, 1.0 - dMid / 0.6) * 0.07;
        vec3 cMid = vec3(183.0 / 255.0, 115.0 / 255.0, 1.0) * gMid;

        float dBot = length(vUV - vec2(0.5, 0.0));
        float gBot = max(0.0, 1.0 - dBot / 0.45) * 0.10;
        vec3 cBot = vec3(0.0, 247.0 / 255.0, 1.0) * gBot;

        gl_FragColor = vec4(base + cTop + cMid + cBot, 1.0);
      }
    `;
    this.createProgram('backdrop', backdropVS, backdropFS);
  }
}
