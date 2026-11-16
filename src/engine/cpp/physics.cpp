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
            // Circle center inside box; resolve along shallowest axis
            float dLeft = std::abs(cx - bx);
            float dRight = std::abs(bx + bw - cx);
            float dTop = std::abs(cy - by);
            float dBottom = std::abs(by + bh - cy);
            float minD = std::min({dLeft, dRight, dTop, dBottom});

            if (minD == dTop) {
                res.normalX = 0.0f; res.normalY = -1.0f; res.penetration = cr + dTop;
            } else if (minD == dBottom) {
                res.normalX = 0.0f; res.normalY = 1.0f; res.penetration = cr + dBottom;
            } else if (minD == dLeft) {
                res.normalX = -1.0f; res.normalY = 0.0f; res.penetration = cr + dLeft;
            } else {
                res.normalX = 1.0f; res.normalY = 0.0f; res.penetration = cr + dRight;
            }
        }
    }

    return res;
}
