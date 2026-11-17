/**
 * Ball Trajectory Matrix Power-Up / V-Type Guideline Calculator
 * 
 * Accurately implements V-Type incoming & outgoing trajectory guidance:
 * - Only active in active gameplay (strictly disabled before launch / at rest on paddle)
 * - Detection radius scaled by power upgrade level (Level 1: 550px -> Level 8: 1650px, 3x)
 * - Checks ball position and velocity vector (x, y, vx, vy)
 * - Verifies velocity direction is aimed to collide with the paddle
 * - When under the radius AND feasible to collide with paddle, renders the complete V-type line:
 *   1. Incoming ray from ball down to paddle contact point (including wall bounces)
 *   2. Impact reticle / vertex on the paddle
 *   3. Outgoing deflection ray bouncing off paddle back up into arena
 * - As the power is upgraded, both the incoming radius and outgoing line length expand ("more big")
 * - Smoothly fades out when ball moves away or trajectory misses the paddle
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
  detectionRadius: number;
  outgoingLength: number;
}

/**
 * Calculates detection radius based on ball_trajectory upgrade level (1-8)
 * Default (Level 1): 600px
 * Max (Level 8): 1800px (exactly 3x default distance across top blocks)
 */
export function getTrajectoryDetectionRadius(level: number): number {
  const lvlClamped = Math.max(1, Math.min(8, level));
  return 600 + (lvlClamped - 1) * (1200 / 7);
}

/**
 * Calculates outgoing deflection ray length based on upgrade level (1-8)
 * Default (Level 1): 360px
 * Max (Level 8): 1080px (exactly 3x default line length)
 */
export function getTrajectoryOutgoingLength(level: number): number {
  const lvlClamped = Math.max(1, Math.min(8, level));
  return 360 + (lvlClamped - 1) * (720 / 7);
}

// Backwards compatibility alias
export const getTrajectoryMaxDistance = getTrajectoryDetectionRadius;

