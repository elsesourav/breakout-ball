/**
 * Ball Trajectory Matrix Power-Up / Guideline Calculator
 * 
 * Provides 8-ball pool-style predictive trajectory guidance:
 * - Accurately raycasts incoming ball trajectory towards the paddle, including wall reflections
 * - Detects paddle collision feasibility at projected intercept point
 * - Computes outgoing deflection angle using the exact paddle angular deflection physics
 * - Scales preview distance from 280px (Level 1 base) to 1400px (Level 8 max)
 * - Smoothly fades in when descending into range and slowly dissolves when moving away
 */

import { BallState, PaddleState } from './types';

export interface TrajectorySegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TrajectoryGuideline {
  visible: boolean;
  alpha: number;
  isHit: boolean;
  hitX: number;
  hitY: number;
  incomingSegments: TrajectorySegment[];
  outgoingSegments: TrajectorySegment[];
  outVx: number;
  outVy: number;
  maxDistance: number;
}

/**
 * Calculates max trajectory preview distance based on ball_trajectory upgrade level (1-8)
 * Default (Level 1): 600px (generous slide distance)
 * Max (Level 8): 1800px (exactly 3x default distance across top blocks)
 */
export function getTrajectoryMaxDistance(level: number): number {
  const lvlClamped = Math.max(1, Math.min(8, level));
  return 600 + (lvlClamped - 1) * (1200 / 7);
}

/**
 * Computes complete predictive incoming and outgoing trajectory
 */
