import { BallState, PaddleState, BlockEngineState, CollisionEvent, PhysicsWorldConfig } from './types';

export function pairPortals(blocks: BlockEngineState[], portalIndices: number[]): void {
  const pairMap = new Map<number, number[]>();
  portalIndices.forEach((idx, i) => {
    const pid = blocks[idx].portalPairId ?? Math.floor(i / 2) + 1;
    blocks[idx].portalPairId = pid;
    if (!pairMap.has(pid)) pairMap.set(pid, []);
    pairMap.get(pid)!.push(idx);
  });

  const orphanIndices: number[] = [];
  pairMap.forEach((indices) => {
    if (indices.length >= 2) {
      for (let p = 0; p < indices.length; p++) {
        const nextIdx = indices[(p + 1) % indices.length];
        blocks[indices[p]].portalPairIndex = nextIdx;
      }
    } else if (indices.length === 1) {
      orphanIndices.push(indices[0]);
    }
  });

  for (let o = 0; o < orphanIndices.length - 1; o += 2) {
    const idxA = orphanIndices[o];
    const idxB = orphanIndices[o + 1];
    blocks[idxA].portalPairIndex = idxB;
    blocks[idxB].portalPairIndex = idxA;
    const fallbackPairId = Math.min(4, Math.floor(o / 2) + 1);
    blocks[idxA].portalPairId = fallbackPairId;
    blocks[idxB].portalPairId = fallbackPairId;
  }

  if (orphanIndices.length % 2 === 1) {
    const loneIdx = orphanIndices[orphanIndices.length - 1];
    blocks[loneIdx].portalPairIndex = undefined;
  }
}

export function resolvePaddleBounce(
  ball: BallState,
  paddle: PaddleState,
  halfPadW: number,
  config: PhysicsWorldConfig,
  prevBallY: number,
  events: CollisionEvent[]
): boolean {
  const padLeft = paddle.x - halfPadW;
  const padRight = paddle.x + halfPadW;
  const padTop = paddle.y;
  const padBottom = paddle.y + paddle.height;

  const closestPadX = Math.max(padLeft, Math.min(ball.x, padRight));
  const closestPadY = Math.max(padTop, Math.min(ball.y, padBottom));
  const padDistSq = (ball.x - closestPadX) ** 2 + (ball.y - closestPadY) ** 2;

  const crossedPaddleTop = prevBallY <= padTop + ball.radius && ball.y + ball.radius >= padTop;
  const withinPaddleWidth = ball.x >= padLeft - ball.radius && ball.x <= padRight + ball.radius;
  const isNearPaddle = padDistSq <= ball.radius ** 2 || (crossedPaddleTop && withinPaddleWidth && ball.vy > 0);
  const isNotOnCooldown = !ball.paddleCooldown || ball.paddleCooldown <= 0;

  if (!isNearPaddle || !isNotOnCooldown) return false;

  // Case 1: True Top Hit - Ball strikes the top surface of the paddle from above
  const isTopHit = ball.vy > 0 && (crossedPaddleTop || ball.y <= padTop + 4);

  if (isTopHit) {
    const hitOffset = Math.max(-1, Math.min(1, (ball.x - paddle.x) / halfPadW));
    const currentSpeed = ball.speed || config.ballSpeed;

    const MIN_BOUNCE_ANGLE = (15 * Math.PI) / 180;
    const MAX_BASE_ANGLE = (68 * Math.PI) / 180;
    const MAX_ALLOWED_ANGLE = (75 * Math.PI) / 180;

    const deflectDir =
      hitOffset !== 0
        ? Math.sign(hitOffset)
        : Math.sign(paddle.vx) || Math.sign(ball.vx) || 1;

    const baseAngleMag = MIN_BOUNCE_ANGLE + Math.abs(hitOffset) * (MAX_BASE_ANGLE - MIN_BOUNCE_ANGLE);
    const bounceAngle = deflectDir * baseAngleMag;

    const spin = paddle.vx * 0.28;
    const rawVx = currentSpeed * Math.sin(bounceAngle) + spin;
    const rawVy = -currentSpeed * Math.cos(bounceAngle);

    let angleFromVertical = Math.atan2(rawVx, -rawVy);
    let finalAngleMag = Math.abs(angleFromVertical);
    const finalAngleSign = Math.sign(angleFromVertical) || deflectDir;

    if (finalAngleMag < MIN_BOUNCE_ANGLE) {
      finalAngleMag = MIN_BOUNCE_ANGLE;
    } else if (finalAngleMag > MAX_ALLOWED_ANGLE) {
      finalAngleMag = MAX_ALLOWED_ANGLE;
    }

    const finalAngle = finalAngleSign * finalAngleMag;
    ball.vx = currentSpeed * Math.sin(finalAngle);
    ball.vy = -currentSpeed * Math.cos(finalAngle); // Upward reflection

    ball.y = padTop - ball.radius - 1;
    ball.paddleCooldown = 8;
    ball.lastHitBlockIndex = undefined;

    events.push({
      type: 'paddle',
      blockIndex: -1,
      hitX: ball.x,
      hitY: padTop,
      combo: 0,
    });
    return true;
  }

  // Case 2: South / Bottom Face Hit - Ball is below the paddle
  if (ball.y >= padBottom) {
    if (ball.vy < 0) {
      // Moving upwards from below -> bounce downwards back into bottom abyss
      ball.vy = Math.abs(ball.vy);
      ball.y = padBottom + ball.radius + 1;
      ball.paddleCooldown = 6;
      return true;
    }
    // If ball.vy > 0, it's already falling downwards past the paddle -> do not intercept, let it fall cleanly
    return false;
  }

  // Case 3: Lateral / Flank Hit - Ball touches the left or right side while ball.y > padTop + 4
  if (ball.y > padTop + 4 && ball.y < padBottom) {
    const isLeftFlank = ball.x < paddle.x;
    if (isLeftFlank) {
      ball.vx = -Math.abs(ball.vx);
      if (paddle.vx < 0) ball.vx += paddle.vx * 0.3;
      ball.x = padLeft - ball.radius - 1;
    } else {
      ball.vx = Math.abs(ball.vx);
      if (paddle.vx > 0) ball.vx += paddle.vx * 0.3;
      ball.x = padRight + ball.radius + 1;
    }
    // Never force vy upward! If falling, continue downward
    if (ball.vy < 20) ball.vy = Math.max(50, Math.abs(ball.vy));
    ball.paddleCooldown = 6;
    return true;
  }

  return false;
}

