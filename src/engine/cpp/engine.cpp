#include "engine.h"
#include <cmath>
#include <algorithm>
#include <cstdlib>

BreakoutEngine::BreakoutEngine()
    : worldWidth(1152.0f), worldHeight(2048.0f),
      blockWidth(48.0f), blockHeight(20.0f),
      remainingBreakable(0), combo(0),
      hasShield(false), isMegaBall(false),
      ballImpactLevel(1), baseBallRadius(10.0f),
      baseBallSpeed(720.0f) {}

void BreakoutEngine::init(float width, float height, float padW, float padH, float ballR, float speed, float bw, float bh) {
    worldWidth = width;
    worldHeight = height;
    blockWidth = bw;
    blockHeight = bh;
    baseBallRadius = ballR;
    baseBallSpeed = speed;

    paddle.width = padW;
    paddle.height = padH;
    paddle.x = width * 0.5f;
    paddle.y = height - padH * 3.5f;
    paddle.targetX = paddle.x;
    paddle.prevX = paddle.x;
    paddle.vx = 0.0f;
    paddle.maxSpeed = 800.0f;

    balls.clear();
    NativeBall mainBall;
    mainBall.x = paddle.x;
    mainBall.y = paddle.y - ballR - 4.0f;
    mainBall.prevX = mainBall.x;
    mainBall.prevY = mainBall.y;
    mainBall.vx = 0.0f;
    mainBall.vy = 0.0f;
    mainBall.radius = ballR;
    mainBall.baseSpeed = speed;
    mainBall.speed = speed;
    mainBall.isActive = false;
    mainBall.isMega = false;
    mainBall.warpCooldown = 0;
    mainBall.paddleCooldown = 0;
    mainBall.lastHitBlockIndex = -1;
    mainBall.lastHitBlockCooldown = 0;
    balls.push_back(mainBall);

    combo = 0;
    hasShield = false;
    isMegaBall = false;
    ballImpactLevel = 1;
    events.clear();
}

void BreakoutEngine::loadBlocks(const int* data, int count, float bw, float bh) {
    blocks.clear();
    remainingBreakable = 0;
    blocks.reserve(count);
    blockWidth = bw;
    blockHeight = bh;

    for (int i = 0; i < count; i++) {
        int col = data[i * 3];
        int row = data[i * 3 + 1];
        int hp = data[i * 3 + 2];

        NativeBlock b;
        b.col = col;
        b.row = row;
        b.x = col * bw;
        b.y = row * bh;
        b.w = bw;
        b.h = bh;
        b.health = hp;
        b.initialHealth = hp;
        b.isDead = false;
        b.hitAnim = 0.0f;
        b.counter = (hp == 8) ? 3 : 0;
        b.portalPairIndex = -1;
        b.portalPairId = 0;
        b.portalRechargeTimer = 0;

        if ((hp >= 1 && hp <= 5) || hp == 8) {
            remainingBreakable++;
        }
        blocks.push_back(b);
    }

    pairPortals();
}

void BreakoutEngine::pairPortals() {
    std::vector<int> portals;
    for (size_t i = 0; i < blocks.size(); i++) {
        if (blocks[i].health == 7) {
            blocks[i].portalPairIndex = -1;
            portals.push_back((int)i);
        }
    }

    // Pair adjacent portals in order of encounter
    for (size_t i = 0; i + 1 < portals.size(); i += 2) {
        int a = portals[i];
        int b = portals[i + 1];
        int pairId = (int)(i / 2) + 1;
        blocks[a].portalPairIndex = b;
        blocks[a].portalPairId = pairId;
        blocks[b].portalPairIndex = a;
        blocks[b].portalPairId = pairId;
    }
}

void BreakoutEngine::resetBall(float x, float y, float vx, float vy) {
    balls.clear();
    NativeBall b;
    b.x = x;
    b.y = y;
    b.prevX = x;
    b.prevY = y;
    b.vx = vx;
    b.vy = vy;
    b.radius = isMegaBall ? (baseBallRadius * 1.45f) : baseBallRadius;
    b.speed = std::hypot(vx, vy);
    if (b.speed < 0.1f) b.speed = baseBallSpeed;
    b.baseSpeed = baseBallSpeed;
    b.isActive = (std::abs(vx) > 0.001f || std::abs(vy) > 0.001f);
    b.isMega = isMegaBall;
    b.warpCooldown = 0;
    b.paddleCooldown = 0;
    b.lastHitBlockIndex = -1;
    b.lastHitBlockCooldown = 0;
    balls.push_back(b);
    combo = 0;
}

