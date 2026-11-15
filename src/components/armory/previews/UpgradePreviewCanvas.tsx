import React, { useRef, useEffect } from 'react';
import { UpgradeDef } from '../../../constants/upgrades';
import {
  renderBallSizePreview,
  renderBallSpeedPreview,
  renderBallImpactPreview,
} from './renderBallPreviews';
import {
  renderPaddleWidthPreview,
  renderPaddleSpeedPreview,
} from './renderPaddlePreviews';

interface UpgradePreviewCanvasProps {
  upgrade: UpgradeDef;
  currentLevel: number;
  isMax: boolean;
}

export const UpgradePreviewCanvas: React.FC<UpgradePreviewCanvasProps> = ({
  upgrade,
  currentLevel,
  isMax,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      tick += 0.035;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Cyber Grid Backdrop
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Vertical Center Split Divider Line
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 8);
      ctx.lineTo(w / 2, h - 8);
      ctx.stroke();
      ctx.restore();

      // 3. Delegate to Specific Upgrade Drawer
      switch (upgrade.id) {
        case 'ball_size':
          renderBallSizePreview(ctx, w, h, currentLevel, isMax, tick);
          break;
        case 'ball_speed':
          renderBallSpeedPreview(ctx, w, h, currentLevel, isMax, tick);
          break;
        case 'ball_impact':
          renderBallImpactPreview(ctx, w, h, currentLevel, isMax, tick);
          break;
        case 'paddle_width':
          renderPaddleWidthPreview(ctx, w, h, currentLevel, isMax, tick);
          break;
        case 'paddle_speed':
          renderPaddleSpeedPreview(ctx, w, h, currentLevel, isMax, tick);
          break;
        default:
          break;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [upgrade, currentLevel, isMax]);

  return (
    <div
      style={{
        border: '1.2px solid rgba(0, 247, 255, 0.25)',
        backgroundColor: 'rgba(3, 7, 20, 0.85)',
      }}
      className="w-full h-44 rounded-xl overflow-hidden relative shadow-inner"
    >
      <canvas ref={canvasRef} width={380} height={176} className="w-full h-full" />
    </div>
  );
};
