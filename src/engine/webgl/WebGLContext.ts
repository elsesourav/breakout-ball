export interface GLContextResult {
  gl: WebGL2RenderingContext | WebGLRenderingContext;
  isWebGL2: boolean;
}

export function createWebGLContext(canvas: HTMLCanvasElement): GLContextResult | null {
  // 1. Try WebGL 2 first (high performance, modern hardware)
  try {
    const gl2 = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    }) as WebGL2RenderingContext | null;

    if (gl2) {
      console.log('⚡ WebGL2 High-Performance Hardware Context initialized.');
      return { gl: gl2, isWebGL2: true };
    }
  } catch (e) {
    console.warn('WebGL2 not available, trying WebGL1:', e);
  }

  // 2. Fallback to WebGL 1
  try {
    const gl1 = (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (gl1) {
      console.log('WebGL1 Context initialized.');
      return { gl: gl1, isWebGL2: false };
    }
  } catch (e) {
    console.warn('WebGL1 initialization failed:', e);
  }

  return null;
}
