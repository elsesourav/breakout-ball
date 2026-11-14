#include "engine.h"
#include <cmath>
#include <algorithm>

BreakoutEngine::BreakoutEngine()
    : worldWidth(1152.0f), worldHeight(2048.0f),
      remainingBreakable(0), combo(0), isBallActive(false) {}

void BreakoutEngine::init(float width, float height, float padW, float padH, float ballR, float speed) {
    worldWidth = width;
    worldHeight = height;

    paddle.width = padW;
    paddle.height = padH;
    paddle.x = width * 0.5f;
    paddle.y = height - padH * 3.5f;
    paddle.targetX = paddle.x;
    paddle.prevX = paddle.x;
    paddle.vx = 0.0f;

    ball.radius = ballR;
    ball.baseSpeed = speed;
    ball.currentSpeed = speed;
    ball.x = paddle.x;
    ball.y = paddle.y - ballR - 4.0f;
    ball.vx = 0.0f;
    ball.vy = 0.0f;

    combo = 0;
    isBallActive = false;
    events.clear();
}

void BreakoutEngine::loadBlocks(const int* data, int count, float blockW, float blockH) {
    blocks.clear();
    remainingBreakable = 0;
    blocks.reserve(count);

    for (int i = 0; i < count; i++) {
        int col = data[i * 3];
        int row = data[i * 3 + 1];
        int hp = data[i * 3 + 2];

        NativeBlock b;
        b.col = col;
        b.row = row;
        b.x = col * blockW;
        b.y = row * blockH;
        b.w = blockW;
        b.h = blockH;
        b.health = hp;
        b.initialHealth = hp;
        b.isDead = false;

        if (hp >= 1 && hp <= 5) {
            remainingBreakable++;
        }
        blocks.push_back(b);
    }
}

void BreakoutEngine::resetBall(float x, float y, float vx, float vy) {
    ball.x = x;
    ball.y = y;
    ball.vx = vx;
    ball.vy = vy;
    ball.currentSpeed = std::sqrt(vx * vx + vy * vy);
    if (ball.currentSpeed < 0.1f) ball.currentSpeed = ball.baseSpeed;
    isBallActive = (std::abs(vx) > 0.001f || std::abs(vy) > 0.001f);
    combo = 0;
}

void BreakoutEngine::setPaddleTarget(float targetX) {
    paddle.targetX = targetX;
}

void BreakoutEngine::update(int substeps) {
    events.clear();
    if (substeps < 1) substeps = 4;

    // 1. Smooth paddle movement
    paddle.prevX = paddle.x;
    paddle.vx = (paddle.targetX - paddle.x) * 0.35f;
    paddle.x += paddle.vx;

    float halfPadW = paddle.width * 0.5f;
    if (paddle.x < halfPadW) {
        paddle.x = halfPadW;
        paddle.vx = 0.0f;
    } else if (paddle.x > worldWidth - halfPadW) {
        paddle.x = worldWidth - halfPadW;
        paddle.vx = 0.0f;
    }

    if (!isBallActive) {
        ball.x = paddle.x;
        ball.y = paddle.y - ball.radius - 4.0f;
        return;
    }

    // 2. Sub-step simulation loop
    float subDt = 1.0f / (float)substeps;
    float subVx = ball.vx * subDt;
    float subVy = ball.vy * subDt;

    for (int step = 0; step < substeps; step++) {
        ball.x += subVx;
        ball.y += subVy;

        // Boundary Left
        if (ball.x - ball.radius <= 0.0f) {
            ball.x = ball.radius;
            ball.vx = std::abs(ball.vx);
            subVx = ball.vx * subDt;
            NativeEvent ev = {1, -1, ball.x, ball.y, combo};
            events.push_back(ev);
        }
        // Boundary Right
        else if (ball.x + ball.radius >= worldWidth) {
            ball.x = worldWidth - ball.radius;
            ball.vx = -std::abs(ball.vx);
            subVx = ball.vx * subDt;
            NativeEvent ev = {1, -1, ball.x, ball.y, combo};
            events.push_back(ev);
        }

        // Boundary Top
        if (ball.y - ball.radius <= 0.0f) {
            ball.y = ball.radius;
            ball.vy = std::abs(ball.vy);
            subVy = ball.vy * subDt;
            NativeEvent ev = {1, -1, ball.x, ball.y, combo};
            events.push_back(ev);
        }

        // Boundary Bottom (Lava / Fall Out)
        if (ball.y - ball.radius >= worldHeight) {
            isBallActive = false;
            NativeEvent ev = {5, -1, ball.x, ball.y, combo};
            events.push_back(ev);
            break;
        }

        // Paddle Collision Check
        CollisionResult padCol = checkPaddleCollision(
            ball.x, ball.y, ball.radius,
            ball.vx, ball.vy,
            paddle.x, paddle.y, paddle.width, paddle.height,
            paddle.vx
        );

        if (padCol.collided) {
            // Curvature calculation
            float hitOffset = (ball.x - paddle.x) / halfPadW;
            hitOffset = std::max(-1.0f, std::min(1.0f, hitOffset));

            const float maxBounceAngle = 1.0821f; // ~62 degrees
            float bounceAngle = hitOffset * maxBounceAngle;

            // Paddle spin impulse from movement
            float spin = paddle.vx * 0.25f;

            float speed = ball.currentSpeed;
            float newVx = speed * std::sin(bounceAngle) + spin;
            float newVy = -speed * std::cos(bounceAngle);

            // Clamp vertical speed so the ball always moves upward with good pace
            float minVy = -speed * 0.35f;
            if (newVy > minVy) newVy = minVy;

            // Re-normalize to maintain controlled speed
            float curLen = std::sqrt(newVx * newVx + newVy * newVy);
            if (curLen > 0.001f) {
                ball.vx = (newVx / curLen) * speed;
                ball.vy = (newVy / curLen) * speed;
            } else {
                ball.vx = 0.0f;
                ball.vy = -speed;
            }

            subVx = ball.vx * subDt;
            subVy = ball.vy * subDt;
            ball.y = paddle.y - ball.radius - 1.0f;

            combo = 0; // Reset combo streak on paddle touch
            NativeEvent ev = {2, -1, ball.x, paddle.y, combo};
            events.push_back(ev);
            continue;
        }

        // Block Collisions Check
        for (size_t bIdx = 0; bIdx < blocks.size(); bIdx++) {
            NativeBlock& block = blocks[bIdx];
            if (block.isDead) continue;

            CollisionResult bCol = checkCircleAABB(
                ball.x, ball.y, ball.radius,
                ball.vx, ball.vy,
                block.x, block.y, block.w, block.h,
                (int)bIdx
            );

            if (bCol.collided) {
                // Vector reflection across normal: v' = v - 2(v . n)n
                float dot = ball.vx * bCol.normalX + ball.vy * bCol.normalY;
                ball.vx -= 2.0f * dot * bCol.normalX;
                ball.vy -= 2.0f * dot * bCol.normalY;

                // Push ball out of block
                ball.x += bCol.normalX * (bCol.penetration + 0.5f);
                ball.y += bCol.normalY * (bCol.penetration + 0.5f);

                subVx = ball.vx * subDt;
                subVy = ball.vy * subDt;

                float hitX = block.x + block.w * 0.5f;
                float hitY = block.y + block.h * 0.5f;

                if (block.health >= 1 && block.health <= 5) {
                    block.health--;
                    combo++;
                    if (block.health <= 0) {
                        block.isDead = true;
                        remainingBreakable--;
                        NativeEvent ev = {4, (int)bIdx, hitX, hitY, combo};
                        events.push_back(ev);
                    } else {
                        NativeEvent ev = {3, (int)bIdx, hitX, hitY, combo};
                        events.push_back(ev);
                    }
                } else {
                    // Indestructible block (health == 6)
                    NativeEvent ev = {1, (int)bIdx, hitX, hitY, combo};
                    events.push_back(ev);
                }

                break; // One block collision per substep prevents double hits
            }
        }
    }
}