export function calculateTrajectoryGuideline(
  ball: BallState,
  paddle: PaddleState,
  arenaW: number,
  arenaH: number,
  upgradeLevel: number,
  currentFadeAlpha: number = 0,
  dt: number = 1 / 60
): { guideline: TrajectoryGuideline; nextFadeAlpha: number } {
  const maxDistance = getTrajectoryMaxDistance(upgradeLevel);
  const halfPadW = paddle.width / 2;
  const padTop = paddle.y;
  const ballR = ball.radius || 10;
  const minX = ballR;
  const maxX = arenaW - ballR;

  // Raycast Incoming Ball Trajectory (downwards towards padTop - ballR)
  const targetY = padTop - ballR;
  let curX = ball.x;
  let curY = ball.y;
  let curVx = ball.vx;
  const curVy = Math.max(0.001, ball.vy); // Ensure positive downward velocity for raycast
  const incomingSegments: TrajectorySegment[] = [];

  let safety = 6;
  while (safety-- > 0 && curY < targetY) {
    const timeToTarget = (targetY - curY) / curVy;

    let timeToWall = Infinity;
    let wallX = curX;

    if (curVx > 0.001) {
      timeToWall = (maxX - curX) / curVx;
      wallX = maxX;
    } else if (curVx < -0.001) {
      timeToWall = (minX - curX) / curVx;
      wallX = minX;
    }

    if (timeToWall < timeToTarget) {
      // Wall collision first
      const nextY = curY + curVy * timeToWall;
      incomingSegments.push({ x1: curX, y1: curY, x2: wallX, y2: nextY });
      curX = wallX;
      curY = nextY;
      curVx = -curVx; // Wall bounce
    } else {
      // Arrives at paddle plane
      const finalX = curX + curVx * timeToTarget;
      incomingSegments.push({ x1: curX, y1: curY, x2: finalX, y2: targetY });
      curX = finalX;
      curY = targetY;
      break;
    }
  }

  const hitX = curX;
  const hitY = targetY;

  // Collision feasibility check on paddle
  const padLeft = paddle.x - halfPadW;
  const padRight = paddle.x + halfPadW;
  const isHit = hitX >= padLeft - ballR && hitX <= padRight + ballR;

  // Determine target alpha:
  // Slowly and gracefully appears when descending within distance range
  let targetAlpha = 0;
  const distToPaddle = padTop - ballR - ball.y;
  const isDescending = ball.isActive && ball.vy > 0 && distToPaddle > 0;

  if (isDescending && distToPaddle <= maxDistance) {
    const fadeRange = Math.min(280, maxDistance * 0.45);
    const distFactor = Math.min(1.0, Math.max(0.0, (maxDistance - distToPaddle) / fadeRange));
    // When paddle collision is possible, full brightness lock; when paddle is misaligned, subtle guidance
    targetAlpha = isHit ? distFactor : distFactor * 0.25;
  } else {
    // When ball moves away from paddle (vy <= 0) or is outside range, target alpha is 0 (dissolves slowly)
    targetAlpha = 0;
  }

  // Smooth gradual fade-in (lerpSpeed 4.0) and slow graceful fade-out dissolution (lerpSpeed 2.2)
  const lerpSpeed = targetAlpha < currentFadeAlpha ? 2.2 : 4.0;
  const nextFadeAlpha = Math.max(0.0, Math.min(1.0, currentFadeAlpha + (targetAlpha - currentFadeAlpha) * Math.min(1.0, dt * lerpSpeed)));

  if (nextFadeAlpha < 0.01 || !ball.isActive) {
    return {
      guideline: {
        visible: false,
        alpha: 0,
        isHit: false,
        hitX: paddle.x,
        hitY: padTop,
        incomingSegments: [],
        outgoingSegments: [],
        outVx: 0,
        outVy: 0,
        maxDistance,
      },
      nextFadeAlpha: 0,
    };
  }

  // Compute Outgoing Reflected Trajectory using identical paddle angular deflection physics
  const outgoingSegments: TrajectorySegment[] = [];
  let outVx = 0;
  let outVy = -Math.abs(ball.vy);

  if (isHit) {
    const hitOffset = Math.max(-1, Math.min(1, (hitX - paddle.x) / halfPadW));
    const currentSpeed = ball.speed || Math.hypot(ball.vx, ball.vy) || 720;

    const MIN_BOUNCE_ANGLE = (15 * Math.PI) / 180;
    const MAX_BASE_ANGLE = (68 * Math.PI) / 180;
    const MAX_ALLOWED_ANGLE = (75 * Math.PI) / 180;

    const deflectDir =
      hitOffset !== 0
        ? Math.sign(hitOffset)
        : Math.sign(paddle.vx) || Math.sign(curVx) || 1;

    const baseAngleMag = MIN_BOUNCE_ANGLE + Math.abs(hitOffset) * (MAX_BASE_ANGLE - MIN_BOUNCE_ANGLE);
    const bounceAngle = deflectDir * baseAngleMag;

    const spin = paddle.vx * 0.28;
    const rawVx = currentSpeed * Math.sin(bounceAngle) + spin;
    const rawVy = -currentSpeed * Math.cos(bounceAngle);

    const angleFromVertical = Math.atan2(rawVx, -rawVy);
    let finalAngleMag = Math.abs(angleFromVertical);
    const finalAngleSign = Math.sign(angleFromVertical) || deflectDir;

    if (finalAngleMag < MIN_BOUNCE_ANGLE) {
      finalAngleMag = MIN_BOUNCE_ANGLE;
    } else if (finalAngleMag > MAX_ALLOWED_ANGLE) {
      finalAngleMag = MAX_ALLOWED_ANGLE;
    }

    const finalAngle = finalAngleSign * finalAngleMag;
    outVx = currentSpeed * Math.sin(finalAngle);
    outVy = -currentSpeed * Math.cos(finalAngle);

    // Raycast Outgoing Path (upwards into arena)
    const outgoingLength = Math.min(650, 220 + (upgradeLevel - 1) * 55);
    const dirLen = Math.hypot(outVx, outVy);
    const nx = outVx / dirLen;
    const ny = outVy / dirLen;

    let outCurX = hitX;
    let outCurY = hitY;
    let outCurNx = nx;
    let outCurNy = ny;
    let remainingDist = outgoingLength;

    let outSafety = 4;
    while (outSafety-- > 0 && remainingDist > 0) {
      // Check wall intersection
      let distToWall = Infinity;
      let nextWallX = outCurX;

      if (outCurNx > 0.001) {
        const t = (maxX - outCurX) / outCurNx;
        if (t > 0) { distToWall = t; nextWallX = maxX; }
      } else if (outCurNx < -0.001) {
        const t = (minX - outCurX) / outCurNx;
        if (t > 0) { distToWall = t; nextWallX = minX; }
      }

      if (distToWall < remainingDist) {
        // Wall bounce on outgoing line
        const segY = outCurY + outCurNy * distToWall;
        outgoingSegments.push({ x1: outCurX, y1: outCurY, x2: nextWallX, y2: segY });
        remainingDist -= distToWall;
        outCurX = nextWallX;
        outCurY = segY;
        outCurNx = -outCurNx; // Wall bounce
      } else {
        // Terminate outgoing ray
        const segX = outCurX + outCurNx * remainingDist;
        const segY = outCurY + outCurNy * remainingDist;
        outgoingSegments.push({ x1: outCurX, y1: outCurY, x2: segX, y2: segY });
        break;
      }
    }
  }

  return {
    guideline: {
      visible: true,
      alpha: nextFadeAlpha,
      isHit,
      hitX,
      hitY,
      incomingSegments,
      outgoingSegments,
      outVx,
      outVy,
      maxDistance,
    },
    nextFadeAlpha,
  };
}