void BreakoutEngine::spawnExtraBalls(int extraCount) {
    if (balls.empty()) return;
    std::vector<NativeBall> newBalls;
    int maxAllowed = 8;
    float maxSpread = (32.0f * 3.14159265f) / 180.0f;

    std::vector<NativeBall> active;
    for (const auto& b : balls) {
        if (b.isActive) active.push_back(b);
    }
    if (active.empty()) return;

    for (const auto& b : active) {
        if ((int)(balls.size() + newBalls.size()) >= maxAllowed) break;
        float baseAngle = std::atan2(b.vy, b.vx);
        float spd = b.speed > 0.1f ? b.speed : baseBallSpeed;

        std::vector<float> offsets;
        if (extraCount <= 1) {
            offsets.push_back(maxSpread * 0.5f);
        } else {
            float step = (maxSpread * 2.0f) / (float)(extraCount - 1);
            for (int i = 0; i < extraCount; i++) {
                offsets.push_back(-maxSpread + i * step);
            }
        }

        for (float off : offsets) {
            if ((int)(balls.size() + newBalls.size()) >= maxAllowed) break;
            NativeBall nb = b;
            nb.vx = std::cos(baseAngle + off) * spd;
            nb.vy = std::sin(baseAngle + off) * spd;
            nb.speed = spd;
            nb.isActive = true;
            nb.warpCooldown = 0;
            nb.paddleCooldown = 0;
            nb.lastHitBlockIndex = -1;
            nb.lastHitBlockCooldown = 0;
            newBalls.push_back(nb);
        }
    }

    balls.insert(balls.end(), newBalls.begin(), newBalls.end());
}

void BreakoutEngine::setPaddleTarget(float targetX) {
    paddle.targetX = targetX;
}

void BreakoutEngine::setModifiers(int shieldActive, int megaActive, int impactLvl, float maxPadSpeed) {
    hasShield = (shieldActive != 0);
    isMegaBall = (megaActive != 0);
    ballImpactLevel = impactLvl > 0 ? impactLvl : 1;
    if (maxPadSpeed > 100.0f) paddle.maxSpeed = maxPadSpeed;

    for (auto& b : balls) {
        b.isMega = isMegaBall;
        b.radius = isMegaBall ? (baseBallRadius * 1.45f) : baseBallRadius;
    }
}

