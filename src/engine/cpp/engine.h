#ifndef ENGINE_H
#define ENGINE_H

#include "physics.h"
#include <vector>

struct NativeBlock {
    float x;
    float y;
    float w;
    float h;
    int col;
    int row;
    int health;
    int initialHealth;
    bool isDead;
};

struct NativeBall {
    float x;
    float y;
    float vx;
    float vy;
    float radius;
    float baseSpeed;
    float currentSpeed;
};

struct NativePaddle {
    float x;
    float y;
    float width;
    float height;
    float vx;
    float prevX;
    float targetX;
};

struct NativeEvent {
    int type; // 1: wall, 2: paddle, 3: block damage, 4: block destroyed, 5: bottom lost
    int blockIndex;
    float hitX;
    float hitY;
    int combo;
};

class BreakoutEngine {
public:
    float worldWidth;
    float worldHeight;
    NativeBall ball;
    NativePaddle paddle;
    std::vector<NativeBlock> blocks;
    std::vector<NativeEvent> events;

    int remainingBreakable;
    int combo;
    bool isBallActive;

    BreakoutEngine();

    void init(float width, float height, float padW, float padH, float ballR, float speed);
    void loadBlocks(const int* data, int count, float blockW, float blockH);
    void resetBall(float x, float y, float vx, float vy);
    void setPaddleTarget(float targetX);
    void update(int substeps);

    int getEventCount() const { return (int)events.size(); }
    void clearEvents() { events.clear(); }
};

#endif // ENGINE_H