// Global engine instance for C-ABI exports
static BreakoutEngine g_engine;

extern "C" {

void engine_init(float width, float height, float padW, float padH, float ballR, float speed) {
    g_engine.init(width, height, padW, padH, ballR, speed);
}

void engine_load_blocks(const int* data, int count, float blockW, float blockH) {
    g_engine.loadBlocks(data, count, blockW, blockH);
}

void engine_reset_ball(float x, float y, float vx, float vy) {
    g_engine.resetBall(x, y, vx, vy);
}

void engine_set_paddle_pos(float targetX) {
    g_engine.setPaddleTarget(targetX);
}

void engine_update(int substeps) {
    g_engine.update(substeps);
}

void engine_get_ball_state(float* outBuffer) {
    outBuffer[0] = g_engine.ball.x;
    outBuffer[1] = g_engine.ball.y;
    outBuffer[2] = g_engine.ball.vx;
    outBuffer[3] = g_engine.ball.vy;
    outBuffer[4] = g_engine.ball.currentSpeed;
}

void engine_get_paddle_state(float* outBuffer) {
    outBuffer[0] = g_engine.paddle.x;
    outBuffer[1] = g_engine.paddle.y;
    outBuffer[2] = g_engine.paddle.width;
    outBuffer[3] = g_engine.paddle.height;
    outBuffer[4] = g_engine.paddle.vx;
}

int engine_get_block_count() {
    return (int)g_engine.blocks.size();
}

void engine_get_block_state(int index, int* outBuffer) {
    if (index >= 0 && index < (int)g_engine.blocks.size()) {
        const auto& b = g_engine.blocks[index];
        outBuffer[0] = b.health;
        outBuffer[1] = b.isDead ? 1 : 0;
        outBuffer[2] = b.initialHealth;
    }
}

int engine_get_remaining_breakable() {
    return g_engine.remainingBreakable;
}

int engine_get_combo() {
    return g_engine.combo;
}

int engine_get_events(int* outBuffer, int maxEvents) {
    int count = std::min(maxEvents, g_engine.getEventCount());
    for (int i = 0; i < count; i++) {
        const auto& ev = g_engine.events[i];
        outBuffer[i * 5 + 0] = ev.type;
        outBuffer[i * 5 + 1] = ev.blockIndex;
        outBuffer[i * 5 + 2] = (int)ev.hitX;
        outBuffer[i * 5 + 3] = (int)ev.hitY;
        outBuffer[i * 5 + 4] = ev.combo;
    }
    g_engine.clearEvents();
    return count;
}

}