/**
 * Computes complete V-type predictive trajectory (incoming + outgoing).
 * Strictly requires active in-flight gameplay, descent towards paddle,
 * position under detection radius, and velocity direction aligned to collide with paddle.
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
  const detectionRadius = getTrajectoryDetectionRadius(upgradeLevel);
  const outgoingLength = getTrajectoryOutgoingLength(upgradeLevel);
  const halfPadW = paddle.width / 2;
  const padLeft = paddle.x - halfPadW;
  const padRight = paddle.x + halfPadW;
  const padTop = paddle.y;
  const ballR = ball.radius || 10;
  const minX = ballR;
  const maxX = arenaW - ballR;
  const targetY = padTop - ballR;

  // 1. Guard against non-gameplay states: ball resting on paddle or inactive before launch
  const isRestingOnPaddle =
    !ball.isActive ||
    Math.hypot(ball.vx, ball.vy) < 0.1 ||
    (ball.y >= targetY - 4 && ball.vy < 0.1);

  if (isRestingOnPaddle) {
    return {
      guideline: {
        visible: false,
        alpha: 0,
        isHit: false,
        hitX: paddle.x,
        hitY: targetY,
        incomingSegments: [],
        outgoingSegments: [],
        outVx: 0,
        outVy: 0,
        detectionRadius,
        outgoingLength,
      },
      nextFadeAlpha: 0,
    };
  }

  // 2. Velocity direction check: ball must be actively descending towards paddle plane
  const isDescending = ball.vy > 0.1;
  const closestPadX = Math.max(padLeft, Math.min(padRight, ball.x));
  const distToPaddle = Math.hypot(ball.x - closestPadX, targetY - ball.y);

  // 3. Radius check: ball must be under the upgrade level's detection radius
  const isUnderRadius = ball.y < targetY && distToPaddle <= detectionRadius;

  if (!isDescending || !isUnderRadius) {
    const lerpSpeed = 4.0;
    const nextFadeAlpha = Math.max(0.0, currentFadeAlpha - dt * lerpSpeed);
    return {
      guideline: {
        visible: false,
        alpha: 0,
        isHit: false,
        hitX: paddle.x,
        hitY: targetY,
        incomingSegments: [],
        outgoingSegments: [],
        outVx: 0,
        outVy: 0,
        detectionRadius,
        outgoingLength,
      },
      nextFadeAlpha,
    };
  }

  // 4. Raycast Incoming Path from (ball.x, ball.y) to paddle plane targetY
  const curVy = ball.vy;
  let curX = ball.x;
  let curY = ball.y;
  let curVx = ball.vx;
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
      const nextY = curY + curVy * timeToWall;
      incomingSegments.push({ x1: curX, y1: curY, x2: wallX, y2: nextY });
      curX = wallX;
      curY = nextY;
      curVx = -curVx; // Wall reflection
    } else {
      const finalX = curX + curVx * timeToTarget;
      incomingSegments.push({ x1: curX, y1: curY, x2: finalX, y2: targetY });
      curX = finalX;
      curY = targetY;
      break;
    }
  }

  const hitX = curX;
  const hitY = targetY;

  // 5. Paddle Collision Feasibility Check: velocity direction must collide with paddle
  const isHit = hitX >= padLeft - ballR * 0.4 && hitX <= padRight + ballR * 0.4;

  // Only draw the V-type line when velocity direction correctly intercepts the paddle
  if (!isHit) {
    const lerpSpeed = 4.0;
    const nextFadeAlpha = Math.max(0.0, currentFadeAlpha - dt * lerpSpeed);
    return {
      guideline: {
        visible: false,
        alpha: 0,
        isHit: false,
        hitX,
        hitY,
        incomingSegments: [],
        outgoingSegments: [],
        outVx: 0,
        outVy: 0,
        detectionRadius,
        outgoingLength,
      },
      nextFadeAlpha,
    };
  }

  // 6. Alpha Calculation: instant high-visibility onset (0.80) when collision aligns, smoothly reaching 1.0
  const targetAlpha = 1.0;
  const baselineAlpha = currentFadeAlpha < 0.80 ? 0.80 : currentFadeAlpha;
  const lerpSpeed = 12.0;
  const nextFadeAlpha = Math.max(
    0.0,
    Math.min(1.0, baselineAlpha + (targetAlpha - baselineAlpha) * Math.min(1.0, dt * lerpSpeed))
  );

  // 7. Compute Outgoing Deflected Ray (the 2nd arm of the V)
  const outgoingSegments: TrajectorySegment[] = [];
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

  const spin = (paddle.vx || 0) * 0.28;
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
  const outVx = currentSpeed * Math.sin(finalAngle);
  const outVy = -currentSpeed * Math.cos(finalAngle);

  // Raycast Outgoing Path (upward into arena, expanding with upgrade level)
  const dirLen = Math.hypot(outVx, outVy) || 1;
  const outNx = outVx / dirLen;
  const outNy = outVy / dirLen;

  let outCurX = hitX;
  let outCurY = hitY;
  let outCurNx = outNx;
  let outCurNy = outNy;
  let remainingDist = outgoingLength;

  let outSafety = 5;
  while (outSafety-- > 0 && remainingDist > 0) {
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
      const segY = outCurY + outCurNy * distToWall;
      outgoingSegments.push({ x1: outCurX, y1: outCurY, x2: nextWallX, y2: segY });
      remainingDist -= distToWall;
      outCurX = nextWallX;
      outCurY = segY;
      outCurNx = -outCurNx; // Wall reflection
    } else {
      const segX = outCurX + outCurNx * remainingDist;
      const segY = outCurY + outCurNy * remainingDist;
      outgoingSegments.push({ x1: outCurX, y1: outCurY, x2: segX, y2: segY });
      break;
    }
  }

  return {
    guideline: {
      visible: true,
      alpha: nextFadeAlpha,
      isHit: true,
      hitX,
      hitY,
      incomingSegments,
      outgoingSegments,
      outVx,
      outVy,
      detectionRadius,
      outgoingLength,
    },
    nextFadeAlpha,
  };
}