bool BreakoutEngine::resolvePaddleBounce(NativeBall& ball, float halfPadW, float prevBallY) {
    float padLeft = paddle.x - halfPadW;
    float padRight = paddle.x + halfPadW;
    float padTop = paddle.y;
    float padBottom = paddle.y + paddle.height;

    float closestPadX = std::max(padLeft, std::min(ball.x, padRight));
    float closestPadY = std::max(padTop, std::min(ball.y, padBottom));
    float distX = ball.x - closestPadX;
    float distY = ball.y - closestPadY;
    float padDistSq = distX * distX + distY * distY;

    bool crossedPaddleTop = (prevBallY <= padTop + ball.radius && ball.y + ball.radius >= padTop);
    bool withinPaddleWidth = (ball.x >= padLeft - ball.radius && ball.x <= padRight + ball.radius);
    bool isNearPaddle = (padDistSq <= ball.radius * ball.radius) || (crossedPaddleTop && withinPaddleWidth && ball.vy > 0.0f);
    bool isNotOnCooldown = (ball.paddleCooldown <= 0);

    if (!isNearPaddle || !isNotOnCooldown) return false;

    // Case 1: True Top Surface Hit
    bool isTopHit = (ball.vy > 0.0f) && (crossedPaddleTop || ball.y <= padTop + 4.0f);

    if (isTopHit) {
        float hitOffset = std::max(-1.0f, std::min(1.0f, (ball.x - paddle.x) / halfPadW));
        float currentSpeed = ball.speed > 0.1f ? ball.speed : baseBallSpeed;

        const float MIN_BOUNCE_ANGLE = 0.261799f; // 15 deg
        const float MAX_BASE_ANGLE = 1.18682f;   // 68 deg
        const float MAX_ALLOWED_ANGLE = 1.308996f; // 75 deg

        float deflectDir = (hitOffset != 0.0f)
            ? (hitOffset > 0.0f ? 1.0f : -1.0f)
            : (paddle.vx != 0.0f ? (paddle.vx > 0.0f ? 1.0f : -1.0f) : (ball.vx >= 0.0f ? 1.0f : -1.0f));

        float baseAngleMag = MIN_BOUNCE_ANGLE + std::abs(hitOffset) * (MAX_BASE_ANGLE - MIN_BOUNCE_ANGLE);
        float bounceAngle = deflectDir * baseAngleMag;

        float spin = paddle.vx * 0.28f;
        float rawVx = currentSpeed * std::sin(bounceAngle) + spin;
        float rawVy = -currentSpeed * std::cos(bounceAngle);

        float angleFromVert = std::atan2(rawVx, -rawVy);
        float finalAngleMag = std::abs(angleFromVert);
        float finalAngleSign = (angleFromVert != 0.0f) ? (angleFromVert > 0.0f ? 1.0f : -1.0f) : deflectDir;

        if (finalAngleMag < MIN_BOUNCE_ANGLE) finalAngleMag = MIN_BOUNCE_ANGLE;
        else if (finalAngleMag > MAX_ALLOWED_ANGLE) finalAngleMag = MAX_ALLOWED_ANGLE;

        float finalAngle = finalAngleSign * finalAngleMag;
        ball.vx = currentSpeed * std::sin(finalAngle);
        ball.vy = -currentSpeed * std::cos(finalAngle); // Always upwards

        ball.y = padTop - ball.radius - 1.0f;
        ball.paddleCooldown = 8;
        ball.lastHitBlockIndex = -1;

        NativeEvent ev;
        ev.type = 2; // paddle
        ev.blockIndex = -1;
        ev.hitX = ball.x;
        ev.hitY = padTop;
        ev.combo = 0;
        ev.source = 0;
        ev.epicenterX = 0;
        ev.epicenterY = 0;
        events.push_back(ev);
        return true;
    }

    // Case 2: South / Bottom Face Hit
    if (ball.y >= padBottom) {
        if (ball.vy < 0.0f) {
            ball.vy = std::abs(ball.vy);
            ball.y = padBottom + ball.radius + 1.0f;
            ball.paddleCooldown = 6;
            return true;
        }
        return false; // Falling away downward, let it drop cleanly
    }

    // Case 3: Lateral Flank Hit
    if (ball.y > padTop + 4.0f && ball.y < padBottom) {
        bool isLeft = (ball.x < paddle.x);
        if (isLeft) {
            ball.vx = -std::abs(ball.vx);
            if (paddle.vx < 0.0f) ball.vx += paddle.vx * 0.3f;
            ball.x = padLeft - ball.radius - 1.0f;
        } else {
            ball.vx = std::abs(ball.vx);
            if (paddle.vx > 0.0f) ball.vx += paddle.vx * 0.3f;
            ball.x = padRight + ball.radius + 1.0f;
        }
        if (ball.vy < 20.0f) ball.vy = std::max(50.0f, std::abs(ball.vy));
        ball.paddleCooldown = 6;
        return true;
    }

    return false;
}

int BreakoutEngine::handlePortalCollision(NativeBall& ball, NativeBlock& block, int blockIdx) {
    if (ball.warpCooldown > 0 || block.portalRechargeTimer > 0) return 0;

    int targetIdx = block.portalPairIndex;
    if (targetIdx >= 0 && targetIdx < (int)blocks.size()) {
        auto& target = blocks[targetIdx];
        if (target.health == 7 && !target.isDead) {
            float clearance = ball.radius + 8.0f;
            bool exitDown = (target.y < blockHeight * 2.0f) || (ball.vy > 0.0f);

            ball.x = std::max(ball.radius + 6.0f, std::min(worldWidth - ball.radius - 6.0f, target.x + target.w * 0.5f));
            ball.y = exitDown ? (target.y + target.h + clearance) : (target.y - clearance);
            ball.prevX = ball.x;
            ball.prevY = ball.y;
            ball.vy = exitDown ? std::abs(ball.vy) : -std::abs(ball.vy);
            ball.warpCooldown = 35;
            block.portalRechargeTimer = 180;
            target.portalRechargeTimer = 180;

            NativeEvent ev;
            ev.type = 6; // portal_warp
            ev.blockIndex = blockIdx;
            ev.hitX = block.x + block.w * 0.5f;
            ev.hitY = block.y + block.h * 0.5f;
            ev.combo = combo;
            ev.source = 0;
            ev.epicenterX = 0;
            ev.epicenterY = 0;
            events.push_back(ev);
            return 1; // Warp break
        }
    }
    return 0; // Continue pass-through
}

