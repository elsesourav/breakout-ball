#ifndef BLACKHOLE_H
#define BLACKHOLE_H

#include <vector>
#include <cmath>

struct BlackHoleParticle {
    float x;
    float y;
    float angle;
    float distance;
    float speed;
    float size;
    float alpha;
    int colorTone; // 0: Cyan, 1: Violet, 2: Magenta, 3: Hot White
};

struct SuctionStar {
    float x;
    float y;
    float size;
    float alpha;
    float speed;
    float twinkleSpeed;
};

class BlackHoleSingularity {
public:
    float centerX;
    float centerY;
    float eventHorizonRadius;
    float accretionDiskRadius;
    float gravitationalConstant;
    float rotationSpeed;
    float animTick;

    std::vector<BlackHoleParticle> accretionParticles;

    BlackHoleSingularity();
    void init(float cx, float cy, float horizonR, float accretionR, int particleCount = 48);
    void update(float dt);
    void applySuctionToStar(SuctionStar& star, float worldWidth, float worldHeight, float dt);
};

#endif // BLACKHOLE_H
