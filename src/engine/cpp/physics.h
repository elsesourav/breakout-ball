#ifndef PHYSICS_H
#define PHYSICS_H

#include <cmath>
#include <algorithm>

struct Vector2 {
    float x;
    float y;

    Vector2() : x(0), y(0) {}
    Vector2(float _x, float _y) : x(_x), y(_y) {}

    Vector2 operator+(const Vector2& o) const { return Vector2(x + o.x, y + o.y); }
    Vector2 operator-(const Vector2& o) const { return Vector2(x - o.x, y - o.y); }
    Vector2 operator*(float s) const { return Vector2(x * s, y * s); }
    float lengthSq() const { return x * x + y * y; }
    float length() const { return std::sqrt(x * x + y * y); }
    Vector2 normalized() const {
        float l = length();
        return (l > 0.0001f) ? Vector2(x / l, y / l) : Vector2(0, 0);
    }
};

enum CollisionSide {
    SIDE_NONE = 0,
    SIDE_LEFT = 1,
    SIDE_RIGHT = 2,
    SIDE_TOP = 3,
    SIDE_BOTTOM = 4,
    SIDE_CORNER = 5
};

struct CollisionResult {
    bool collided;
    CollisionSide side;
    float normalX;
    float normalY;
    float penetration;
    int blockIndex;
};

// Continuous swept & AABB-circle collision detection
CollisionResult checkCircleAABB(
    float cx, float cy, float cr,
    float vx, float vy,
    float bx, float by, float bw, float bh,
    int blockIndex
);

// Advanced paddle curvature collision with angular deflection
CollisionResult checkPaddleCollision(
    float ballX, float ballY, float ballR,
    float ballVx, float ballVy,
    float padX, float padY, float padW, float padH,
    float padVx
);

#endif // PHYSICS_H