void BreakoutEngine::damageBlock(int blockIndex, int damage) {
    if (blockIndex < 0 || blockIndex >= (int)blocks.size()) return;
    auto& b = blocks[blockIndex];
    if (b.isDead) return;
    b.hitAnim = 1.0f;
    if (b.health >= 1 && b.health <= 5) {
        b.health = std::max(0, b.health - damage);
        if (b.health <= 0) {
            b.isDead = true;
            remainingBreakable = std::max(0, remainingBreakable - 1);
        }
    } else if (b.health == 8) {
        detonateEmpReactor(blockIndex);
    }
}

void BreakoutEngine::detonateEmpReactor(int bIdx) {
    if (bIdx < 0 || bIdx >= (int)blocks.size()) return;
    auto& centerBlock = blocks[bIdx];
    if (centerBlock.isDead) return;

    centerBlock.isDead = true;
    centerBlock.health = 0;
    remainingBreakable = std::max(0, remainingBreakable - 1);
    combo++;

    float hitCenterX = centerBlock.x + centerBlock.w * 0.5f;
    float hitCenterY = centerBlock.y + centerBlock.h * 0.5f;

    NativeEvent ev;
    ev.type = 7; // emp_explode
    ev.blockIndex = bIdx;
    ev.hitX = hitCenterX;
    ev.hitY = hitCenterY;
    ev.combo = combo;
    ev.source = 1; // emp
    ev.epicenterX = hitCenterX;
    ev.epicenterY = hitCenterY;
    events.push_back(ev);

    float blastRadius = blockWidth * 2.2f;
    float blastRadSq = blastRadius * blastRadius;

    std::vector<int> chainEmpIndices;

    for (size_t ob = 0; ob < blocks.size(); ob++) {
        if ((int)ob == bIdx || blocks[ob].isDead) continue;
        auto& other = blocks[ob];
        float ox = other.x + other.w * 0.5f;
        float oy = other.y + other.h * 0.5f;
        float dSq = (hitCenterX - ox) * (hitCenterX - ox) + (hitCenterY - oy) * (hitCenterY - oy);

        if (dSq <= blastRadSq) {
            if (other.health == 8) {
                chainEmpIndices.push_back((int)ob);
                continue;
            }

            if (other.health >= 1 && other.health <= 5) {
                other.health = 0;
                other.isDead = true;
                remainingBreakable = std::max(0, remainingBreakable - 1);
                combo++;
                NativeEvent dev;
                dev.type = 4; // block_destroy
                dev.blockIndex = (int)ob;
                dev.hitX = ox;
                dev.hitY = oy;
                dev.combo = combo;
                dev.source = 1;
                dev.epicenterX = hitCenterX;
                dev.epicenterY = hitCenterY;
                events.push_back(dev);
            }
        }
    }

    for (int chainIdx : chainEmpIndices) {
        detonateEmpReactor(chainIdx);
    }
}

