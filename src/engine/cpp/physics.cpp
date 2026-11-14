#include "physics.h"
#include <cmath>
#include <algorithm>

CollisionResult checkCircleAABB(
    float cx, float cy, float cr,
    float vx, float vy,
    float bx, float by, float bw, float bh,
    int blockIndex
) {
    CollisionResult res;
    res.collided = false;
    res.side = SIDE_NONE;
    res.normalX = 0.0f;
    res.normalY = 0.0f;
    res.penetration = 0.0f;
    res.blockIndex = blockIndex;

    // Find closest point on AABB to circle center
    float closestX = std::max(bx, std::min(cx, bx + bw));
    float closestY = std::max(by, std::min(cy, by + bh));

    float distX = cx - closestX;
    float distY = cy - closestY;
    float distSq = distX * distX + distY * distY;

    if (distSq <= cr * cr) {
        res.collided = true;
        float dist = std::sqrt(distSq);

        if (dist > 0.0001f) {
            res.normalX = distX / dist;
            res.normalY = distY / dist;
            res.penetration = cr - dist;
        } else {
            // Ball center is inside the box; push out along dominant velocity direction
            res.normalX = (vx > 0) ? -1.0f : 1.0f;
            res.normalY = (vy > 0) ? -1.0f : 1.0f;
            res.penetration = cr;
        }

        // Determine dominant collision side for game callbacks
        float overlapLeft = (cx + cr) - bx;
        float overlapRight = (bx + bw) - (cx - cr);
        float overlapTop = (cy + cr) - by;
        float overlapBottom = (by + bh) - (cy - cr);

        float minOverlapX = std::min(overlapLeft, overlapRight);
        float minOverlapY = std::min(overlapTop, overlapBottom);

        if (std::abs(minOverlapX - minOverlapY) < 2.0f && closestX == bx || closestX == bx + bw) {
            res.side = SIDE_CORNER;
        } else if (minOverlapX < minOverlapY) {
            res.side = (overlapLeft < overlapRight) ? SIDE_LEFT : SIDE_RIGHT;
            res.normalX = (overlapLeft < overlapRight) ? -1.0f : 1.0f;
            res.normalY = 0.0f;
        } else {
            res.side = (overlapTop < overlapBottom) ? SIDE_TOP : SIDE_BOTTOM;
            res.normalX = 0.0f;
            res.normalY = (overlapTop < overlapBottom) ? -1.0f : 1.0f;
        }
    }

    return res;
}

CollisionResult checkPaddleCollision(
    float ballX, float ballY, float ballR,
    float ballVx, float ballVy,
    float padX, float padY, float padW, float padH,
    float padVx
) {
    CollisionResult res;
    res.collided = false;
    res.side = SIDE_NONE;
    res.normalX = 0.0f;
    res.normalY = -1.0f;
    res.penetration = 0.0f;
    res.blockIndex = -1;

    // Paddle bounding box
    float padLeft = padX - padW * 0.5f;
    float padRight = padX + padW * 0.5f;
    float padTop = padY;
    float padBottom = padY + padH;

    // Check if ball intersects paddle
    float closestX = std::max(padLeft, std::min(ballX, padRight));
    float closestY = std::max(padTop, std::min(ballY, padBottom));

    float distX = ballX - closestX;
    float distY = ballY - closestY;
    float distSq = distX * distX + distY * distY;

    // Only bounce if ball is falling towards paddle (vy > 0)
    if (distSq <= ballR * ballR && ballVy > 0) {
        res.collided = true;
        res.side = SIDE_TOP;
        res.normalX = 0.0f;
        res.normalY = -1.0f;
        res.penetration = std::max(0.0f, (ballY + ballR) - padTop);
    }

    return res;
}
