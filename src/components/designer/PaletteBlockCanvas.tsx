import React, { useRef, useEffect } from 'react';
import { draw3DBlock } from '../../utils/helpers';

export const PaletteBlockCanvas: React.FC<{
  toolId: number;
  isSelected: boolean;
}> = ({ toolId, isSelected }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (toolId === 0) {
      // Sleek Cyber Eraser Tile
      const w = canvas.width;
      const h = canvas.height;
      const pad = 2;

      ctx.fillStyle = isSelected ? '#2a0614' : '#14040c';
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.fill();

      // Subtle diagonal red hazard stripes
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.clip();
      ctx.strokeStyle = isSelected ? 'rgba(255, 0, 85, 0.35)' : 'rgba(255, 0, 85, 0.15)';
      ctx.lineWidth = 2;
      for (let x = -h; x < w + h; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = isSelected ? '#ff0055' : 'rgba(255, 0, 85, 0.4)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.stroke();

      // Crossed laser beams
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const cx = w / 2;
      const cy = h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 6);
      ctx.lineTo(cx + 8, cy + 6);
      ctx.moveTo(cx + 8, cy - 6);
      ctx.lineTo(cx - 8, cy + 6);
      ctx.stroke();
    } else {
      // Exact in-game 3D Armored Slab block
      const padX = 3;
      const padY = 2;
      draw3DBlock(
        ctx,
        padX,
        padY,
        canvas.width - padX * 2,
        canvas.height - padY * 2,
        toolId,
        1.0,
        undefined,
        undefined,
        undefined,
        toolId === 7 ? 1 : undefined
      );
    }
  }, [toolId, isSelected]);

  return (
    <canvas
      ref={canvasRef}
      width={88}
      height={48}
      className="w-full h-full object-contain block pointer-events-none"
    />
  );
};

export const BlockIconPreview: React.FC<{
  toolId: number;
  pairId?: number;
  width?: number;
  height?: number;
}> = ({ toolId, pairId, width = 54, height = 28 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (toolId === 0) {
      const w = canvas.width;
      const h = canvas.height;
      const pad = 2;

      ctx.fillStyle = '#1e0510';
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.fill();

      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, 4);
      ctx.stroke();

      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      const cx = w / 2;
      const cy = h / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 6);
      ctx.lineTo(cx + 7, cy + 6);
      ctx.moveTo(cx + 7, cy - 6);
      ctx.lineTo(cx - 7, cy + 6);
      ctx.stroke();
    } else {
      draw3DBlock(
        ctx,
        2,
        2,
        canvas.width - 4,
        canvas.height - 4,
        toolId,
        1.0,
        undefined,
        undefined,
        undefined,
        pairId ?? (toolId === 7 ? 1 : undefined)
      );
    }
  }, [toolId, pairId]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="inline-block shrink-0 shadow-md rounded"
    />
  );
};