void BreakoutEngine::update(int substeps) {
    events.clear();
    if (substeps < 1) substeps = 6;

    // 1. Snapshot previous positions for sub-frame interpolation
    paddle.prevX = paddle.x;
    for (auto& b : balls) {
        b.prevX = b.x;
        b.prevY = b.y;
    }

    // 2. Decrement portal recharge timers
    for (auto& blk : blocks) {
        if (blk.portalRechargeTimer > 0) blk.portalRechargeTimer--;
    }

    // 3. Move paddle with maxSpeed cap
    const float dt = 1.0f / 60.0f;
    const float maxStep = (paddle.maxSpeed > 100.0f ? paddle.maxSpeed : 800.0f) * dt;
    float dx = paddle.targetX - paddle.x;
    float dist = std::abs(dx);
    if (dist > 0.01f) {
        float step = dist >= maxStep ? ((dx > 0.0f ? 1.0f : -1.0f) * maxStep) : dx;
        paddle.vx = step / dt;
        paddle.x += step;
    } else {
        paddle.x = paddle.targetX;
        paddle.vx = 0.0f;
    }

    float halfPadW = paddle.width * 0.5f;
    if (paddle.x < halfPadW) {
        paddle.x = halfPadW;
        paddle.vx = 0.0f;
    } else if (paddle.x > worldWidth - halfPadW) {
        paddle.x = worldWidth - halfPadW;
        paddle.vx = 0.0f;
    }

    // 4. Update balls
    float subDt = 1.0f / (float)substeps;

    for (int bi = (int)balls.size() - 1; bi >= 0; bi--) {
        auto& ball = balls[bi];

        if (!ball.isActive) {
            ball.x = paddle.x;
            ball.y = paddle.y - ball.radius - 4.0f;
            continue;
        }

        if (ball.warpCooldown > 0) ball.warpCooldown--;
        if (ball.paddleCooldown > 0) ball.paddleCooldown--;
        if (ball.lastHitBlockCooldown > 0) {
            ball.lastHitBlockCooldown--;
            if (ball.lastHitBlockCooldown <= 0) ball.lastHitBlockIndex = -1;
        }

        std::vector<int> damagedThisTick;

        for (int step = 0; step < substeps; step++) {
            float prevBallY = ball.y;
            ball.x += ball.vx * subDt;
            ball.y += ball.vy * subDt;

            // Boundaries
            if (ball.x - ball.radius <= 0.0f) {
                ball.x = ball.radius;
                ball.vx = std::abs(ball.vx);
                NativeEvent ev = {1, -1, ball.x, ball.y, combo, 0, 0, 0};
                events.push_back(ev);
            } else if (ball.x + ball.radius >= worldWidth) {
                ball.x = worldWidth - ball.radius;
                ball.vx = -std::abs(ball.vx);
                NativeEvent ev = {1, -1, ball.x, ball.y, combo, 0, 0, 0};
                events.push_back(ev);
            }

            if (ball.y - ball.radius <= 0.0f) {
                ball.y = ball.radius;
                ball.vy = std::abs(ball.vy);
                NativeEvent ev = {1, -1, ball.x, ball.y, combo, 0, 0, 0};
                events.push_back(ev);
            }

            // Shield or Fall Out
            float shieldY = worldHeight - 35.0f;
            if (hasShield && ball.y + ball.radius >= shieldY && ball.vy > 0.0f) {
                ball.vy = -std::abs(ball.vy);
                ball.y = shieldY - ball.radius;
                NativeEvent ev = {8, -1, ball.x, shieldY, combo, 0, 0, 0};
                events.push_back(ev);
            } else if (ball.y - ball.radius >= worldHeight) {
                ball.isActive = false;
                int aliveCount = 0;
                for (const auto& ab : balls) if (ab.isActive) aliveCount++;
                if (aliveCount == 0) {
                    NativeEvent ev = {5, -1, ball.x, ball.y, combo, 0, 0, 0};
                    events.push_back(ev);
                }
                break;
            }

            // Paddle Collision
            if (resolvePaddleBounce(ball, halfPadW, prevBallY)) {
                combo = 0;
                continue;
            }

            // Block Collisions
            for (size_t b = 0; b < blocks.size(); b++) {
                auto& block = blocks[b];
                if (block.isDead) continue;
                // Quantum Portal in cooldown acts like nothing (intangible pass-through)
                if (block.health == 7 && (block.portalRechargeTimer > 0 || ball.warpCooldown > 0)) continue;

                if (std::find(damagedThisTick.begin(), damagedThisTick.end(), (int)b) != damagedThisTick.end()) continue;
                if (ball.lastHitBlockIndex == (int)b && ball.lastHitBlockCooldown > 0) continue;

                float closestX = std::max(block.x, std::min(ball.x, block.x + block.w));
                float closestY = std::max(block.y, std::min(ball.y, block.y + block.h));
                float distX = ball.x - closestX;
                float distY = ball.y - closestY;
                float distSq = distX * distX + distY * distY;

                if (distSq <= ball.radius * ball.radius) {
                    float hitCenterX = block.x + block.w * 0.5f;
                    float hitCenterY = block.y + block.h * 0.5f;

                    // Quantum Portal (7)
                    if (block.health == 7) {
                        int pRes = handlePortalCollision(ball, block, (int)b);
                        if (pRes == 1) break; // Warped
                        continue; // If in cooldown or portal did not warp, act like nothing (pass-through)
                    }

                    // Reflection normal
                    float nx = 0.0f, ny = 0.0f, penetration = 0.0f;
                    float dist = std::sqrt(distSq);
                    if (dist > 0.0001f) {
                        nx = distX / dist;
                        ny = distY / dist;
                        penetration = ball.radius - dist;
                    } else {
                        float dL = std::abs(ball.x - block.x);
                        float dR = std::abs(block.x + block.w - ball.x);
                        float dT = std::abs(ball.y - block.y);
                        float dB = std::abs(block.y + block.h - ball.y);
                        float minD = std::min({dL, dR, dT, dB});
                        if (minD == dT) { nx = 0.0f; ny = -1.0f; penetration = ball.radius + dT; }
                        else if (minD == dB) { nx = 0.0f; ny = 1.0f; penetration = ball.radius + dB; }
                        else if (minD == dL) { nx = -1.0f; ny = 0.0f; penetration = ball.radius + dL; }
                        else { nx = 1.0f; ny = 0.0f; penetration = ball.radius + dR; }
                    }

                    bool isBreakable = (block.health >= 1 && block.health <= 5) || block.health == 8;
                    if (!isMegaBall || !isBreakable) {
                        float dot = ball.vx * nx + ball.vy * ny;
                        if (dot < 0.0f) {
                            ball.vx -= 2.0f * dot * nx;
                            ball.vy -= 2.0f * dot * ny;
                        }
                        if (penetration > 0.0f) {
                            ball.x += nx * (penetration + 0.5f);
                            ball.y += ny * (penetration + 0.5f);
                        }

                        // Anti-horizontal trap
                        float currentSpeed = ball.speed > 0.1f ? ball.speed : baseBallSpeed;
                        float curSpd = std::hypot(ball.vx, ball.vy);
                        if (curSpd > 0.001f) {
                            ball.vx = (ball.vx / curSpd) * currentSpeed;
                            ball.vy = (ball.vy / curSpd) * currentSpeed;
                        }
                        float minVy = 0.22f * currentSpeed;
                        if (std::abs(ball.vy) < minVy) {
                            ball.vy = ball.vy >= 0.0f ? minVy : -minVy;
                            float nSpd = std::hypot(ball.vx, ball.vy);
                            if (nSpd > 0.001f) {
                                ball.vx = (ball.vx / nSpd) * currentSpeed;
                                ball.vy = (ball.vy / nSpd) * currentSpeed;
                            }
                        }
                    }

                    damagedThisTick.push_back((int)b);
                    ball.lastHitBlockIndex = (int)b;
                    ball.lastHitBlockCooldown = 4;
                    block.hitAnim = 1.0f;

                    // EMP Reactor (8)
                    if (block.health == 8) {
                        detonateEmpReactor((int)b);
                        break;
                    }

                    // Standard Breakable Blocks (1 - 5)
                    if (block.health >= 1 && block.health <= 5) {
                        int damage = isMegaBall ? block.health : 1;
                        block.health = std::max(0, block.health - damage);

                        float critChance = (float)(ballImpactLevel - 1) * 0.12f;
                        bool isCrit = !isMegaBall && critChance > 0.0f && (((float)rand() / (float)RAND_MAX) < critChance);

                        combo++;
                        if (block.health <= 0) {
                            block.isDead = true;
                            remainingBreakable = std::max(0, remainingBreakable - 1);
                            NativeEvent ev = {4, (int)b, hitCenterX, hitCenterY, combo, 0, 0, 0};
                            events.push_back(ev);
                        } else if (isCrit) {
                            NativeEvent ev = {9, (int)b, hitCenterX, hitCenterY, combo, 0, 0, 0};
                            events.push_back(ev);
                        } else {
                            NativeEvent ev = {3, (int)b, hitCenterX, hitCenterY, combo, 0, 0, 0};
                            events.push_back(ev);
                        }
                    } else {
                        NativeEvent ev = {1, (int)b, hitCenterX, hitCenterY, combo, 0, 0, 0};
                        events.push_back(ev);
                    }

                    break;
                }
            }
        }

        if (!ball.isActive && balls.size() > 1) {
            balls.erase(balls.begin() + bi);
        }
    }

    // Decay block hit flash
    for (auto& blk : blocks) {
        if (blk.hitAnim > 0.0f) blk.hitAnim = std::max(0.0f, blk.hitAnim - 0.1f);
    }
}