export function handlePortalCollision(
  ball: BallState,
  block: BlockEngineState,
  blocks: BlockEngineState[],
  b: number,
  config: PhysicsWorldConfig,
  events: CollisionEvent[],
  combo: number
): 'continue' | 'break' | 'reflect' {
  if (ball.warpCooldown && ball.warpCooldown > 0) return 'continue';
  if (block.portalRechargeTimer && block.portalRechargeTimer > 0) return 'continue';

  // Immediate warp on touch: does not require 50% penetration; never bounces like titanium
  if (
    block.portalPairIndex !== undefined &&
    blocks[block.portalPairIndex] &&
    blocks[block.portalPairIndex].health === 7 &&
    !blocks[block.portalPairIndex].isDead
  ) {
    const targetPortal = blocks[block.portalPairIndex];
    if (typeof targetPortal.x === 'number' && typeof targetPortal.y === 'number') {
      const clearance = ball.radius + 8;
      const exitDown = targetPortal.y < config.blockHeight * 2 || ball.vy > 0;
      ball.x = Math.max(
        ball.radius + 6,
        Math.min(config.width - ball.radius - 6, targetPortal.x + targetPortal.w / 2)
      );
      ball.y = exitDown ? targetPortal.y + targetPortal.h + clearance : targetPortal.y - clearance;
      ball.prevX = ball.x;
      ball.prevY = ball.y;
      ball.vy = exitDown ? Math.abs(ball.vy) : -Math.abs(ball.vy);
      ball.warpCooldown = 35;
      block.portalRechargeTimer = 180;
      targetPortal.portalRechargeTimer = 180;

      events.push({
        type: 'portal_warp',
        blockIndex: b,
        hitX: block.x + block.w / 2,
        hitY: block.y + block.h / 2,
        combo,
      });
      return 'break';
    }
  }

  // If lone portal or no active pair, pass through safely without bouncing like titanium
  return 'continue';
}

export function detonateEmpExplosion(
  blocks: BlockEngineState[],
  b: number,
  config: PhysicsWorldConfig,
  events: CollisionEvent[],
  state: { remainingBreakable: number; combo: number }
): void {
  const block = blocks[b];
  if (!block || block.isDead) return;

  block.isDead = true;
  state.remainingBreakable = Math.max(0, state.remainingBreakable - 1);
  const hitCenterX = block.x + block.w / 2;
  const hitCenterY = block.y + block.h / 2;

  events.push({
    type: 'emp_explode',
    blockIndex: b,
    hitX: hitCenterX,
    hitY: hitCenterY,
    combo: ++state.combo,
    source: 'emp',
    epicenterX: hitCenterX,
    epicenterY: hitCenterY,
  });

  const blastRadius = config.blockWidth * 2.4;
  const blastSq = blastRadius * blastRadius;

  for (let ob = 0; ob < blocks.length; ob++) {
    const other = blocks[ob];
    if (other.isDead || other.health === 6 || other.health === 7) continue;
    const ox = other.x + other.w / 2;
    const oy = other.y + other.h / 2;
    const dSq = (ox - hitCenterX) ** 2 + (oy - hitCenterY) ** 2;

    if (dSq <= blastSq) {
      if (other.health === 8) {
        detonateEmpExplosion(blocks, ob, config, events, state);
        continue;
      }
      if (other.health >= 1 && other.health <= 5) {
        other.health = 0;
        other.isDead = true;
        state.remainingBreakable = Math.max(0, state.remainingBreakable - 1);
        events.push({
          type: 'block_destroy',
          blockIndex: ob,
          hitX: ox,
          hitY: oy,
          combo: ++state.combo,
          source: 'emp',
          epicenterX: hitCenterX,
          epicenterY: hitCenterY,
        });
      }
    }
  }
}
