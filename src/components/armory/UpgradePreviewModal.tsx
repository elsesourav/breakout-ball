import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Lock, Award, Sparkles } from 'lucide-react';
import { UpgradeDef, getUpgradeCost } from '../../constants/upgrades';
import { CoreIcon } from '../CoreIcon';
import { soundManager } from '../../utils/audio';
import { drawBallWithPreset } from '../../engine/draw/ballDrawers';
import { drawPaddleWithPreset } from '../../engine/draw/paddleDrawers';

interface UpgradePreviewModalProps {
  isOpen: boolean;
  upgrade: UpgradeDef | null;
  currentLevel: number;
  cores: number;
  onClose: () => void;
  onUpgrade: (id: string) => void;
  currentSkin?: string;
}

export const UpgradePreviewModal: React.FC<UpgradePreviewModalProps> = ({
  isOpen,
  upgrade,
  currentLevel,
  cores,
  onClose,
  onUpgrade,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isMax = upgrade ? currentLevel >= upgrade.maxLevel : false;
  const nextLevel = currentLevel + 1;
  const cost = upgrade ? getUpgradeCost(upgrade.baseCost, currentLevel) : 0;
  const canAfford = !isMax && cores >= cost;

  // Live Looping Canvas Animation for current vs upgraded preview
  useEffect(() => {
    if (!isOpen || !upgrade) return;

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

      // ── Grid & Split Divider Background ──────────────────────────────
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

      // Vertical Center Divider Line
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 8);
      ctx.lineTo(w / 2, h - 8);
      ctx.stroke();
      ctx.restore();

      // Side Centers
      const leftCenterX = w * 0.25;
      const rightCenterX = w * 0.75;
      const centerY = h * 0.52;

      // ── 1. BALL SIZE PREVIEW ─────────────────────────────────────────
      if (upgrade.id === 'ball_size') {
        const baseR = 19;
        const curR = baseR * (1 + (currentLevel - 1) * 0.08);
        const nextR = baseR * (1 + (isMax ? currentLevel - 1 : currentLevel) * 0.08);

        // Left: CURRENT Ball
        drawBallWithPreset(ctx, { x: leftCenterX, y: centerY, radius: curR }, 1, {
          animTick: tick,
          tier: currentLevel >= 5 ? 3 : currentLevel >= 3 ? 2 : 1,
        });

        // Right: UPGRADED Ball with Green Expansion Indicator Ring
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(rightCenterX, centerY, nextR + 4, 0, Math.PI * 2);
        ctx.stroke();

        // Pulsing expansion aura
        const auraR = nextR + 6 + Math.sin(tick * 3) * 2;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(rightCenterX, centerY, auraR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        drawBallWithPreset(ctx, { x: rightCenterX, y: centerY, radius: nextR }, 1, {
          animTick: tick,
          tier: (currentLevel + 1) >= 5 ? 3 : (currentLevel + 1) >= 3 ? 2 : 1,
        });
      }

      // ── 2. BALL SPEED PREVIEW (Continuous Velocity Race Loop) ───────
      else if (upgrade.id === 'ball_speed') {
        const laneTopY = h * 0.36;
        const laneBtmY = h * 0.68;
        const laneW = w - 70;
        const startX = 35;

        // Current speed trajectory
        const speed1 = 1.2 + (currentLevel - 1) * 0.16;
        const pos1 = (Math.sin(tick * speed1) * 0.5 + 0.5) * laneW;

        // Upgraded speed trajectory (+8% faster with speed streak)
        const speed2 = 1.2 + (isMax ? currentLevel - 1 : currentLevel) * 0.16;
        const pos2 = (Math.sin(tick * speed2) * 0.5 + 0.5) * laneW;

        // Lane dividers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(startX, laneTopY - 14, laneW, 28);
        ctx.fillRect(startX, laneBtmY - 14, laneW, 28);

        // Current Ball (Top Lane)
        drawBallWithPreset(ctx, { x: startX + pos1, y: laneTopY, radius: 12 }, 1, {
          animTick: tick,
        });

        // Upgraded Ball with Comet Trail (Bottom Lane)
        ctx.save();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
        const trailLen = 22;
        const dir = Math.cos(tick * speed2) > 0 ? -1 : 1;
        const grad = ctx.createLinearGradient(startX + pos2, laneBtmY, startX + pos2 + dir * trailLen, laneBtmY);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(startX + pos2, laneBtmY - 5, dir * trailLen, 10);
        ctx.restore();

        drawBallWithPreset(ctx, { x: startX + pos2, y: laneBtmY, radius: 12 }, 1, {
          animTick: tick * 1.5,
          tier: 2,
        });
      }

      // ── 3. BALL IMPACT POWER PREVIEW (Looping Kinetic Blast) ─────────
      else if (upgrade.id === 'ball_impact') {
        const loopT = (tick % 2.5) / 2.5; // 0 to 1 every 2.5s
        const strikePoint = 0.55;

        // Draw Target Armor Blocks
        const blockW = 44;
        const blockH = 22;
        const leftBlockX = leftCenterX - blockW / 2;
        const rightBlockX = rightCenterX - blockW / 2;
        const blockY = centerY + 18;

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(leftBlockX, blockY, blockW, blockH);
        ctx.strokeRect(leftBlockX, blockY, blockW, blockH);

        ctx.fillStyle = '#0f291e';
        ctx.strokeStyle = '#10b981';
        ctx.fillRect(rightBlockX, blockY, blockW, blockH);
        ctx.strokeRect(rightBlockX, blockY, blockW, blockH);

        // Falling Ball strike
        let ballY: number;
        if (loopT < strikePoint) {
          ballY = centerY - 35 + (loopT / strikePoint) * 35;
        } else {
          ballY = centerY + (1 - (loopT - strikePoint) / (1 - strikePoint)) * 8 - 8;
        }

        // Left (Normal Hit)
        drawBallWithPreset(ctx, { x: leftCenterX, y: ballY, radius: 13 }, 1, { animTick: tick });

        // Right (Heavy Impact with Blast Shockwave)
        drawBallWithPreset(ctx, { x: rightCenterX, y: ballY, radius: 13 }, 1, { animTick: tick, tier: 2 });

        if (loopT >= strikePoint && loopT <= strikePoint + 0.3) {
          const blastProg = (loopT - strikePoint) / 0.3;
          ctx.save();
          // Massive kinetic shockwave
          ctx.beginPath();
          ctx.arc(rightCenterX, blockY, 8 + blastProg * 35, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${1 - blastProg})`;
          ctx.lineWidth = 3 * (1 - blastProg);
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }
      }

      // ── 4. PADDLE WIDTH PREVIEW ──────────────────────────────────────
      else if (upgrade.id === 'paddle_width') {
        const curW = Math.min(130, 85 + (currentLevel - 1) * 9);
        const nextW = Math.min(150, 85 + (isMax ? currentLevel - 1 : currentLevel) * 9);

        // Left: CURRENT Paddle
        drawPaddleWithPreset(ctx, { x: leftCenterX, y: centerY, width: curW, height: 16, vx: 0, targetX: leftCenterX }, 1, {
          animTick: tick,
          widthLevel: currentLevel,
        });

        // Right: UPGRADED Paddle with Green Wingtips Extension Highlight
        drawPaddleWithPreset(ctx, { x: rightCenterX, y: centerY, width: nextW, height: 16, vx: 0, targetX: rightCenterX }, 1, {
          animTick: tick,
          widthLevel: currentLevel + 1,
        });

        // Green Extension Bracket Lines
        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        const leftWing = rightCenterX - nextW / 2;
        const rightWing = rightCenterX + nextW / 2;
        ctx.beginPath();
        ctx.moveTo(leftWing, centerY - 14);
        ctx.lineTo(leftWing, centerY + 14);
        ctx.moveTo(rightWing, centerY - 14);
        ctx.lineTo(rightWing, centerY + 14);
        ctx.stroke();
        ctx.restore();
      }

      // ── 5. PADDLE SPEED PREVIEW (Looping Thruster Glide) ─────────────
      else if (upgrade.id === 'paddle_speed') {
        const curSpeed = 1.0 + (currentLevel - 1) * 0.15;
        const nextSpeed = 1.0 + (isMax ? currentLevel - 1 : currentLevel) * 0.15;
        const glideSpan = 45;

        const leftOffset = Math.sin(tick * curSpeed) * glideSpan;
        const rightOffset = Math.sin(tick * nextSpeed) * glideSpan;

        drawPaddleWithPreset(ctx, { x: leftCenterX + leftOffset, y: centerY, width: 85, height: 15, vx: 0, targetX: leftCenterX }, 1, {
          animTick: tick,
          speedLevel: currentLevel,
        });

        drawPaddleWithPreset(ctx, { x: rightCenterX + rightOffset, y: centerY, width: 85, height: 15, vx: 0, targetX: rightCenterX }, 1, {
          animTick: tick * 1.4,
          speedLevel: currentLevel + 1,
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, upgrade, currentLevel, isMax]);

  if (!isOpen || !upgrade) return null;

  const handleUpgradeNow = () => {
    if (!canAfford) return;
    soundManager.play('click');
    onUpgrade(upgrade.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            backgroundColor: 'rgba(7, 12, 34, 0.96)',
            border: `1.5px solid ${upgrade.accentColor}60`,
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 25px ${upgrade.glowColor}`,
          }}
          className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 pb-3 flex items-center justify-between border-b border-cyan-500/20 bg-black/40">
            <div className="flex items-center gap-2.5">
              <div
                style={{
                  backgroundColor: `${upgrade.accentColor}20`,
                  border: `1px solid ${upgrade.accentColor}`,
                }}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-tech font-black text-xs"
              >
                {upgrade.symbol}
              </div>
              <div className="flex flex-col">
                <span className="font-tech text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                  KINETIC SPECIFICATION
                </span>
                <h3 className="font-display font-black text-sm text-white tracking-wide">
                  {upgrade.name}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Level Progress Indicator */}
          <div className="px-4 pt-3 flex items-center justify-between font-tech text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold uppercase text-[11px]">STATUS:</span>
              <span className="font-bold text-cyan-200">
                LEVEL {currentLevel}/{upgrade.maxLevel}
              </span>
            </div>
            {!isMax && (
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <span>NEXT: LVL {nextLevel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Side-by-Side Headings */}
          <div className="px-4 pt-2.5 grid grid-cols-2 gap-2 text-center font-tech text-[11px] font-bold">
            <div className="py-1 px-2 rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300">
              CURRENT (LVL {currentLevel})
            </div>
            <div className="py-1 px-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>UPGRADED ({isMax ? 'PEAK' : `LVL ${nextLevel}`})</span>
            </div>
          </div>

          {/* Canvas Live Comparison View (Continuous Looping Preview) */}
          <div className="p-4 pt-2">
            <div
              style={{
                border: '1.2px solid rgba(0, 247, 255, 0.25)',
                backgroundColor: 'rgba(3, 7, 20, 0.85)',
              }}
              className="w-full h-44 rounded-xl overflow-hidden relative shadow-inner"
            >
              <canvas ref={canvasRef} width={380} height={176} className="w-full h-full" />
            </div>
          </div>

          {/* Stat Delta Difference Banner */}
          <div className="px-4 pb-2">
            <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-500/25 flex items-center justify-between text-xs font-tech">
              <span className="text-slate-300 font-bold text-[11px]">{upgrade.statLabel(currentLevel)}</span>
              {!isMax ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shrink-0 ml-2">
                  NEXT: {upgrade.nextLabel(currentLevel)}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] shrink-0 ml-2">
                  MAX LEVEL
                </span>
              )}
            </div>
          </div>

          {/* Modal Footer: Balance + Instant Upgrade Confirmation */}
          <div className="p-4 pt-3 border-t border-cyan-500/20 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-tech text-xs">
              <CoreIcon size={14} glow variant="cyan" />
              <span className="text-slate-400 text-[11px]">CORES:</span>
              <span className="font-bold text-cyan-200">{cores.toLocaleString()}</span>
            </div>

            {!isMax ? (
              <button
                type="button"
                disabled={!canAfford}
                onClick={handleUpgradeNow}
                style={{
                  background: canAfford
                    ? `linear-gradient(135deg, ${upgrade.accentColor} 0%, #00f7ff 100%)`
                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: canAfford
                    ? `1.5px solid ${upgrade.accentColor}`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  color: canAfford ? '#000000' : '#64748b',
                  boxShadow: canAfford ? `0 0 16px ${upgrade.glowColor}` : 'none',
                }}
                className="px-4 py-2 rounded-xl font-tech font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>UPGRADE NOW</span>
                <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-[10px] text-white">
                  {cost} 💎
                </span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-tech font-bold text-xs flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                MAX LEVEL REACHED
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