// Global engine instance for C-ABI exports
static BreakoutEngine g_engine;

extern "C" {

void engine_init(float width, float height, float padW, float padH, float ballR, float speed, float bw, float bh) {
    g_engine.init(width, height, padW, padH, ballR, speed, bw, bh);
}

void engine_load_blocks(const int* data, int count, float blockW, float blockH) {
    g_engine.loadBlocks(data, count, blockW, blockH);
}

void engine_pair_portals() {
    g_engine.pairPortals();
}

void engine_reset_ball(float x, float y, float vx, float vy) {
    g_engine.resetBall(x, y, vx, vy);
}

void engine_set_paddle_pos(float targetX) {
    g_engine.setPaddleTarget(targetX);
}

void engine_set_modifiers(int hasShield, int isMega, int impactLvl, float maxPaddleSpeed) {
    g_engine.setModifiers(hasShield, isMega, impactLvl, maxPaddleSpeed);
}

void engine_spawn_extra_balls(int count) {
    g_engine.spawnExtraBalls(count);
}

void engine_update(int substeps) {
    g_engine.update(substeps);
}

int engine_get_ball_count() {
    return (int)g_engine.balls.size();
}

void engine_get_ball_states(float* outBuffer) {
    // 10 floats per ball: x, y, prevX, prevY, vx, vy, radius, speed, isActive(0/1), isMega(0/1)
    int count = (int)g_engine.balls.size();
    for (int i = 0; i < count; i++) {
        const auto& b = g_engine.balls[i];
        outBuffer[i * 10 + 0] = b.x;
        outBuffer[i * 10 + 1] = b.y;
        outBuffer[i * 10 + 2] = b.prevX;
        outBuffer[i * 10 + 3] = b.prevY;
        outBuffer[i * 10 + 4] = b.vx;
        outBuffer[i * 10 + 5] = b.vy;
        outBuffer[i * 10 + 6] = b.radius;
        outBuffer[i * 10 + 7] = b.speed;
        outBuffer[i * 10 + 8] = b.isActive ? 1.0f : 0.0f;
        outBuffer[i * 10 + 9] = b.isMega ? 1.0f : 0.0f;
    }
}

void engine_get_paddle_state(float* outBuffer) {
    // 6 floats: x, y, prevX, width, height, vx
    outBuffer[0] = g_engine.paddle.x;
    outBuffer[1] = g_engine.paddle.y;
    outBuffer[2] = g_engine.paddle.prevX;
    outBuffer[3] = g_engine.paddle.width;
    outBuffer[4] = g_engine.paddle.height;
    outBuffer[5] = g_engine.paddle.vx;
}

int engine_get_block_count() {
    return (int)g_engine.blocks.size();
}

void engine_get_block_states(float* outBuffer) {
    // 4 floats per block: health, isDead(0/1), hitAnim, portalRechargeTimer
    int count = (int)g_engine.blocks.size();
    for (int i = 0; i < count; i++) {
        const auto& b = g_engine.blocks[i];
        outBuffer[i * 4 + 0] = (float)b.health;
        outBuffer[i * 4 + 1] = b.isDead ? 1.0f : 0.0f;
        outBuffer[i * 4 + 2] = b.hitAnim;
        outBuffer[i * 4 + 3] = (float)b.portalRechargeTimer;
    }
}

int engine_get_remaining_breakable() {
    return g_engine.remainingBreakable;
}

int engine_get_combo() {
    return g_engine.combo;
}

int engine_get_events_v2(float* outBuffer, int maxEvents) {
    // 8 floats per event: type, blockIndex, hitX, hitY, combo, source, epicenterX, epicenterY
    int count = std::min(maxEvents, g_engine.getEventCount());
    for (int i = 0; i < count; i++) {
        const auto& ev = g_engine.events[i];
        outBuffer[i * 8 + 0] = (float)ev.type;
        outBuffer[i * 8 + 1] = (float)ev.blockIndex;
        outBuffer[i * 8 + 2] = ev.hitX;
        outBuffer[i * 8 + 3] = ev.hitY;
        outBuffer[i * 8 + 4] = (float)ev.combo;
        outBuffer[i * 8 + 5] = (float)ev.source;
        outBuffer[i * 8 + 6] = ev.epicenterX;
        outBuffer[i * 8 + 7] = ev.epicenterY;
    }
    g_engine.clearEvents();
    return count;
}

void engine_damage_block(int blockIndex, int damage) {
    g_engine.damageBlock(blockIndex, damage);
}

void engine_detonate_emp(int blockIndex) {
    g_engine.detonateEmpReactor(blockIndex);
}

}
