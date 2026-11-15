import { UpgradeDef } from '../../../constants/upgrades';
import { draw3DStardustCoreBall } from '../../../engine/draw/ballDrawers';

export function getPowerDuration(upgradeId: string, level: number): number {
  switch (upgradeId) {
    case 'expand_power':
      return 6.0 + (level - 1) * 0.8;
    case 'slowmo_power':
      return 4.0 + (level - 1) * 0.75;
    case 'laser_power':
      return 5.0 + (level - 1) * 1.0;
    case 'mega_power':
      return 5.0 + (level - 1) * 1.2;
    case 'multi_power':
      return 6.0 + (level - 1) * 1.5;
    case 'shield_power':
      return 8.0 + (level - 1) * 2.5;
    default:
      return 5.0 + (level - 1) * 1.0;
  }
}

/** Draw the actual gameplay manifestation of each power */
function drawActualPowerAction(
  ctx: CanvasRenderingContext2D,
  upgradeId: string,
  cx: number,
  cy: number,
  color: string,
  tick: number,
  isActive: boolean,
  isUpgraded: boolean
) {
  ctx.save();
  ctx.translate(cx, cy);

  switch (upgradeId) {
    case 'laser_power': {
      // ACTUAL IN-GAME LASER: Paddle with Twin Rail Blasters firing upward bolts
      const padW = 44;
      const padY = 22;

      // Base Paddle
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isActive ? color : '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-padW / 2, padY, padW, 8, 3);
      ctx.fill();
      ctx.stroke();

      if (isActive) {
        // Blaster Cannons
        const boltOffset = isUpgraded ? 4 : 2;
        [-13, 13].forEach((bx) => {
          ctx.fillStyle = color;
          ctx.fillRect(bx - 2, padY - 6, 4, 6);

          // Laser Bolts Firing Upward
          for (let i = 0; i < boltOffset; i++) {
            const boltY = padY - 12 - ((tick * 120 + i * 22) % 64);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fillRect(bx - 1.5, boltY, 3, 10);
          }
        });
      }
      break;
    }

    case 'expand_power': {
      // ACTUAL IN-GAME EXPAND: Paddle physical width expansion with energy tips
      const targetW = isActive ? (isUpgraded ? 68 : 54) : 34;
      const padY = 15;

      ctx.save();
      if (isActive) {
        ctx.shadowColor = color;
        ctx.shadowBlur = isUpgraded ? 14 : 9;
      }
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isActive ? color : '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-targetW / 2, padY, targetW, 9, 4);
      ctx.fill();
      ctx.stroke();

      if (isActive) {
        // Glowing cyan energy wings on edges
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-targetW / 2 + 2, padY + 1.5, 3, 6);
        ctx.fillRect(targetW / 2 - 5, padY + 1.5, 3, 6);
      }
      ctx.restore();
      break;
    }

    case 'slowmo_power': {
      // ACTUAL IN-GAME CHRONOS WARP: Ball inside a purple spacetime dilation field
      const ballSpeed = isActive ? 0.35 : 1.2;
      const orbX = Math.sin(tick * ballSpeed * 2.5) * 20;

      if (isActive) {
        // Concentric Time Dilation Rings
        for (let r = 1; r <= 3; r++) {
          const ringR = 12 + r * 7 + Math.sin(tick * 3 + r) * 2;
          ctx.strokeStyle = `rgba(183, 115, 255, ${0.45 / r})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(0, 5, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      draw3DStardustCoreBall(
        ctx,
        { x: orbX, y: 5, radius: 10 },
        {
          tier: 1,
          palette: {
            glow: isActive ? color : '#64748b',
            c1: '#ffffff',
            c2: isActive ? '#c084fc' : '#94a3b8',
            c3: isActive ? '#7e22ce' : '#334155',
          },
        }
      );
      break;
    }

    case 'mega_power': {
      // ACTUAL IN-GAME MEGA CORE: Massive incandescent ball shattering cyber blocks
      const isMega = isActive;
      const ballR = isMega ? (isUpgraded ? 16 : 13) : 9;
      const bY = 2;

      if (isMega) {
        // Solar Corona Flares
        ctx.save();
        ctx.shadowColor = '#ff5500';
        ctx.shadowBlur = 18;
        ctx.fillStyle = 'rgba(255, 170, 0, 0.25)';
        ctx.beginPath();
        ctx.arc(0, bY, ballR * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      draw3DStardustCoreBall(
        ctx,
        { x: 0, y: bY, radius: ballR },
        {
          tier: isMega ? 3 : 1,
          isMega,
        }
      );
      break;
    }

    case 'shield_power': {
      // ACTUAL IN-GAME FORCEFIELD: Emerald defense barrier beam deflecting balls
      const shieldY = 22;
      const ballY = 5 + Math.sin(tick * 4) * 10;

      if (isActive) {
        // Luminous Defensive Beam
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = isUpgraded ? 3.5 : 2.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(-34, shieldY);
        ctx.lineTo(34, shieldY);
        ctx.stroke();

        // Hex shield nodes
        [-24, 0, 24].forEach((hx) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(hx, shieldY, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // Ball above shield
      draw3DStardustCoreBall(
        ctx,
        { x: 0, y: ballY, radius: 8 },
        { tier: 1 }
      );
      break;
    }

    case 'multi_power': {
      // ACTUAL IN-GAME MULTI-BALL: 3 active game balls in formation flight
      const count = isActive ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const angle = tick * 2.8 + (i * Math.PI * 2) / count;
        const ox = count > 1 ? Math.cos(angle) * 16 : 0;
        const oy = count > 1 ? Math.sin(angle) * 8 : 4;

        draw3DStardustCoreBall(
          ctx,
          { x: ox, y: oy, radius: 7 },
          { tier: 1 }
        );
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Unified Synchronized Duration Countdown Loop:
 * Both bars count down simultaneously on the same master cycle timeline.
 * Current level expires first; upgraded level demonstrates additional active time.
 * When both end, holds briefly and loops together.
 */
export function renderPowerDurationPreview(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  upgrade: UpgradeDef,
  currentLevel: number,
  isMax: boolean,
  tick: number
): void {
  const leftLvl = currentLevel;
  const rightLvl = isMax ? currentLevel : currentLevel + 1;

  const leftDur = getPowerDuration(upgrade.id, leftLvl);
  const rightDur = getPowerDuration(upgrade.id, rightLvl);
  const maxDur = Math.max(leftDur, rightDur);

  // Master Synchronized Timeline: duration + 2.2s resting gap before looping again
  const gapDuration = 2.2;
  const cyclePeriod = maxDur + gapDuration;
  // Scaled time in seconds
  const cycleTime = (tick * 1.3) % cyclePeriod;

  const leftActive = cycleTime < leftDur;
  const rightActive = cycleTime < rightDur;

  const leftRemaining = Math.max(0, leftDur - cycleTime);
  const rightRemaining = Math.max(0, rightDur - cycleTime);

  const leftProgress = leftDur > 0 ? Math.max(0, leftRemaining / leftDur) : 0;
  const rightProgress = rightDur > 0 ? Math.max(0, rightRemaining / rightDur) : 0;

  const cx1 = w * 0.25;
  const cx2 = w * 0.75;
  const cy = h * 0.40;

  // 1. Draw Left Side (Current Gameplay Power)
  drawActualPowerAction(ctx, upgrade.id, cx1, cy, upgrade.accentColor, tick, leftActive, false);

  // 2. Draw Right Side (Upgraded Gameplay Power with Extended Duration)
  drawActualPowerAction(ctx, upgrade.id, cx2, cy, upgrade.accentColor, tick, rightActive, true);

  // 3. Draw Synchronized Looping Countdown Bars
  const drawTimerBar = (
    cx: number,
    totalDur: number,
    remaining: number,
    progress: number,
    isActive: boolean,
    isUpgraded: boolean
  ) => {
    const barW = 76;
    const barH = 5;
    const barX = cx - barW / 2;
    const barY = h - 26;

    // Track Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 2.5);
    ctx.fill();

    // Active Remaining Fill
    if (progress > 0) {
      ctx.fillStyle = isUpgraded ? '#10b981' : upgrade.accentColor;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = isActive ? 6 : 0;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * progress, barH, 2.5);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Dynamic Synchronized Countdown Seconds Text
    ctx.font = 'bold 9px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isActive ? (isUpgraded ? '#34d399' : '#e2e8f0') : '#64748b';

    let timeLabel: string;
    if (isActive) {
      timeLabel = `${remaining.toFixed(1)}s / ${totalDur.toFixed(1)}s`;
    } else {
      timeLabel = isUpgraded ? `+${(rightDur - leftDur).toFixed(1)}s BONUS` : 'EXPIRED';
    }

    ctx.fillText(timeLabel, cx, barY - 5);
  };

  drawTimerBar(cx1, leftDur, leftRemaining, leftProgress, leftActive, false);
  drawTimerBar(cx2, rightDur, rightRemaining, rightProgress, rightActive, true);
}
