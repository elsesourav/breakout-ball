import React, { useEffect, useRef } from 'react';
import { GraphicsEngineBridge } from './engine.bridge';
import { ParticleRenderer } from './engine.renderer';

export interface EngineCanvasProps {
  className?: string;
  style?: React.CSSProperties;
  maxParticles?: number;
  onReady?: (bridge: GraphicsEngineBridge) => void;
  interactive?: boolean;
}

export const EngineCanvas: React.FC<EngineCanvasProps> = ({
  className = 'w-full h-full',
  style,
  maxParticles = 20000,
  onReady,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bridgeRef = useRef<GraphicsEngineBridge | null>(null);
  const rendererRef = useRef<ParticleRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDestroyed = false;
    const bridge = new GraphicsEngineBridge();
    bridgeRef.current = bridge;

    let renderer: ParticleRenderer | null = null;
    let lastTime = performance.now();

    const initEngine = async () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(300, rect.width || window.innerWidth);
      const height = Math.max(300, rect.height || window.innerHeight);
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      await bridge.initialize(width, height, maxParticles);
      if (isDestroyed) {
        bridge.destroy();
        return;
      }

      renderer = new ParticleRenderer(canvas);
      rendererRef.current = renderer;
      renderer.updateViewport(width, height, dpr);

      if (onReady) {
        onReady(bridge);
      }

      // Initial ambient shockwave burst
      bridge.addBurst(width * 0.5, height * 0.45, 160, 480);

      // Animation Loop with visibility pause
      const loop = (currentTime: number) => {
        if (isDestroyed) return;

        const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
        lastTime = currentTime;

        if (document.visibilityState !== 'hidden') {
          bridge.update(dt);
          const { buffer, count } = bridge.getVertexDataView();
          renderer?.render(buffer, count);
        }

        animationFrameRef.current = requestAnimationFrame(loop);
      };

      lastTime = performance.now();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    initEngine();

    // Resize handler
    const handleResize = () => {
      if (!canvas || !rendererRef.current || !bridgeRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(300, rect.width || window.innerWidth);
      const height = Math.max(300, rect.height || window.innerHeight);
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      rendererRef.current.updateViewport(width, height, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Pointer Interaction Handling
    let isPointerDown = false;

    const handlePointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isPointerDown = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      bridge.setCursor(x, y, true);
      bridge.addBurst(x, y, 140, 600);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      bridge.setCursor(x, y, isPointerDown);
    };

    const handlePointerUp = () => {
      if (!interactive) return;
      isPointerDown = false;
      bridge.setCursor(-1000, -1000, false);
    };

    if (interactive) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointerleave', handlePointerUp);
    }

    return () => {
      isDestroyed = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointerleave', handlePointerUp);
      }
      rendererRef.current?.destroy();
      bridge.destroy();
    };
  }, [maxParticles, interactive, onReady]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        touchAction: 'none',
        ...style,
      }}
    />
  );
};
